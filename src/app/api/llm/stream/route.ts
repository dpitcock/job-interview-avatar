import { NextRequest } from 'next/server';
import config from '@/lib/config';
import { queryDocuments } from '@/lib/rag';
import { buildInterviewPrompt, detectQuestionCategory } from '@/lib/prompts';
import type { LLMMessage, RAGContext } from '@/types';

interface StreamRequest {
    messages: LLMMessage[];
    useRag?: boolean;
    provider?: string;
    model?: string;
    userId?: string;
    candidateId?: string;
    category?: string; // Optional override
    candidateInfo?: { name: string; role: string; situation: string };
}

export async function POST(request: NextRequest) {
    try {
        const body: StreamRequest = await request.json();
        const { messages, useRag = true, provider, model, category: categoryOverride, candidateInfo } = body;
        const candidateId = body.candidateId || body.userId;

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: 'Messages are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { default: db } = await import('@/lib/db');
        const systemRows = db.prepare('SELECT key, value FROM system_settings').all();
        const sys = systemRows.reduce((acc: any, row: any) => {
            acc[row.key] = row.value;
            return acc;
        }, {});

        let activeMode = sys.llm_mode || config.mode;
        let activeProvider = activeMode === 'LOCAL' ? 'ollama' : sys.llm_cloud_provider;
        let activeModel = activeMode === 'LOCAL' ? sys.llm_local_model : sys.llm_cloud_model;

        if (candidateId) {
            const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(candidateId) as any;
            if (candidate) {
                activeMode = candidate.llm_preferred_mode || activeMode;
                activeProvider = activeMode === 'LOCAL' ? 'ollama' : (candidate.llm_cloud_provider || activeProvider);
                activeModel = activeMode === 'LOCAL'
                    ? (candidate.llm_local_model || activeModel)
                    : (candidate.llm_cloud_model || activeModel);
            }
        }

        const selectedProvider = provider || activeProvider || (activeMode === 'LOCAL' ? 'ollama' : 'anthropic');
        const selectedModel = model || activeModel || 'deepseek-r1:latest';

        // Get RAG context
        const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
        let context: RAGContext | undefined;
        if (useRag && lastUserMessage) {
            const documents = await queryDocuments(lastUserMessage.content, { topK: 5, candidateId });
            if (documents.length > 0) {
                context = { query: lastUserMessage.content, documents };
            }
        }

        // Detect category and build enhanced system prompt
        const category = categoryOverride || (lastUserMessage ? detectQuestionCategory(lastUserMessage.content) : 'general');
        const systemPrompt = buildInterviewPrompt(
            category as any,
            context?.documents.map(d => d.content),
            candidateInfo
        );

        // Create streaming response
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    switch (selectedProvider) {
                        case 'ollama':
                            await streamOllama(controller, messages, systemPrompt, selectedModel);
                            break;
                        case 'openai':
                            await streamOpenAI(controller, messages, systemPrompt, selectedModel);
                            break;
                        case 'anthropic':
                            await streamAnthropic(controller, messages, systemPrompt, selectedModel);
                            break;
                        default:
                            controller.enqueue(new TextEncoder().encode(`Error: Unknown provider ${selectedProvider}`));
                    }
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Stream error';
                    controller.enqueue(new TextEncoder().encode(`Error: ${message}`));
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('LLM stream error:', error);
        return new Response(JSON.stringify({ error: 'Failed to stream response' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// ============================================================================
// Ollama Streaming
// ============================================================================
async function streamOllama(
    controller: ReadableStreamDefaultController,
    messages: LLMMessage[],
    systemPrompt: string,
    model: string
) {
    const baseUrl = config.llm.local.baseUrl || 'http://localhost:11434';

    const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model,
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            stream: true,
        }),
    });

    if (!response.ok || !response.body) {
        throw new Error('Ollama connection failed. Is Ollama running?');
    }

    const reader = response.body.getReader();
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
                    controller.enqueue(new TextEncoder().encode(data.message.content));
                }
            } catch {
                // Skip malformed JSON
            }
        }
    }
}

// ============================================================================
// OpenAI Streaming
// ============================================================================
async function streamOpenAI(
    controller: ReadableStreamDefaultController,
    messages: LLMMessage[],
    systemPrompt: string,
    model: string
) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            max_tokens: 2048,
            stream: true,
        }),
    });

    if (!response.ok || !response.body) {
        const error = await response.text();
        throw new Error(`OpenAI error: ${error}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                    controller.enqueue(new TextEncoder().encode(content));
                }
            } catch {
                // Skip malformed JSON
            }
        }
    }
}

// ============================================================================
// Anthropic Streaming
// ============================================================================
async function streamAnthropic(
    controller: ReadableStreamDefaultController,
    messages: LLMMessage[],
    systemPrompt: string,
    model: string
) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

    const anthropicMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model,
            max_tokens: 2048,
            system: systemPrompt,
            messages: anthropicMessages,
            stream: true,
        }),
    });

    if (!response.ok || !response.body) {
        const error = await response.text();
        throw new Error(`Anthropic error: ${error}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
            try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'content_block_delta' && data.delta?.text) {
                    controller.enqueue(new TextEncoder().encode(data.delta.text));
                }
            } catch {
                // Skip malformed JSON
            }
        }
    }
}

// System Prompt building moved to lib/prompts.ts
