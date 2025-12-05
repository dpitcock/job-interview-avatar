'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// LLM Provider Options
const LLM_PROVIDERS = [
    {
        id: 'ollama',
        name: 'Local (Ollama)',
        models: [
            { id: 'deepseek-r1:latest', name: 'DeepSeek R1', description: 'Reasoning model, best for complex answers' },
            { id: 'deepseek-v3:latest', name: 'DeepSeek V3', description: 'Fast general-purpose model' },
            { id: 'llama3.2:latest', name: 'Llama 3.2', description: 'Meta\'s open model' },
            { id: 'mistral:latest', name: 'Mistral', description: 'Efficient 7B model' },
        ],
        requiresKey: false,
        icon: '🏠',
    },
    {
        id: 'openai',
        name: 'OpenAI',
        models: [
            { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable, multimodal' },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable' },
            { id: 'o1-preview', name: 'o1 Preview', description: 'Advanced reasoning' },
            { id: 'o1-mini', name: 'o1 Mini', description: 'Fast reasoning model' },
        ],
        requiresKey: true,
        keyName: 'OPENAI_API_KEY',
        icon: '🟢',
    },
    {
        id: 'anthropic',
        name: 'Anthropic (Claude)',
        models: [
            { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Best balance of speed and quality' },
            { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Fastest, most affordable' },
            { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most capable' },
        ],
        requiresKey: true,
        keyName: 'ANTHROPIC_API_KEY',
        icon: '🟠',
    },
];

// Voice Provider Options (disabled for now)
const VOICE_PROVIDERS = [
    {
        id: 'elevenlabs',
        name: 'ElevenLabs',
        description: 'High-quality voice cloning',
        icon: '🎙️',
        disabled: true,
    },
    {
        id: 'openvoice',
        name: 'OpenVoice (Local)',
        description: 'Free, runs locally',
        icon: '🔊',
        disabled: true,
    },
];

// Avatar Provider Options (disabled for now)
const AVATAR_PROVIDERS = [
    {
        id: 'heygen',
        name: 'HeyGen',
        description: 'Professional live avatars',
        icon: '🎬',
        disabled: true,
    },
    {
        id: 'liveportrait',
        name: 'LivePortrait (Local)',
        description: 'Free, runs locally',
        icon: '👤',
        disabled: true,
    },
];

interface Settings {
    llm: {
        provider: string;
        model: string;
    };
    voice: {
        provider: string;
    };
    avatar: {
        provider: string;
    };
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>({
        llm: { provider: 'ollama', model: 'deepseek-r1:latest' },
        voice: { provider: 'elevenlabs' },
        avatar: { provider: 'heygen' },
    });
    const [saved, setSaved] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    // Load settings from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('interviewAvatar.settings');
        if (stored) {
            try {
                setSettings(JSON.parse(stored));
            } catch {
                // Invalid JSON, use defaults
            }
        }
    }, []);

    const saveSettings = () => {
        localStorage.setItem('interviewAvatar.settings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const testConnection = async () => {
        setTesting(true);
        setTestResult(null);

        try {
            const res = await fetch('/api/llm/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Say "Connection successful!" in exactly those words.' }],
                    useRag: false,
                    // Pass selected provider/model
                    provider: settings.llm.provider,
                    model: settings.llm.model,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setTestResult({
                    success: true,
                    message: `✓ ${data.content?.slice(0, 100) || 'Response received'} (${data.latencyMs}ms)`,
                });
            } else {
                const error = await res.text();
                setTestResult({ success: false, message: error });
            }
        } catch (error) {
            setTestResult({
                success: false,
                message: settings.llm.provider === 'ollama'
                    ? 'Connection failed. Is Ollama running? Try: ollama serve'
                    : 'Connection failed. Check your API key.',
            });
        } finally {
            setTesting(false);
        }
    };

    const selectedProvider = LLM_PROVIDERS.find(p => p.id === settings.llm.provider);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="glass sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-lg hover:bg-card transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">Settings</h1>
                            <p className="text-sm text-muted">Configure AI providers</p>
                        </div>
                    </div>

                    <button
                        onClick={saveSettings}
                        className={`btn ${saved ? 'bg-success hover:bg-success' : 'btn-primary'}`}
                    >
                        {saved ? '✓ Saved!' : 'Save Settings'}
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
                {/* LLM Settings */}
                <section className="glass rounded-2xl p-6">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="text-2xl">🧠</span>
                        Language Model (LLM)
                    </h2>

                    {/* Provider Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-3">Provider</label>
                        <div className="grid md:grid-cols-3 gap-3">
                            {LLM_PROVIDERS.map((provider) => (
                                <button
                                    key={provider.id}
                                    onClick={() => setSettings(s => ({
                                        ...s,
                                        llm: { provider: provider.id, model: provider.models[0].id }
                                    }))}
                                    className={`p-4 rounded-xl text-left transition-all ${settings.llm.provider === provider.id
                                            ? 'bg-primary/20 border-2 border-primary'
                                            : 'bg-card hover:bg-card-hover border-2 border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">{provider.icon}</span>
                                        <span className="font-medium">{provider.name}</span>
                                    </div>
                                    <p className="text-xs text-muted">
                                        {provider.requiresKey ? `Requires ${provider.keyName}` : 'No API key needed'}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Model Selection */}
                    {selectedProvider && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-3">Model</label>
                            <div className="grid md:grid-cols-2 gap-3">
                                {selectedProvider.models.map((model) => (
                                    <button
                                        key={model.id}
                                        onClick={() => setSettings(s => ({
                                            ...s,
                                            llm: { ...s.llm, model: model.id }
                                        }))}
                                        className={`p-4 rounded-xl text-left transition-all ${settings.llm.model === model.id
                                                ? 'bg-success/20 border-2 border-success'
                                                : 'bg-card hover:bg-card-hover border-2 border-transparent'
                                            }`}
                                    >
                                        <div className="font-medium mb-1">{model.name}</div>
                                        <p className="text-xs text-muted">{model.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* API Key Notice */}
                    {selectedProvider?.requiresKey && (
                        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 mb-6">
                            <p className="text-sm text-warning">
                                ⚠️ Requires <code className="px-1.5 py-0.5 rounded bg-card">{selectedProvider.keyName}</code> in your <code className="px-1.5 py-0.5 rounded bg-card">.env.local</code> file.
                            </p>
                        </div>
                    )}

                    {/* Test Connection */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={testConnection}
                            disabled={testing}
                            className="btn btn-secondary"
                        >
                            {testing ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                '🧪 Test Connection'
                            )}
                        </button>

                        {testResult && (
                            <span className={`text-sm ${testResult.success ? 'text-success' : 'text-error'}`}>
                                {testResult.message}
                            </span>
                        )}
                    </div>
                </section>

                {/* Voice Settings (Disabled) */}
                <section className="glass rounded-2xl p-6 opacity-50">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="text-2xl">🎤</span>
                            Voice Synthesis
                        </h2>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted/20 text-muted">
                            Coming Soon
                        </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                        {VOICE_PROVIDERS.map((provider) => (
                            <div
                                key={provider.id}
                                className="p-4 rounded-xl bg-card border-2 border-transparent cursor-not-allowed"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl opacity-50">{provider.icon}</span>
                                    <span className="font-medium text-muted">{provider.name}</span>
                                </div>
                                <p className="text-xs text-muted/50">{provider.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Avatar Settings (Disabled) */}
                <section className="glass rounded-2xl p-6 opacity-50">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="text-2xl">👤</span>
                            Video Avatar
                        </h2>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted/20 text-muted">
                            Coming Soon
                        </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                        {AVATAR_PROVIDERS.map((provider) => (
                            <div
                                key={provider.id}
                                className="p-4 rounded-xl bg-card border-2 border-transparent cursor-not-allowed"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl opacity-50">{provider.icon}</span>
                                    <span className="font-medium text-muted">{provider.name}</span>
                                </div>
                                <p className="text-xs text-muted/50">{provider.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Current Config Display */}
                <section className="glass rounded-2xl p-6">
                    <h2 className="text-lg font-bold mb-4">Current Configuration</h2>
                    <pre className="p-4 rounded-xl bg-card text-sm font-mono overflow-x-auto">
                        {`{
  "llm": {
    "provider": "${settings.llm.provider}",
    "model": "${settings.llm.model}"
  },
  "voice": {
    "provider": "${settings.voice.provider}" // disabled
  },
  "avatar": {
    "provider": "${settings.avatar.provider}" // disabled
  }
}`}
                    </pre>
                </section>
            </main>
        </div>
    );
}
