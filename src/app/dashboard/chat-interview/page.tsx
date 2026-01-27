'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useStreaming } from '@/hooks/useStreaming';
import { useCandidateProfiles } from '@/hooks/useCandidateProfiles';
import behavioralQuestions from '@/data/behavorial-interview-questions.json';
import basicQuestions from '@/data/basic-interview-questions.json';

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

type ViewMode = 'chat' | 'history';

// Combine categories for easier handling
const ALL_QUESTION_SETS = {
    Basic: basicQuestions,
    Behavioral: behavioralQuestions,
};

type QuestionSetType = keyof typeof ALL_QUESTION_SETS;

export default function ChatInterviewPage() {
    const { activeCandidate, activeCandidateId } = useCandidateProfiles();
    const [view, setView] = useState<ViewMode>('chat');

    // State
    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isPromoting, setIsPromoting] = useState<string | null>(null);

    // Question selection state
    const [selectedSet, setSelectedSet] = useState<QuestionSetType>('Basic');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedQuestion, setSelectedQuestion] = useState<string>('');

    const { response, isStreaming, error, stream, reset } = useStreaming();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, response, view]);

    // Fetch sessions
    useEffect(() => {
        if (!activeCandidateId) return;

        async function fetchSessions() {
            try {
                const res = await fetch(`/api/interview/sessions?candidateId=${activeCandidateId}`);
                if (res.ok) {
                    const data = await res.json();
                    setSessions(data.sessions || []);
                    // Auto-select latest session if available, else start fresh
                    if (data.sessions && data.sessions.length > 0 && !currentSession) {
                        // Optional: selectSession(data.sessions[0]);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch sessions:', err);
            } finally {
                setIsInitialLoading(false);
            }
        }
        fetchSessions();
    }, [activeCandidateId]);

    // Update categories when set changes
    useEffect(() => {
        const categories = Object.keys(ALL_QUESTION_SETS[selectedSet]);
        if (categories.length > 0) {
            setSelectedCategory(categories[0]);
        }
    }, [selectedSet]);

    // Helper to get questions for current selection
    const availableQuestions = selectedCategory
        ? (ALL_QUESTION_SETS[selectedSet] as any)[selectedCategory] || []
        : [];

    const selectSession = async (session: Session) => {
        setCurrentSession(session);
        setMessages([]);
        reset();

        try {
            const res = await fetch(`/api/interview/messages?sessionId=${session.id}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages.map((m: any) => ({ role: m.role, content: m.content })));
                setView('chat');
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    };

    const startNewSession = async () => {
        if (!activeCandidateId) return;
        // Don't create on server yet, wait for first message
        setCurrentSession(null);
        setMessages([]);
        reset();
        setView('chat');
    };

    // Ensure we have a session ID before sending
    const ensureSession = async (): Promise<Session | null> => {
        if (currentSession) return currentSession;
        if (!activeCandidateId) return null;

        try {
            const res = await fetch('/api/interview/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidateId: activeCandidateId }),
            });

            if (res.ok) {
                const data = await res.json();
                const newSession = data.session;
                setSessions(prev => [newSession, ...prev]);
                setCurrentSession(newSession);
                return newSession;
            }
        } catch (err) {
            console.error('Failed to create session:', err);
        }
        return null;
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isStreaming || !activeCandidate) return;

        const session = await ensureSession();
        if (!session) {
            alert("Could not start interview session");
            return;
        }

        const userMessage: Message = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');

        // Save user message
        await fetch('/api/interview/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: session.id,
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

    // Save AI response
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

    const promoteToContext = async (session: Session) => {
        if (!activeCandidateId) return;

        setIsPromoting(session.id);
        try {
            const res = await fetch('/api/interview/promote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: session.id, candidateId: activeCandidateId }),
            });

            if (res.ok) {
                const updatedSession = { ...session, status: 'promoted' };
                if (currentSession?.id === session.id) {
                    setCurrentSession(updatedSession);
                }
                setSessions(sessions.map(s => s.id === session.id ? updatedSession : s));
                alert('Session successfully saved to your professional context!');
            }
        } catch (err) {
            console.error('Failed to promote session:', err);
            alert('Failed to save session to context.');
        } finally {
            setIsPromoting(null);
        }
    };

    const handlePickRandom = () => {
        if (availableQuestions.length === 0) return;
        const randomQ = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        setSelectedQuestion(randomQ);
        setInput(randomQ);
    };

    const handleInsertQuestion = () => {
        if (selectedQuestion) {
            setInput(selectedQuestion);
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
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold mr-4">Interview Mode</h1>
                <div className="flex bg-card p-1 rounded-xl border border-border">
                    <button
                        onClick={() => setView('chat')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'chat'
                            ? 'bg-primary text-white shadow-md'
                            : 'text-muted hover:text-foreground hover:bg-white/5'
                            }`}
                    >
                        Active Chat
                    </button>
                    <button
                        onClick={() => setView('history')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'history'
                            ? 'bg-primary text-white shadow-md'
                            : 'text-muted hover:text-foreground hover:bg-white/5'
                            }`}
                    >
                        History ({sessions.length})
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-sm relative">

                {/* VIEW: CHAT */}
                {view === 'chat' && (
                    <div className="absolute inset-0 flex">

                        {/* LEFT PANEL: Controls & Questions */}
                        <div className="w-80 border-r border-border bg-card/30 flex flex-col p-4 overflow-y-auto">
                            <div className="mb-6">
                                <h3 className="font-bold text-lg mb-2">Interviewer Panel</h3>
                                <p className="text-sm text-muted leading-relaxed">
                                    Chat to <span className="text-primary font-medium">{activeCandidate?.name}</span> as a hiring manager to see their responses.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-muted mb-1.5 block">Question Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(Object.keys(ALL_QUESTION_SETS) as QuestionSetType[]).map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setSelectedSet(type)}
                                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${selectedSet === type
                                                    ? 'bg-primary/10 border-primary text-primary'
                                                    : 'bg-background border-border text-muted hover:border-foreground/20'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase text-muted mb-1.5 block">Category</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                                    >
                                        {Object.keys(ALL_QUESTION_SETS[selectedSet]).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase text-muted mb-1.5 block">Select Question</label>
                                    <select
                                        value={selectedQuestion}
                                        onChange={(e) => {
                                            setSelectedQuestion(e.target.value);
                                            setInput(e.target.value);
                                        }}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none mb-2"
                                    >
                                        <option value="">-- Choose a question --</option>
                                        {availableQuestions.map((q: string, i: number) => (
                                            <option key={i} value={q}>{q.length > 50 ? q.slice(0, 50) + '...' : q}</option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={handlePickRandom}
                                        className="w-full btn btn-outline py-2 text-xs flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                        Pick Random
                                    </button>
                                </div>

                                <div className="pt-6 mt-6 border-t border-border">
                                    <button
                                        onClick={startNewSession}
                                        className="w-full btn btn-outline text-muted text-xs hover:text-foreground"
                                    >
                                        Start Fresh Session
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT PANEL: Chat Application */}
                        <div className="flex-1 flex flex-col relative bg-background/50">
                            {/* Chat Header */}
                            <header className="p-4 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-sm">
                                <div>
                                    <h2 className="font-bold flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                        Live Interview
                                    </h2>
                                    {currentSession && (
                                        <div className="flex items-center gap-2 text-xs text-muted">
                                            <span>Session Active</span>
                                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                            <span className="flex items-center gap-1 text-success">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Auto-saved
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {currentSession && currentSession.status !== 'promoted' && messages.length > 1 && (
                                        <button
                                            onClick={() => promoteToContext(currentSession)}
                                            disabled={!!isPromoting}
                                            className="btn btn-secondary py-1.5 px-3 text-xs flex items-center gap-2"
                                        >
                                            {isPromoting === currentSession.id ? (
                                                <span className="w-3 h-3 border-2 border-muted border-t-foreground rounded-full animate-spin" />
                                            ) : (
                                                <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            )}
                                            Promote to Context
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
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                        <p className="text-muted max-w-sm">
                                            Start typing below to interview {activeCandidate?.name}, or select a question from the left.
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
                            </div>

                            {/* Input */}
                            <div className="p-4 glass border-t border-border z-10">
                                <form
                                    onSubmit={handleSend}
                                    className="max-w-4xl mx-auto flex gap-3"
                                >
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={`Ask a question...`}
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
                        </div>
                    </div>
                )}

                {/* VIEW: HISTORY */}
                {view === 'history' && (
                    <div className="absolute inset-0 flex flex-col bg-card/50">
                        {sessions.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                <p className="text-muted mb-4">No interview history found.</p>
                                <button onClick={() => { startNewSession(); }} className="btn btn-outline">
                                    Start Your First Session
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="flex flex-col space-y-3">
                                    {sessions.map(session => (
                                        <div
                                            key={session.id}
                                            className={`group relative p-4 rounded-xl border transition-all duration-200 flex items-center justify-between gap-4 ${currentSession?.id === session.id
                                                ? 'border-primary/50 bg-primary/5 shadow-md'
                                                : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
                                                }`}
                                        >
                                            {/* Left Section: Info */}
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="bg-background/80 px-2.5 py-1.5 rounded-lg text-xs font-mono text-muted border border-border shrink-0">
                                                    {new Date(session.created_at).toLocaleDateString()}
                                                </div>

                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-base truncate" title={session.title}>
                                                        {session.title || 'Untitled Session'}
                                                    </h3>
                                                    <p className="text-xs text-muted truncate">
                                                        {session.id === currentSession?.id ? 'Currently Active' : 'Click to open'}
                                                    </p>
                                                </div>

                                                {session.status === 'promoted' && (
                                                    <span className="shrink-0 flex items-center gap-1 text-[10px] uppercase font-bold text-success bg-success/10 px-2 py-1 rounded-full border border-success/20">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Context Saved
                                                    </span>
                                                )}
                                            </div>

                                            {/* Right Section: Actions */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => selectSession(session)}
                                                    className="btn btn-outline py-1.5 px-4 text-xs h-9"
                                                >
                                                    Open Chat
                                                </button>
                                                {session.status !== 'promoted' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); promoteToContext(session); }}
                                                        disabled={!!isPromoting}
                                                        className="btn btn-secondary py-1.5 px-3 text-xs h-9 flex items-center gap-2"
                                                        title="Promote to Context"
                                                    >
                                                        {isPromoting === session.id ? (
                                                            <span className="w-3 h-3 border-2 border-muted border-t-foreground rounded-full animate-spin" />
                                                        ) : (
                                                            <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                            </svg>
                                                        )}
                                                        <span className="hidden sm:inline">Promote</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
