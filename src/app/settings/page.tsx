'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const router = useRouter();
    const [settings, setSettings] = useState({
        llm_mode: 'LOCAL',
        llm_local_model: 'gemma3:latest',
        llm_cloud_model: 'gpt-4o',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data.settings);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setSaving(false);
        }
    };

    const testConnection = async () => {
        setTesting(true);
        setTestResult(null);

        try {
            const res = await fetch('/api/llm/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Say "Connection successful!"' }],
                    useRag: false,
                    provider: settings.llm_mode === 'LOCAL' ? 'ollama' : (settings.llm_cloud_model.includes('claude') ? 'anthropic' : 'openai'),
                    model: settings.llm_mode === 'LOCAL' ? settings.llm_local_model : settings.llm_cloud_model,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setTestResult({
                    success: true,
                    message: `✓ Success! Response received in ${data.latencyMs}ms`,
                });
            } else {
                setTestResult({ success: false, message: 'Connection failed. Check your setup.' });
            }
        } catch (error) {
            setTestResult({ success: false, message: 'Network error or provider unreachable.' });
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="glass sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-lg hover:bg-card transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </Link>
                        <h1 className="text-xl font-bold text-gradient">Application Settings</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <div className="space-y-8">
                    {/* Mode Toggle */}
                    <section className="glass rounded-2xl p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-1">Default Interview Mode</h3>
                                <p className="text-sm text-muted">Set whether the app defaults to local or cloud models</p>
                            </div>
                            <div className="flex p-1 bg-card rounded-xl border border-border shrink-0">
                                <button
                                    onClick={() => setSettings({ ...settings, llm_mode: 'LOCAL' })}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${settings.llm_mode === 'LOCAL' ? 'bg-primary text-white shadow-lg' : 'text-muted'}`}
                                >
                                    LOCAL
                                </button>
                                <button
                                    onClick={() => setSettings({ ...settings, llm_mode: 'CLOUD' })}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${settings.llm_mode === 'CLOUD' ? 'bg-primary text-white shadow-lg' : 'text-muted'}`}
                                >
                                    CLOUD
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* LLM Config */}
                    <section className="glass rounded-2xl p-8 space-y-8">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span>🧠</span> LLM Defaults
                        </h3>

                        <div className="grid gap-6">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-primary">Default Local LLM</label>
                                <input
                                    type="text"
                                    value={settings.llm_local_model}
                                    onChange={(e) => setSettings({ ...settings, llm_local_model: e.target.value })}
                                    className="input w-full font-mono text-sm"
                                    placeholder="e.g., deepseek-r1:latest"
                                />
                                <p className="mt-2 text-[10px] text-muted italic">Used when mode is LOCAL or for initial user setup.</p>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <label className="block text-sm font-bold mb-2 text-primary">Default Cloud LLM</label>
                                <input
                                    type="text"
                                    value={settings.llm_cloud_model}
                                    onChange={(e) => setSettings({ ...settings, llm_cloud_model: e.target.value })}
                                    className="input w-full font-mono text-sm"
                                    placeholder="e.g., gpt-4o or claude-3-5-sonnet"
                                />
                                <p className="mt-2 text-[10px] text-muted italic">Used when mode is CLOUD. App will auto-detect provider.</p>
                            </div>
                        </div>

                        <div className="pt-8 flex flex-col items-center border-t border-white/5 gap-4">
                            <button
                                onClick={saveSettings}
                                disabled={saving}
                                className={`w-full btn ${saved ? 'bg-success hover:bg-success' : 'btn-primary'} py-4 text-lg`}
                            >
                                {saving ? 'Saving...' : saved ? '✓ Settings Saved' : 'Save Configuration'}
                            </button>

                            <div className="flex items-center gap-4 w-full">
                                <button
                                    onClick={testConnection}
                                    disabled={testing}
                                    className="btn btn-secondary flex-1"
                                >
                                    {testing ? 'Testing...' : '🧪 Test Connection'}
                                </button>
                                {testResult && (
                                    <div className={`px-4 py-2 rounded-lg text-sm font-medium ${testResult.success ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                                        {testResult.message}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
