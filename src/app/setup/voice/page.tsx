'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useUserProfiles } from '@/hooks/useUserProfiles';

export default function VoiceSetup() {
    const { activeUser, updateUser, isLoaded } = useUserProfiles();
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isCloning, setIsCloning] = useState(false);
    const [voiceId, setVoiceId] = useState('');
    const [manualVoiceId, setManualVoiceId] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const voiceReady = activeUser?.voice.configured || false;

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Auto-stop after 30 seconds
            setTimeout(() => {
                if (mediaRecorderRef.current?.state === 'recording') {
                    mediaRecorderRef.current.stop();
                    setIsRecording(false);
                }
            }, 30000);
        } catch (error) {
            console.error('Failed to start recording:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const cloneVoice = async () => {
        if (!audioBlob || !activeUser) return;

        setIsCloning(true);
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'voice_sample.webm');

            const res = await fetch('/api/voice/clone', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                const newVoiceId = data.voiceId || 'cloned_voice_' + Date.now();
                setVoiceId(newVoiceId);

                // Update user profile
                updateUser(activeUser.id, {
                    voice: {
                        configured: true,
                        voiceId: newVoiceId,
                    },
                });
            }
        } catch (error) {
            console.error('Voice cloning failed:', error);
        } finally {
            setIsCloning(false);
        }
    };

    const saveManualVoiceId = () => {
        if (!manualVoiceId.trim() || !activeUser) return;

        updateUser(activeUser.id, {
            voice: {
                configured: true,
                voiceId: manualVoiceId.trim(),
            },
        });
        setVoiceId(manualVoiceId.trim());
        setManualVoiceId('');
    };

    const resetVoice = () => {
        if (!activeUser) return;

        updateUser(activeUser.id, {
            voice: {
                configured: false,
                voiceId: undefined,
            },
        });
        setVoiceId('');
        setAudioBlob(null);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="glass sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-lg hover:bg-card transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold">Voice Setup</h1>
                        <p className="text-sm text-muted">
                            {activeUser
                                ? `Configure voice for ${activeUser.name}`
                                : 'Clone your voice for interview responses'
                            }
                        </p>
                    </div>
                    {activeUser && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            {activeUser.name}
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* No User Warning */}
                {isLoaded && !activeUser && (
                    <section className="glass rounded-2xl p-8 mb-8 border-2 border-warning text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold mb-2">No User Selected</h2>
                        <p className="text-muted mb-4">
                            Please select or create a user profile to configure voice.
                        </p>
                        <Link href="/users" className="btn btn-primary">
                            Manage Users
                        </Link>
                    </section>
                )}

                {activeUser && (
                    <>
                        {/* Recording Section */}
                        <section className="glass rounded-2xl p-8 mb-8 text-center">
                            <div className="text-6xl mb-6">🎤</div>

                            {voiceReady ? (
                                <>
                                    <h2 className="text-2xl font-bold mb-2 text-success">Voice Ready!</h2>
                                    <p className="text-muted mb-2">
                                        Voice configured for {activeUser.name}.
                                    </p>
                                    {activeUser.voice.voiceId && (
                                        <p className="text-xs text-muted font-mono mb-6">
                                            ID: {activeUser.voice.voiceId}
                                        </p>
                                    )}
                                    <button
                                        onClick={resetVoice}
                                        className="btn btn-secondary"
                                    >
                                        Change Voice
                                    </button>
                                </>
                            ) : audioBlob ? (
                                <>
                                    <h2 className="text-2xl font-bold mb-2">Sample Recorded</h2>
                                    <p className="text-muted mb-6">
                                        {isCloning ? 'Cloning your voice...' : 'Ready to clone your voice.'}
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <button
                                            onClick={() => setAudioBlob(null)}
                                            className="btn btn-secondary"
                                            disabled={isCloning}
                                        >
                                            Re-record
                                        </button>
                                        <button
                                            onClick={cloneVoice}
                                            className="btn btn-primary glow-primary"
                                            disabled={isCloning}
                                        >
                                            {isCloning ? 'Cloning...' : 'Clone Voice'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold mb-2">Record Voice Sample</h2>
                                    <p className="text-muted mb-6">
                                        Record 30 seconds of natural speech to clone your voice.
                                    </p>
                                    <button
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`btn ${isRecording ? 'bg-error hover:bg-error/80' : 'btn-primary glow-primary'} text-lg px-8 py-4`}
                                    >
                                        {isRecording ? (
                                            <>
                                                <span className="w-3 h-3 bg-white rounded-sm animate-pulse-slow" />
                                                Stop Recording
                                            </>
                                        ) : (
                                            <>
                                                <span className="w-3 h-3 bg-white rounded-full" />
                                                Start Recording
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </section>

                        {/* Manual Voice ID Section */}
                        {!voiceReady && (
                            <section className="glass rounded-2xl p-6 mb-8">
                                <h3 className="font-semibold mb-3">Or Use Existing ElevenLabs Voice ID</h3>
                                <p className="text-sm text-muted mb-4">
                                    If you already have an ElevenLabs voice, enter its ID directly.
                                    <a
                                        href="https://elevenlabs.io/docs/developers/quickstart"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline ml-1"
                                    >
                                        View docs ↗
                                    </a>
                                </p>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={manualVoiceId}
                                        onChange={(e) => setManualVoiceId(e.target.value)}
                                        placeholder="e.g., JBFqnCBsd6RMkjVDRZzb"
                                        className="flex-1 px-4 py-3 rounded-xl bg-card border border-border focus:border-primary outline-none font-mono text-sm"
                                    />
                                    <button
                                        onClick={saveManualVoiceId}
                                        disabled={!manualVoiceId.trim()}
                                        className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/80 transition-colors disabled:opacity-50"
                                    >
                                        Save
                                    </button>
                                </div>
                            </section>
                        )}
                    </>
                )}

                {/* Tips */}
                <section className="glass rounded-2xl p-6">
                    <h3 className="font-semibold mb-3">💡 Recording Tips</h3>
                    <ul className="space-y-2 text-sm text-muted">
                        <li>• Speak naturally at your normal interview pace</li>
                        <li>• Use a quiet environment with minimal background noise</li>
                        <li>• Include variety in tone and pacing</li>
                        <li>• Read a sample interview answer or describe a project</li>
                    </ul>
                </section>
            </main>
        </div>
    );
}
