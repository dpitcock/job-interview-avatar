'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type LLMStatus = {
    mode: 'LOCAL' | 'CLOUD';
    local: { available: boolean; model: string };
    cloud: { available: boolean; provider: string };
};

export default function LLMSetup() {
    const [status, setStatus] = useState<LLMStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<string | null>(null);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/status');
            if (res.ok) {
                const data = await res.json();
                setStatus({
                    mode: data.mode,
                    local: { available: data.llm.ready && data.mode === 'LOCAL', model: 'DeepSeek R1' },
                    cloud: { available: data.llm.ready && data.mode === 'CLOUD', provider: 'Claude 3.5' },
                });
            }
        } catch {
            // API not ready
        } finally {
            setLoading(false);
        }
    };

    const testLLM = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const res = await fetch('/api/llm/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Say "Hello, I am ready!" in one sentence.' }],
                    useRag: false,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setTestResult(data.content);
            } else {
                setTestResult('Error: ' + (await res.text()));
            }
        } catch (error) {
            setTestResult('Connection failed. Is Ollama running?');
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">LLM Setup</h1>
                        <p className="text-muted">Configure your AI model (System-wide)</p>
                    </div>
                </div>

                <div>



                    {/* Current Mode */}
                    <section className="glass rounded-2xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Current Mode</h2>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status?.mode === 'LOCAL' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
                                }`}>
                                {status?.mode || 'Loading...'}
                            </span>
                        </div>
                        <p className="text-muted text-sm">
                            Set <code className="px-1.5 py-0.5 rounded bg-card">INTERVIEW_MODE</code> in your <code className="px-1.5 py-0.5 rounded bg-card">.env.local</code> file to switch modes.
                        </p>
                    </section>

                    {/* Provider Cards */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Local */}
                        <div className={`glass rounded-2xl p-6 ${status?.mode === 'LOCAL' ? 'ring-2 ring-success' : ''}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">🏠 Local Mode</h3>
                                    <p className="text-sm text-muted">Ollama + DeepSeek R1</p>
                                </div>
                                {status?.mode === 'LOCAL' && (
                                    <span className="w-3 h-3 rounded-full bg-success animate-pulse-slow" />
                                )}
                            </div>
                            <ul className="space-y-2 text-sm mb-4">
                                <li className="flex items-center gap-2">
                                    <span className="text-success">✓</span> 100% Private
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-success">✓</span> No API costs
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-success">✓</span> M4 Mac optimized
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-warning">~</span> 2-3s latency
                                </li>
                            </ul>
                            <div className="text-xs text-muted">
                                Requires: <code>ollama pull deepseek-r1:latest</code>
                            </div>
                        </div>

                        {/* Cloud */}
                        <div className={`glass rounded-2xl p-6 ${status?.mode === 'CLOUD' ? 'ring-2 ring-primary' : ''}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">☁️ Cloud Mode</h3>
                                    <p className="text-sm text-muted">Claude 3.5 / GPT-4o</p>
                                </div>
                                {status?.mode === 'CLOUD' && (
                                    <span className="w-3 h-3 rounded-full bg-primary animate-pulse-slow" />
                                )}
                            </div>
                            <ul className="space-y-2 text-sm mb-4">
                                <li className="flex items-center gap-2">
                                    <span className="text-success">✓</span> Best quality
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-success">✓</span> 1-2s latency
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-warning">~</span> API costs
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-warning">~</span> Data sent to cloud
                                </li>
                            </ul>
                            <div className="text-xs text-muted">
                                Requires: <code>ANTHROPIC_API_KEY</code> or <code>OPENAI_API_KEY</code>
                            </div>
                        </div>
                    </div>

                    {/* Test Section */}
                    <section className="glass rounded-2xl p-6">
                        <h3 className="font-semibold mb-4">🧪 Test Connection</h3>
                        <button
                            onClick={testLLM}
                            disabled={testing || loading}
                            className="btn btn-primary mb-4"
                        >
                            {testing ? 'Testing...' : 'Test LLM'}
                        </button>

                        {testResult && (
                            <div className={`p-4 rounded-xl text-sm ${testResult.startsWith('Error') || testResult.includes('failed')
                                ? 'bg-error/20 text-error'
                                : 'bg-success/20 text-success'
                                }`}>
                                {testResult}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
