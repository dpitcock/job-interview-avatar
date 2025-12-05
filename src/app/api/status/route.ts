import { NextResponse } from 'next/server';
import config from '@/lib/config';
import { getDocumentCount } from '@/lib/rag';

export async function GET() {
    // Check LLM availability
    let llmReady = false;
    let llmProvider = config.mode === 'LOCAL' ? 'DeepSeek R1' : 'Claude 3.5';

    if (config.mode === 'LOCAL') {
        try {
            const res = await fetch(`${config.llm.local.baseUrl}/api/tags`, {
                signal: AbortSignal.timeout(2000),
            });
            llmReady = res.ok;
        } catch {
            llmReady = false;
        }
    } else {
        llmReady = !!config.llm.cloud.apiKey;
    }

    // Check voice availability
    const voiceReady = config.mode === 'LOCAL'
        ? false // OpenVoice server check would go here
        : !!config.voice.cloud.apiKey;

    // Check avatar availability
    const avatarReady = config.mode === 'LOCAL'
        ? false // LivePortrait server check would go here
        : !!config.video.cloud.apiKey;

    // Check RAG status
    const ragCount = getDocumentCount();
    const ragReady = ragCount > 0;

    return NextResponse.json({
        mode: config.mode,
        llm: {
            ready: llmReady,
            provider: llmProvider,
        },
        voice: {
            ready: voiceReady,
            name: voiceReady ? 'Default Voice' : undefined,
        },
        avatar: {
            ready: avatarReady,
            name: avatarReady ? 'Default Avatar' : undefined,
        },
        rag: {
            ready: ragReady,
            count: ragCount,
        },
    });
}
