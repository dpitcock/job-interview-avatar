'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { AvatarQuality } from '@heygen/streaming-avatar';
import { useHeyGenStreaming } from '@/hooks/useHeyGenStreaming';
import { useStreaming } from '@/hooks/useStreaming';
import { useUserProfiles } from '@/hooks/useUserProfiles';

export default function LiveInterviewPage() {
    const { activeUser, activeUserId } = useUserProfiles();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [testText, setTestText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const {
        isConnected,
        isLoading,
        error: streamError,
        startSession,
        speak,
        stopSpeaking,
        closeSession,
    } = useHeyGenStreaming();

    const { response, isStreaming, error: llmError, stream, stop: stopLLM } = useStreaming();

    const handleStartSession = async () => {
        if (!videoRef.current) return;
        await startSession(videoRef.current, {
            quality: AvatarQuality.Medium,
            avatarName: activeUser?.avatar?.avatarName || 'Wayne_20240711', // User avatar or default
        });
    };

    const handleSpeak = async () => {
        if (!testText.trim()) return;
        try {
            await speak(testText);
        } catch (error) {
            console.error('Failed to speak:', error);
        }
    };

    const handleGenerateAndSpeak = async () => {
        if (!testText.trim()) return;

        setIsGenerating(true);
        try {
            // Generate response
            const fullResponse = await stream(
                [{ role: 'user', content: testText }],
                {
                    useRag: true,
                    userId: activeUserId || undefined,
                    provider: activeUser?.llm?.cloudProvider,
                    model: activeUser?.llm?.cloudModel
                }
            );

            // Speak the response
            if (fullResponse) {
                await speak(fullResponse);
            }
        } catch (error) {
            console.error('Failed to generate and speak:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="glass sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-lg hover:bg-card transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">Live Interview Mode</h1>
                            <p className="text-sm text-muted">Real-time AI avatar with voice</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-muted'}`} />
                        <span className="text-sm text-muted">
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Video Panel */}
                    <div className="space-y-4">
                        <div className="glass rounded-2xl overflow-hidden">
                            <video
                                ref={videoRef}
                                className="w-full aspect-video bg-card"
                                autoPlay
                                playsInline
                            />
                        </div>

                        {/* Connection Controls */}
                        <div className="glass rounded-xl p-4 flex gap-3">
                            {!isConnected ? (
                                <button
                                    onClick={handleStartSession}
                                    disabled={isLoading}
                                    className="btn btn-primary flex-1"
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                            </svg>
                                            Start Avatar
                                        </>
                                    )}
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={stopSpeaking}
                                        className="btn btn-secondary"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                        </svg>
                                        Stop
                                    </button>
                                    <button
                                        onClick={closeSession}
                                        className="btn bg-error hover:bg-error/80 text-white flex-1"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                                        </svg>
                                        End Session
                                    </button>
                                </>
                            )}
                        </div>

                        {streamError && (
                            <div className="p-4 rounded-xl bg-error/20 text-error text-sm">
                                {streamError}
                            </div>
                        )}
                    </div>

                    {/* Control Panel */}
                    <div className="space-y-6">
                        {/* Test Input */}
                        <div className="glass rounded-2xl p-6">
                            <h2 className="font-semibold mb-4">Test Avatar</h2>

                            <textarea
                                value={testText}
                                onChange={(e) => setTestText(e.target.value)}
                                placeholder="Enter text or question..."
                                className="w-full h-32 px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none resize-none"
                            />

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={handleSpeak}
                                    disabled={!isConnected || !testText.trim()}
                                    className="btn btn-secondary flex-1"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                                    </svg>
                                    Speak Text
                                </button>

                                <button
                                    onClick={handleGenerateAndSpeak}
                                    disabled={!isConnected || !testText.trim() || isGenerating}
                                    className="btn btn-primary flex-1"
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                            </svg>
                                            Generate & Speak
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Response Display */}
                        {(response || isStreaming || llmError) && (
                            <div className="glass rounded-2xl p-6">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    {isStreaming ? (
                                        <>
                                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                            Generating Response...
                                        </>
                                    ) : llmError ? (
                                        <>
                                            <span className="w-2 h-2 rounded-full bg-error" />
                                            Error
                                        </>
                                    ) : (
                                        <>
                                            <span className="w-2 h-2 rounded-full bg-success" />
                                            AI Response
                                        </>
                                    )}
                                </h3>

                                {llmError ? (
                                    <div className="p-4 rounded-xl bg-error/20 text-error text-sm">
                                        {llmError}
                                    </div>
                                ) : (
                                    <div className="prose prose-invert max-w-none">
                                        <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                            {response}
                                            {isStreaming && <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-1" />}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="glass rounded-2xl p-6">
                            <h3 className="font-semibold mb-4">Quick Test Questions</h3>
                            <div className="space-y-2">
                                {[
                                    'Tell me about yourself.',
                                    'What is your greatest strength?',
                                    'Describe a challenging project you worked on.',
                                ].map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => setTestText(q)}
                                        className="w-full text-left px-4 py-3 rounded-xl bg-card hover:bg-card-hover transition-colors text-sm"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
