'use client';

import { useState, useCallback } from 'react';
import type { DashboardState, SetupStatus, ResponseLatency } from '@/types';

const DEFAULT_STATE: DashboardState = {
    mode: 'LOCAL',
    session: null,
    setupStatus: {
        voice: { ready: false },
        avatar: { ready: false },
        rag: { ready: false, documentCount: 0 },
        llm: { ready: false, provider: 'DeepSeek R1' },
    },
    latency: {
        current: null,
        average: null,
        history: [],
    },
};

export function useDashboard() {
    const [state, setState] = useState<DashboardState>(DEFAULT_STATE);
    const [isLoading, setIsLoading] = useState(false);

    const refreshStatus = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/status');
            if (res.ok) {
                const data = await res.json();
                setState(prev => ({
                    ...prev,
                    mode: data.mode,
                    setupStatus: {
                        voice: { ready: data.llm?.ready || false }, // Fallback logic if needed
                        avatar: { ready: data.llm?.ready || false },
                        rag: { ready: data.rag.ready, documentCount: data.rag.count },
                        llm: { ready: data.llm.ready, provider: data.llm.provider },
                    },
                }));
            }
        } catch {
            // API error
        } finally {
            setIsLoading(false);
        }
    }, []);

    const recordLatency = useCallback((latency: ResponseLatency) => {
        setState(prev => {
            const history = [...prev.latency.history, latency].slice(-50);
            const average = history.length > 0
                ? {
                    transcription: history.reduce((a, b) => a + b.transcription, 0) / history.length,
                    rag: history.reduce((a, b) => a + b.rag, 0) / history.length,
                    llm: history.reduce((a, b) => a + b.llm, 0) / history.length,
                    voice: history.reduce((a, b) => a + b.voice, 0) / history.length,
                    video: history.reduce((a, b) => a + b.video, 0) / history.length,
                    total: history.reduce((a, b) => a + b.total, 0) / history.length,
                }
                : null;

            return {
                ...prev,
                latency: {
                    current: latency,
                    average,
                    history,
                },
            };
        });
    }, []);

    const isReady =
        state.setupStatus.llm.ready &&
        state.setupStatus.voice.ready &&
        state.setupStatus.avatar.ready &&
        state.setupStatus.rag.ready;

    return {
        ...state,
        isLoading,
        isReady,
        refreshStatus,
        recordLatency,
    };
}
