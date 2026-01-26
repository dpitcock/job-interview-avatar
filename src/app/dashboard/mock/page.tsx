'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useStreaming } from '@/hooks/useStreaming';
import { useCandidateProfiles } from '@/hooks/useCandidateProfiles';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Session {
    id: string;
    title: string;
    status: string;
    created_at: string;
}

export default function CandidateInterviewPage() {
    const { activeCandidate, activeCandidateId } = useCandidateProfiles();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isPromoting, setIsPromoting] = useState(false);

    const { response, isStreaming, error, stream, reset } = useStreaming();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, response]);

    // Fetch sessions on mount
    useEffect(() => {
        if (!activeCandidateId) return;

        async function fetchSessions() {
            try {
                const res = await fetch(`/api/interview/sessions?candidateId=${activeCandidateId}`);
                if (res.ok) {
                    const data = await res.json();
                    setSessions(data.sessions || []);
                }
            } catch (err) {
                console.error('Failed to fetch sessions:', err);
            } finally {
                setIsInitialLoading(false);
            }
        }
        fetchSessions();
    }, [activeCandidateId]);

    // Handle session selection
    const selectSession = async (session: Session) => {
        setCurrentSession(session);
        setMessages([]);
        reset();

        try {
            const res = await fetch(`/api/interview/messages?sessionId=${session.id}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages.map((m: any) => ({ role: m.role, content: m.content })));
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    };

    // Start new session
    const startNewSession = async () => {
        if (!activeCandidateId) return;

        try {
            const res = await fetch('/api/interview/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidateId: activeCandidateId }),
            });

            if (res.ok) {
                const data = await res.json();
                setSessions([data.session, ...sessions]);
                selectSession(data.session);
            }
        } catch (err) {
            console.error('Failed to create session:', err);
        }
    };

    // Handle sending message
    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isStreaming || !currentSession || !activeCandidate) return;

        const userMessage: Message = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');

        // Save user message to DB
        await fetch('/api/interview/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: currentSession.id,
                role: 'user',
                content: userMessage.content
            }),
        });

        // Get AI response
        await stream(newMessages, {
            category: 'candidate',
            candidateId: activeCandidateId || undefined,
            candidateInfo: {
                name: activeCandidate.name,
                role: activeCandidate.role || 'Professional Candidate',
                situation: activeCandidate.situation || 'You are in a job interview.'
            },
            useRag: true
        });
    };

    // Save AI response when done
    useEffect(() => {
        if (!isStreaming && response && messages.length > 0 && messages[messages.length - 1].role === 'user') {
            const aiMessage: Message = { role: 'assistant', content: response };
            setMessages(prev => [...prev, aiMessage]);

            if (currentSession) {
                fetch('/api/interview/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: currentSession.id,
                        role: 'assistant',
                        content: aiMessage.content
                    }),
                });
            }
        }
    }, [isStreaming, response, currentSession]);

    // Promote session to RAG context
    const promoteToContext = async () => {
        if (!currentSession || !activeCandidateId) return;

        setIsPromoting(true);
        try {
            const res = await fetch('/api/interview/promote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: currentSession.id, candidateId: activeCandidateId }),
            });

            if (res.ok) {
                setCurrentSession({ ...currentSession, status: 'promoted' });
                // Update in list
                setSessions(sessions.map(s => s.id === currentSession.id ? { ...s, status: 'promoted' } : s));
                alert('Session successfully saved to your professional context!');
            }
        } catch (err) {
            console.error('Failed to promote session:', err);
            alert('Failed to save session to context.');
        } finally {
            setIsPromoting(false);
        }
    };

    if (!activeCandidateId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="text-center p-8 glass rounded-2xl max-w-md">
                    <h2 className="text-2xl font-bold mb-4">No Candidate Selected</h2>
                    <p className="text-muted mb-6">Please select a candidate profile to start an interview session.</p>
                    <Link href="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-border bg-card">
            {/* Sidebar - Session List */}
            <aside className="w-80 border-r border-border flex flex-col bg-card/50">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-bold text-lg">History</h2>
                    <button
                        onClick={startNewSession}
                        className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        title="New Session"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {isInitialLoading ? (
                        <div className="flex justify-center p-8">
                            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center p-8 text-muted text-sm italic">
                            No past interviews. Start a new one!
                        </div>
                    ) : (
                        sessions.map(s => (
                            <button
                                key={s.id}
                                onClick={() => selectSession(s)}
                                className={`w-full text-left p-3 rounded-xl transition-all duration-200 text-sm ${currentSession?.id === s.id
                                    ? 'bg-primary/10 border border-primary/20 text-primary'
                                    : 'hover:bg-white/5 border border-transparent text-muted hover:text-foreground'
                                    }`}
                            >
                                <div className="font-medium truncate mb-1">{s.title || 'Untitled Session'}</div>
                                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider opacity-70">
                                    <span>{new Date(s.created_at).toLocaleDateString()}</span>
                                    {s.status === 'promoted' && (
                                        <span className="text-success font-bold flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            RAG
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col relative bg-background/50">
                {currentSession ? (
                    <>
                        {/* Chat Header */}
                        <header className="p-4 border-b border-border flex items-center justify-between">
                            <div>
                                <h2 className="font-bold flex items-center gap-2">
                                    Interviewing <span className="text-primary">{activeCandidate?.name}</span>
                                </h2>
                                <p className="text-xs text-muted">Role-play as the interviewer. AI acts as the candidate.</p>
                            </div>

                            <div className="flex items-center gap-3">
                                {currentSession.status !== 'promoted' && messages.length > 2 && (
                                    <button
                                        onClick={promoteToContext}
                                        disabled={isPromoting}
                                        className="btn btn-secondary py-1.5 px-3 text-xs flex items-center gap-2"
                                    >
                                        {isPromoting ? (
                                            <span className="w-3 h-3 border-2 border-muted border-t-foreground rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                        Save to Context
                                    </button>
                                )}
                            </div>
                        </header>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
                        >
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Start the Interview</h3>
                                    <p className="text-muted max-w-sm">
                                        The AI is ready to role-play as {activeCandidate?.name}.
                                        Try asking "Tell me about yourself" or specific technical questions.
                                    </p>
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                                        ? 'bg-primary text-white shadow-lg rounded-br-none'
                                        : 'bg-card border border-border shadow-sm rounded-bl-none'
                                        }`}>
                                        <div className="text-[10px] opacity-60 mb-1 font-bold uppercase tracking-wider">
                                            {msg.role === 'user' ? 'Interviewer (You)' : activeCandidate?.name}
                                        </div>
                                        <div className="whitespace-pre-wrap leading-relaxed text-sm">
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isStreaming && (
                                <div className="flex justify-start">
                                    <div className="max-w-[80%] bg-card border border-border shadow-sm rounded-2xl rounded-bl-none p-4">
                                        <div className="text-[10px] opacity-60 mb-1 font-bold uppercase tracking-wider">
                                            {activeCandidate?.name}
                                        </div>
                                        <div className="whitespace-pre-wrap leading-relaxed text-sm">
                                            {response}
                                            <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 align-middle" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="flex justify-center">
                                    <div className="bg-error/10 text-error text-xs px-4 py-2 rounded-full border border-error/20">
                                        {error}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 glass border-t border-border z-10">
                            <form
                                onSubmit={handleSend}
                                className="max-w-4xl mx-auto flex gap-3"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={`Ask ${activeCandidate?.name} a question...`}
                                    className="flex-1 bg-card border border-border hover:border-primary/50 focus:border-primary rounded-xl px-4 py-3 focus:outline-none transition-all text-sm"
                                    disabled={isStreaming}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isStreaming}
                                    className="bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-border">
                            <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold mb-2">Select a Session</h2>
                        <p className="text-muted max-w-sm mb-6">Choose an existing interview session or start a fresh one to test your candidate's knowledge.</p>
                        <button onClick={startNewSession} className="btn btn-primary px-8">New Interview Session</button>
                    </div>
                )}
            </main>
        </div>
    );
}

