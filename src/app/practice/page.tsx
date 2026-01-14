'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStreaming } from '@/hooks/useStreaming';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import { detectQuestionCategory } from '@/lib/prompts';

interface Question {
    id: string;
    category: 'behavioral' | 'technical' | 'situational';
    question: string;
}

const PRACTICE_QUESTIONS: Question[] = [
    // Behavioral
    { id: '1', category: 'behavioral', question: 'Tell me about yourself and your experience.' },
    { id: '2', category: 'behavioral', question: 'Describe a time when you led a team through a difficult project.' },
    { id: '3', category: 'behavioral', question: 'Tell me about a conflict with a coworker and how you resolved it.' },
    { id: '4', category: 'behavioral', question: 'What is your greatest professional achievement?' },
    { id: '5', category: 'behavioral', question: 'Describe a time you failed and what you learned from it.' },
    { id: '6', category: 'behavioral', question: 'How do you handle tight deadlines?' },
    { id: '7', category: 'behavioral', question: 'Tell me about a time you had to learn something quickly.' },
    { id: '8', category: 'behavioral', question: 'Describe your leadership style.' },

    // Technical
    { id: '9', category: 'technical', question: 'Explain React\'s virtual DOM and reconciliation process.' },
    { id: '10', category: 'technical', question: 'How would you optimize a slow Next.js application?' },
    { id: '11', category: 'technical', question: 'What are the tradeoffs between SSR, SSG, and CSR?' },
    { id: '12', category: 'technical', question: 'How do you approach state management in large React apps?' },
    { id: '13', category: 'technical', question: 'Explain TypeScript generics with an example.' },
    { id: '14', category: 'technical', question: 'How do you ensure accessibility in your applications?' },

    // Situational
    { id: '15', category: 'situational', question: 'How would you handle a stakeholder pushing for unrealistic deadlines?' },
    { id: '16', category: 'situational', question: 'What would you do if you disagreed with a technical decision from leadership?' },
    { id: '17', category: 'situational', question: 'How would you onboard a new junior developer to your team?' },
    { id: '18', category: 'situational', question: 'How would you handle discovering a critical bug right before a release?' },
];

type Category = 'all' | 'behavioral' | 'technical' | 'situational';

interface LLMSettings {
    provider: string;
    model: string;
}

