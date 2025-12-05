'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioPlayerState {
    isPlaying: boolean;
    isLoading: boolean;
    error: string | null;
    duration: number;
    currentTime: number;
}

export function useAudioPlayer() {
    const [state, setState] = useState<AudioPlayerState>({
        isPlaying: false,
        isLoading: false,
        error: null,
        duration: 0,
        currentTime: 0,
    });

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

    // Initialize AudioContext on user interaction (required by browsers)
    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContextClass();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    }, []);

    const playAudio = useCallback(async (audioData: Blob | ArrayBuffer | string) => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));
            initAudioContext();

            if (typeof audioData === 'string') {
                // Handle URL
                if (!audioRef.current) {
                    audioRef.current = new Audio();
                    audioRef.current.onended = () => setState(prev => ({ ...prev, isPlaying: false }));
                    audioRef.current.ontimeupdate = () => {
                        if (audioRef.current) {
                            setState(prev => ({
                                ...prev,
                                currentTime: audioRef.current?.currentTime || 0,
                                duration: audioRef.current?.duration || 0
                            }));
                        }
                    };
                }
                audioRef.current.src = audioData;
                await audioRef.current.play();
            } else {
                // Handle Blob/ArrayBuffer using Web Audio API
                if (!audioContextRef.current) return;

                const arrayBuffer = audioData instanceof Blob
                    ? await audioData.arrayBuffer()
                    : audioData;

                const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

                // Stop previous source if playing
                if (sourceNodeRef.current) {
                    sourceNodeRef.current.stop();
                }

                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);

                source.onended = () => {
                    setState(prev => ({ ...prev, isPlaying: false }));
                };

                source.start(0);
                sourceNodeRef.current = source;

                setState(prev => ({
                    ...prev,
                    duration: audioBuffer.duration,
                    isPlaying: true
                }));
            }

            setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
        } catch (error) {
            console.error('Audio playback error:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                isPlaying: false,
                error: 'Failed to play audio'
            }));
        }
    }, [initAudioContext]);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current = null;
        }
        setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    }, []);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        if (audioContextRef.current?.state === 'running') {
            audioContextRef.current.suspend();
        }
        setState(prev => ({ ...prev, isPlaying: false }));
    }, []);

    const resume = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.play();
        }
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }
        setState(prev => ({ ...prev, isPlaying: true }));
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            stop();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [stop]);

    return {
        ...state,
        playAudio,
        stop,
        pause,
        resume,
    };
}
