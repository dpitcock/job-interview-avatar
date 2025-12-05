'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import StreamingAvatar, {
    AvatarQuality,
    StreamingEvents,
    TaskType,
} from '@heygen/streaming-avatar';

interface StreamingState {
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
    sessionId: string | null;
}

export function useHeyGenStreaming() {
    const [state, setState] = useState<StreamingState>({
        isConnected: false,
        isLoading: false,
        error: null,
        sessionId: null,
    });

    const avatarRef = useRef<StreamingAvatar | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    // Initialize streaming session
    const startSession = useCallback(async (
        videoElement: HTMLVideoElement,
        options?: {
            quality?: AvatarQuality;
            avatarName?: string;
        }
    ) => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            // Create session via our API
            const response = await fetch('/api/video/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quality: options?.quality || 'medium',
                    avatarName: options?.avatarName,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create session');
            }

            const { sessionId, sdp, iceServers } = await response.json();

            // Initialize HeyGen SDK
            if (!avatarRef.current) {
                avatarRef.current = new StreamingAvatar({
                    token: sessionId, // Session ID acts as token
                });

                // Set up event listeners
                avatarRef.current.on(StreamingEvents.AVATAR_START_TALKING, () => {
                    console.log('Avatar started talking');
                });

                avatarRef.current.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
                    console.log('Avatar stopped talking');
                });

                avatarRef.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
                    console.log('Stream disconnected');
                    setState(prev => ({ ...prev, isConnected: false }));
                });

                avatarRef.current.on(StreamingEvents.STREAM_READY, () => {
                    console.log('Stream ready');
                });
            }

            // Create WebRTC peer connection
            await avatarRef.current.createStartAvatar({
                quality: options?.quality || AvatarQuality.Medium,
                avatarName: options?.avatarName || 'Wayne_20240711',
                voice: {
                    voiceId: 'e3a0f9e6c8e04f3e9d1c8b5a7f2e4d3c',
                },
            });

            // Attach video stream
            videoRef.current = videoElement;
            if (avatarRef.current.mediaStream) {
                videoElement.srcObject = avatarRef.current.mediaStream;
                await videoElement.play();
            }

            setState({
                isConnected: true,
                isLoading: false,
                error: null,
                sessionId,
            });
        } catch (error) {
            console.error('Failed to start streaming session:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to start session',
            }));
        }
    }, []);

    // Speak text (with optional audio)
    const speak = useCallback(async (text: string, audioUrl?: string) => {
        if (!avatarRef.current || !state.isConnected) {
            throw new Error('Avatar not connected');
        }

        try {
            if (audioUrl) {
                // Use custom audio with lip-sync
                await avatarRef.current.speak({
                    text,
                    taskType: TaskType.TALK,
                });
            } else {
                // Use HeyGen's built-in TTS
                await avatarRef.current.speak({
                    text,
                    taskType: TaskType.TALK,
                });
            }
        } catch (error) {
            console.error('Failed to speak:', error);
            throw error;
        }
    }, [state.isConnected]);

    // Stop speaking
    const stopSpeaking = useCallback(async () => {
        if (!avatarRef.current) return;

        try {
            await avatarRef.current.interrupt();
        } catch (error) {
            console.error('Failed to stop speaking:', error);
        }
    }, []);

    // Close session
    const closeSession = useCallback(async () => {
        if (!state.sessionId) return;

        try {
            // Stop avatar
            if (avatarRef.current) {
                await avatarRef.current.stopAvatar();
                avatarRef.current = null;
            }

            // Close session via API
            await fetch(`/api/video/stream?sessionId=${state.sessionId}`, {
                method: 'DELETE',
            });

            setState({
                isConnected: false,
                isLoading: false,
                error: null,
                sessionId: null,
            });
        } catch (error) {
            console.error('Failed to close session:', error);
        }
    }, [state.sessionId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (avatarRef.current) {
                avatarRef.current.stopAvatar().catch(console.error);
            }
        };
    }, []);

    return {
        ...state,
        startSession,
        speak,
        stopSpeaking,
        closeSession,
    };
}
