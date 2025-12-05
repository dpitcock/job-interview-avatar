import type { Config } from '@/lib/config';
import config from '@/lib/config';
import type { LLMMessage, LLMResponse, RAGContext } from '@/types';

/**
 * Abstract LLM Provider interface
 */
export interface LLMProvider {
    generate(messages: LLMMessage[], context?: RAGContext): Promise<LLMResponse>;
    stream(
        messages: LLMMessage[],
        context?: RAGContext
    ): AsyncGenerator<string, void, unknown>;
}

/**
 * Ollama Provider (Local)
 */
export class OllamaProvider implements LLMProvider {
    private baseUrl: string;
    private model: string;

    constructor(options?: { baseUrl?: string; model?: string }) {
        this.baseUrl = options?.baseUrl || config.llm.local.baseUrl || 'http://localhost:11434';
        this.model = options?.model || config.llm.local.model || 'deepseek-r1:latest';
    }

    async generate(messages: LLMMessage[], context?: RAGContext): Promise<LLMResponse> {
        const startTime = Date.now();

        // Build system prompt with RAG context
        const systemPrompt = this.buildSystemPrompt(context);
        const formattedMessages = [
            { role: 'system' as const, content: systemPrompt },
            ...messages,
        ];

        const response = await fetch(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.model,
                messages: formattedMessages,
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.statusText}`);
        }

        const data = await response.json();
        const latencyMs = Date.now() - startTime;

        return {
            content: data.message?.content || '',
            usage: {
                promptTokens: data.prompt_eval_count || 0,
                completionTokens: data.eval_count || 0,
                totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
            },
            latencyMs,
        };
    }

    async *stream(
        messages: LLMMessage[],
        context?: RAGContext
    ): AsyncGenerator<string, void, unknown> {
        const systemPrompt = this.buildSystemPrompt(context);
        const formattedMessages = [
            { role: 'system' as const, content: systemPrompt },
            ...messages,
        ];

        const response = await fetch(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.model,
                messages: formattedMessages,
                stream: true,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(Boolean);

            for (const line of lines) {
                try {
                    const data = JSON.parse(line);
                    if (data.message?.content) {
                        yield data.message.content;
                    }
                } catch {
                    // Skip malformed JSON
                }
            }
        }
    }

    private buildSystemPrompt(context?: RAGContext): string {
        const basePrompt = `You are an AI assistant helping a Senior Frontend Lead prepare for job interviews. 
You have deep expertise in React, Next.js, TypeScript, and modern frontend development.
Provide thoughtful, experience-based answers that demonstrate leadership and technical depth.
Keep answers concise but substantive (2-3 minutes when spoken).
Include specific examples from projects when relevant.`;

        if (!context?.documents.length) {
            return basePrompt;
        }

        const contextText = context.documents
            .map((doc, i) => `[Reference ${i + 1}]: ${doc.content}`)
            .join('\n\n');

        return `${basePrompt}

Use the following context from your experience to inform your answers:

${contextText}`;
    }
}

/**
 * Claude Provider (Cloud - Anthropic)
 */
export class ClaudeProvider implements LLMProvider {
    private apiKey: string;
    private model: string;

    constructor(options?: { apiKey?: string; model?: string }) {
        this.apiKey = options?.apiKey || config.llm.cloud.apiKey || '';
        this.model = options?.model || 'claude-3-5-sonnet-20241022';
    }

    async generate(messages: LLMMessage[], context?: RAGContext): Promise<LLMResponse> {
        const startTime = Date.now();

        // For now, use the Vercel AI SDK in the actual API route
        // This is a placeholder that would use @anthropic-ai/sdk directly
        throw new Error('Use the /api/llm/generate endpoint for Claude API calls');
    }

    async *stream(
        messages: LLMMessage[],
        context?: RAGContext
    ): AsyncGenerator<string, void, unknown> {
        throw new Error('Use the /api/llm/stream endpoint for Claude streaming');
    }
}

/**
 * Get the appropriate LLM provider based on config
 */
export function getLLMProvider(): LLMProvider {
    if (config.mode === 'LOCAL') {
        return new OllamaProvider();
    }
    return new ClaudeProvider();
}

/**
 * Generate a response using the configured provider
 */
export async function generateResponse(
    messages: LLMMessage[],
    context?: RAGContext
): Promise<LLMResponse> {
    const provider = getLLMProvider();
    return provider.generate(messages, context);
}
