'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import OBSWebSocket from 'obs-websocket-js';

interface OBSState {
    isConnected: boolean;
    isVirtualCameraActive: boolean;
    error: string | null;
}

export function useOBS() {
    const [state, setState] = useState<OBSState>({
        isConnected: false,
        isVirtualCameraActive: false,
        error: null,
    });

    const obsRef = useRef<OBSWebSocket | null>(null);

    // Connect to OBS WebSocket
    const connect = useCallback(async (url?: string, password?: string) => {
        try {
            if (!obsRef.current) {
                obsRef.current = new OBSWebSocket();
            }

            const wsUrl = url || process.env.NEXT_PUBLIC_OBS_WEBSOCKET_URL || 'ws://localhost:4455';
            const wsPassword = password || process.env.NEXT_PUBLIC_OBS_WEBSOCKET_PASSWORD;

            await obsRef.current.connect(wsUrl, wsPassword);

            // Check virtual camera status
            const { outputActive } = await obsRef.current.call('GetVirtualCamStatus');

            setState({
                isConnected: true,
                isVirtualCameraActive: outputActive,
                error: null,
            });

            console.log('Connected to OBS WebSocket');
        } catch (error) {
            console.error('Failed to connect to OBS:', error);
            setState(prev => ({
                ...prev,
                isConnected: false,
                error: error instanceof Error ? error.message : 'Failed to connect to OBS',
            }));
        }
    }, []);

    // Disconnect from OBS
    const disconnect = useCallback(async () => {
        if (obsRef.current) {
            try {
                await obsRef.current.disconnect();
                obsRef.current = null;
                setState({
                    isConnected: false,
                    isVirtualCameraActive: false,
                    error: null,
                });
            } catch (error) {
                console.error('Failed to disconnect from OBS:', error);
            }
        }
    }, []);

    // Start virtual camera
    const startVirtualCamera = useCallback(async () => {
        if (!obsRef.current || !state.isConnected) {
            throw new Error('Not connected to OBS');
        }

        try {
            await obsRef.current.call('StartVirtualCam');
            setState(prev => ({ ...prev, isVirtualCameraActive: true }));
        } catch (error) {
            console.error('Failed to start virtual camera:', error);
            throw error;
        }
    }, [state.isConnected]);

    // Stop virtual camera
    const stopVirtualCamera = useCallback(async () => {
        if (!obsRef.current || !state.isConnected) {
            throw new Error('Not connected to OBS');
        }

        try {
            await obsRef.current.call('StopVirtualCam');
            setState(prev => ({ ...prev, isVirtualCameraActive: false }));
        } catch (error) {
            console.error('Failed to stop virtual camera:', error);
            throw error;
        }
    }, [state.isConnected]);

    // Switch to a specific scene
    const setScene = useCallback(async (sceneName: string) => {
        if (!obsRef.current || !state.isConnected) {
            throw new Error('Not connected to OBS');
        }

        try {
            await obsRef.current.call('SetCurrentProgramScene', {
                sceneName,
            });
        } catch (error) {
            console.error('Failed to set scene:', error);
            throw error;
        }
    }, [state.isConnected]);

    // Get list of scenes
    const getScenes = useCallback(async () => {
        if (!obsRef.current || !state.isConnected) {
            throw new Error('Not connected to OBS');
        }

        try {
            const { scenes } = await obsRef.current.call('GetSceneList');
            return (scenes as Array<{ sceneName: string }>).map(s => s.sceneName);
        } catch (error) {
            console.error('Failed to get scenes:', error);
            throw error;
        }
    }, [state.isConnected]);

    // Start recording
    const startRecording = useCallback(async () => {
        if (!obsRef.current || !state.isConnected) {
            throw new Error('Not connected to OBS');
        }

        try {
            await obsRef.current.call('StartRecord');
        } catch (error) {
            console.error('Failed to start recording:', error);
            throw error;
        }
    }, [state.isConnected]);

    // Stop recording
    const stopRecording = useCallback(async () => {
        if (!obsRef.current || !state.isConnected) {
            throw new Error('Not connected to OBS');
        }

        try {
            await obsRef.current.call('StopRecord');
        } catch (error) {
            console.error('Failed to stop recording:', error);
            throw error;
        }
    }, [state.isConnected]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (obsRef.current) {
                obsRef.current.disconnect().catch(console.error);
            }
        };
    }, []);

    return {
        ...state,
        connect,
        disconnect,
        startVirtualCamera,
        stopVirtualCamera,
        setScene,
        getScenes,
        startRecording,
        stopRecording,
    };
}
