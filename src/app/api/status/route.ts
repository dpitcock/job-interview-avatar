import { NextRequest, NextResponse } from 'next/server';
import config from '@/lib/config';
import { getDocumentCount } from '@/lib/rag';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId') || searchParams.get('userId') || undefined;

    const { default: db } = await import('@/lib/db');

    // Fetch global settings
    const settingsRows = db.prepare('SELECT key, value FROM system_settings').all();
    const systemSettings = settingsRows.reduce((acc: any, row: any) => {
        acc[row.key] = row.value;
        return acc;
    }, {});

    let currentMode = (systemSettings.llm_mode || config.mode) as 'LOCAL' | 'CLOUD';
    let llmProvider = currentMode === 'LOCAL' ? systemSettings.llm_local_model : systemSettings.llm_cloud_model;

    if (candidateId) {
        const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(candidateId);
        if (candidate) {
            currentMode = candidate.llm_preferred_mode || currentMode;
            llmProvider = currentMode === 'LOCAL'
                ? (candidate.llm_local_model || systemSettings.llm_local_model)
                : (candidate.llm_cloud_model || systemSettings.llm_cloud_model);
        }
    }

    // Check LLM availability
    let llmReady = false;
    if (currentMode === 'LOCAL') {
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

    // Check RAG status for specific candidate
    let ragCount = 0;
    if (candidateId) {
        const row = db.prepare('SELECT COUNT(*) as count FROM rag_files WHERE candidate_id = ?').get(candidateId);
        ragCount = (row as any)?.count || 0;
    }

    return NextResponse.json({
        mode: currentMode,
        candidateId: candidateId || null,
        llm: {
            ready: llmReady,
            provider: llmProvider,
        },
        rag: {
            ready: ragCount > 0,
            count: ragCount,
        },
    });
}
