import { NextRequest, NextResponse } from 'next/server';
import config from '@/lib/config';
import { queryDocuments } from '@/lib/rag';
import type { LLMMessage, RAGContext } from '@/types';

interface GenerateRequest {
    messages: LLMMessage[];
    useRag?: boolean;
    provider?: string;
    model?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerateRequest = await request.json();
        const { messages, useRag = true, provider, model } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Messages are required' },
                { status: 400 }
            );
        }

        // Determine provider/model (from request or fallback to config)
        const selectedProvider = provider || (config.mode === 'LOCAL' ? 'ollama' : 'anthropic');
        const selectedModel = model || (config.mode === 'LOCAL'
            ? config.llm.local.model
            : config.llm.cloud.model) || 'deepseek-r1:latest';

        // Get last user message for RAG query
        const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');

        let context: RAGContext | undefined;
        if (useRag && lastUserMessage) {
            const documents = await queryDocuments(lastUserMessage.content, { topK: 3 });
            if (documents.length > 0) {
                context = {
                    query: lastUserMessage.content,
                    documents,
                };
            }
        }

        const systemPrompt = buildSystemPrompt(context);
        const startTime = Date.now();

        // Route to appropriate provider
        let response;
        switch (selectedProvider) {
            case 'ollama':
                response = await generateOllama(messages, systemPrompt, selectedModel);
                break;
            case 'openai':
                response = await generateOpenAI(messages, systemPrompt, selectedModel);
                break;
            case 'anthropic':
                response = await generateAnthropic(messages, systemPrompt, selectedModel);
                break;
            default:
                return NextResponse.json(
                    { error: `Unknown provider: ${selectedProvider}` },
                    { status: 400 }
                );
        }

        const latencyMs = Date.now() - startTime;

        return NextResponse.json({
            ...response,
            latencyMs,
            provider: selectedProvider,
            model: selectedModel,
        });
    } catch (error) {
        console.error('LLM generate error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate response' },
            { status: 500 }
        );
    }
}

// ============================================================================
// Ollama (Local)
// ============================================================================
async function generateOllama(
    messages: LLMMessage[],
    systemPrompt: string,
    model: string
) {
    const baseUrl = config.llm.local.baseUrl || 'http://localhost:11434';

    const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages,
    ];

    const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model,
            messages: formattedMessages,
            stream: false,
        }),
    });

    if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}. Is Ollama running?`);
    }

    const data = await response.json();

    return {
        content: data.message?.content || '',
        usage: {
            promptTokens: data.prompt_eval_count || 0,
            completionTokens: data.eval_count || 0,
            totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
    };
}

// ============================================================================
// OpenAI
// ============================================================================
async function generateOpenAI(
    messages: LLMMessage[],
    systemPrompt: string,
    model: string
) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY not configured in .env.local');
    }

    const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: formattedMessages,
            max_tokens: 2048,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();

    return {
        content: data.choices?.[0]?.message?.content || '',
        usage: {
            promptTokens: data.usage?.prompt_tokens || 0,
            completionTokens: data.usage?.completion_tokens || 0,
            totalTokens: data.usage?.total_tokens || 0,
        },
    };
}

// ============================================================================
// Anthropic (Claude)
// ============================================================================
async function generateAnthropic(
    messages: LLMMessage[],
    systemPrompt: string,
    model: string
) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY not configured in .env.local');
    }

    // Anthropic requires alternating user/assistant messages
    const anthropicMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
        }));

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
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API error: ${error}`);
    }

    const data = await response.json();

    return {
        content: data.content?.[0]?.text || '',
        usage: {
            promptTokens: data.usage?.input_tokens || 0,
            completionTokens: data.usage?.output_tokens || 0,
            totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
    };
}

// ============================================================================
// System Prompt Builder
// ============================================================================
function buildSystemPrompt(context?: RAGContext): string {
    const basePrompt = `You are an AI assistant helping a Senior Frontend Lead prepare for job interviews. 
You have deep expertise in React, Next.js, TypeScript, and modern frontend development.
Provide thoughtful, experience-based answers that demonstrate leadership and technical depth.
Keep answers concise but substantive (2-3 minutes when spoken).
Include specific examples from projects when relevant.
Use natural speech patterns, not bullet points.`;

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