export default function PracticePage() {
    const { activeUser, activeUserId } = useUserProfiles();
    const [selectedCategory, setSelectedCategory] = useState<Category>('all');
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [isAnswering, setIsAnswering] = useState(false);
    const [settings, setSettings] = useState<LLMSettings>({ provider: 'ollama', model: 'deepseek-r1:latest' });
    const [autoSpeak, setAutoSpeak] = useState(false);
    const [isSynthesizing, setIsSynthesizing] = useState(false);

    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [defaultModel, setDefaultModel] = useState<string>('deepseek-r1:latest');

    const { response, isStreaming, error, stream, stop, reset } = useStreaming();
    const { playAudio, stop: stopAudio, isPlaying, isLoading: isAudioLoading } = useAudioPlayer();

    // Fetch available models
    useEffect(() => {
        async function fetchModels() {
            try {
                const res = await fetch('/api/llm/models');
                if (res.ok) {
                    const data = await res.json();
                    setAvailableModels(data.models || []);
                    if (data.defaultModel) {
                        setDefaultModel(data.defaultModel);
                        if (!localStorage.getItem('interviewAvatar.settings')) {
                            setSettings(prev => ({ ...prev, model: data.defaultModel }));
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to fetch models:', err);
            }
        }
        fetchModels();
    }, []);

    // Load settings from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('interviewAvatar.settings');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setSettings(parsed.llm || { provider: 'ollama', model: 'deepseek-r1:latest' });
            } catch {
                // Use defaults
            }
        }
    }, []);

    // Save settings to localStorage
    useEffect(() => {
        if (settings.model) {
            localStorage.setItem('interviewAvatar.settings', JSON.stringify({ llm: settings }));
        }
    }, [settings]);

    const filteredQuestions = selectedCategory === 'all'
        ? PRACTICE_QUESTIONS
        : PRACTICE_QUESTIONS.filter(q => q.category === selectedCategory);

    const categoryCount = (cat: Category) =>
        cat === 'all'
            ? PRACTICE_QUESTIONS.length
            : PRACTICE_QUESTIONS.filter(q => q.category === cat).length;

    const startQuestion = (question: Question) => {
        setCurrentQuestion(question);
        setIsAnswering(true);
        reset();
        stopAudio();
    };

    const speakResponse = async (text: string) => {
        if (!text) return;

        setIsSynthesizing(true);
        try {
            const res = await fetch('/api/voice/synthesize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah
                }),
            });

            if (!res.ok) throw new Error('Failed to synthesize speech');

            const audioBlob = await res.blob();
            await playAudio(audioBlob);
        } catch (error) {
            console.error('Speech synthesis error:', error);
        } finally {
            setIsSynthesizing(false);
        }
    };

    const generateAnswer = async () => {
        if (!currentQuestion) return;

        stopAudio();

        await stream(
            [{ role: 'user', content: currentQuestion.question }],
            {
                provider: settings.provider,
                model: settings.model,
                useRag: true,
                userId: activeUserId || undefined,
            }
        );
    };

    const saveToContext = async () => {
        if (!response || !currentQuestion || !activeUserId) return;

        try {
            const res = await fetch('/api/rag', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: activeUserId,
                    content: `Q: ${currentQuestion.question}\nA: ${response}`,
                    metadata: {
                        type: currentQuestion.category,
                        title: `Practice Answer: ${currentQuestion.question.slice(0, 50)}...`,
                    },
                    source: `practice_${Date.now()}.md`
                }),
            });

            if (res.ok) {
                alert('Answer added to your professional context!');
            } else {
                throw new Error('Failed to save to context');
            }
        } catch (err) {
            console.error('Error saving to context:', err);
            alert('Failed to save to context.');
        }
    };

    // Auto-speak when streaming finishes
    useEffect(() => {
        if (autoSpeak && response && !isStreaming && !error) {
            const timer = setTimeout(() => {
                speakResponse(response);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isStreaming, response, autoSpeak, error]);

    const goBack = () => {
        stop();
        stopAudio();
        reset();
        setIsAnswering(false);
        setCurrentQuestion(null);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="glass sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-lg hover:bg-card transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">Practice Mode</h1>
                            <p className="text-sm text-muted">Mock interviews with AI responses</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setAutoSpeak(!autoSpeak)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${autoSpeak ? 'bg-primary/20 text-primary' : 'bg-card text-muted hover:text-foreground'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                            </svg>
                            {autoSpeak ? 'Auto-Speak On' : 'Auto-Speak Off'}
                        </button>

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card text-sm">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="text-muted">
                                {settings.provider === 'ollama' ? '🏠' : settings.provider === 'openai' ? '🟢' : '🟠'}
                            </span>

                            {settings.provider === 'ollama' ? (
                                <select
                                    value={settings.model}
                                    onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                                    className="bg-transparent border-none focus:ring-0 text-foreground font-medium p-0 pr-6 cursor-pointer"
                                >
                                    <option value={defaultModel}>Default ({defaultModel.split(':')[0]})</option>
                                    {availableModels
                                        .filter(m => m !== defaultModel)
                                        .map(model => (
                                            <option key={model} value={model}>
                                                {model.split(':')[0]}
                                            </option>
                                        ))
                                    }
                                </select>
                            ) : (
                                <span className="font-medium">{settings.model.split(':')[0]}</span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {isAnswering && currentQuestion ? (
                    <div className="max-w-3xl mx-auto">
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 text-muted hover:text-foreground mb-6"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                            Back to questions
                        </button>

                        <div className="glass rounded-2xl p-8 mb-6">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${currentQuestion.category === 'behavioral' ? 'bg-primary/20 text-primary' :
                                currentQuestion.category === 'technical' ? 'bg-success/20 text-success' :
                                    'bg-warning/20 text-warning'
                                }`}>
                                {currentQuestion.category}
                            </span>
                            <h2 className="text-2xl font-bold mb-6">{currentQuestion.question}</h2>

                            <div className="flex flex-wrap gap-3">
                                {!isStreaming && !response && (
                                    <button
                                        onClick={generateAnswer}
                                        className="btn btn-primary glow-primary"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                        </svg>
                                        Generate AI Response
                                    </button>
                                )}

                                {isStreaming && (
                                    <button onClick={stop} className="btn bg-error hover:bg-error/80 text-white">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                                        </svg>
                                        Stop Generating
                                    </button>
                                )}

                                {response && !isStreaming && (
                                    <>
                                        <button onClick={generateAnswer} className="btn btn-secondary">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                            </svg>
                                            Regenerate
                                        </button>

                                        <button
                                            onClick={() => isPlaying ? stopAudio() : speakResponse(response)}
                                            disabled={isSynthesizing || isAudioLoading}
                                            className={`btn ${isPlaying ? 'bg-error hover:bg-error/80 text-white' : 'btn-primary'}`}
                                        >
                                            {isSynthesizing || isAudioLoading ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Loading...
                                                </>
                                            ) : isPlaying ? (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                                    </svg>
                                                    Stop
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                                                    </svg>
                                                    Speak
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={saveToContext}
                                            className="btn btn-secondary border-success/30 hover:bg-success/10"
                                        >
                                            <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Add to Context
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {(response || isStreaming || error) && (
                            <div className="glass rounded-2xl p-8">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    {isStreaming ? (
                                        <>
                                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <span className="w-2 h-2 rounded-full bg-success" />
                                            AI Response
                                        </>
                                    )}
                                </h3>
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                        {response}
                                        {isStreaming && <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-1" />}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                            {(['all', 'behavioral', 'technical', 'situational'] as Category[]).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                                        ? 'bg-primary text-white'
                                        : 'bg-card hover:bg-card-hover'
                                        }`}
                                >
                                    {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    <span className="ml-2 opacity-60">({categoryCount(cat)})</span>
                                </button>
                            ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {filteredQuestions.map((q) => (
                                <button
                                    key={q.id}
                                    onClick={() => startQuestion(q)}
                                    className="glass rounded-xl p-6 text-left card-interactive"
                                >
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-3 ${q.category === 'behavioral' ? 'bg-primary/20 text-primary' :
                                        q.category === 'technical' ? 'bg-success/20 text-success' :
                                            'bg-warning/20 text-warning'
                                        }`}>
                                        {q.category}
                                    </span>
                                    <p className="font-medium">{q.question}</p>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
