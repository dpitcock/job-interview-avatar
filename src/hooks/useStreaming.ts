'use client';

import { useState, useRef, useEffect } from 'react';

interface UseStreamingOptions {
    onToken?: (token: string) => void;
    onComplete?: (fullResponse: string) => void;
    onError?: (error: string) => void;
}

export function useStreaming(options?: UseStreamingOptions) {
    const [response, setResponse] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const stream = async (
        messages: Array<{ role: string; content: string }>,
        config?: {
            provider?: string;
            model?: string;
            useRag?: boolean;
            userId?: string;
            category?: string;
            candidateInfo?: { name: string; role: string };
        }
    ) => {
        // Abort any existing stream
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setResponse('');
        setError(null);
        setIsStreaming(true);

        try {
            const res = await fetch('/api/llm/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages,
                    provider: config?.provider,
                    model: config?.model,
                    useRag: config?.useRag ?? true,
                    userId: config?.userId,
                    category: config?.category,
                    candidateInfo: config?.candidateInfo,
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!res.ok || !res.body) {
                throw new Error(`Stream failed: ${res.statusText}`);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);

                // Check for error prefix
                if (chunk.startsWith('Error:')) {
                    throw new Error(chunk.slice(7));
                }

                fullResponse += chunk;
                setResponse(fullResponse);
                options?.onToken?.(chunk);
            }

            options?.onComplete?.(fullResponse);
            return fullResponse;
        } catch (err) {
            if ((err as Error).name === 'AbortError') {
                return response; // Return current response on abort
            }
            const message = err instanceof Error ? err.message : 'Stream error';
            setError(message);
            options?.onError?.(message);
            throw err;
        } finally {
            setIsStreaming(false);
        }
    };

    const stop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsStreaming(false);
        }
    };

    const reset = () => {
        stop();
        setResponse('');
        setError(null);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        response,
        isStreaming,
        error,
        stream,
        stop,
        reset,
    };
}
