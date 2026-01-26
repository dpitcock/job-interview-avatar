'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CandidateProfile } from '@/types/candidate';

interface CandidateFormProps {
    candidate?: CandidateProfile;
    isReadOnly?: boolean;
}

export function CandidateForm({ candidate, isReadOnly = false }: CandidateFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [voices, setVoices] = useState<{ id: string; name: string }[]>([]);
    const [avatars, setAvatars] = useState<{ id: string; name: string; preview?: string }[]>([]);
    const [localModels, setLocalModels] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        name: candidate?.name || '',
        email: candidate?.email || '',
        phone: candidate?.phone || '',
        role: candidate?.role || '',
        situation: candidate?.situation || '',
        avatarName: candidate?.avatar?.avatarName || '',
        voiceId: candidate?.voice?.voiceId || '',
        localModel: candidate?.llm?.localModel || 'gemma3:latest',
        cloudProvider: candidate?.llm?.cloudProvider || 'openai',
        cloudModel: candidate?.llm?.cloudModel || 'gpt-4o',
    });

    useEffect(() => {
        // Fetch voices
        fetch('/api/voice/list').then(res => res.json()).then(data => setVoices(data.voices || []));
        // Fetch avatars
        fetch('/api/video/avatars').then(res => res.json()).then(data => setAvatars(data.avatars || []));
        // Fetch local models
        fetch('/api/llm/models').then(res => res.json()).then(data => setLocalModels(data.models || []));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isReadOnly) return;

        setLoading(true);
        try {
            // TODO: Update API endpoints
            const endpoint = candidate ? `/api/candidates/${candidate.id}` : '/api/candidates';
            const method = candidate ? 'PATCH' : 'POST';

            const selectedAvatar = avatars.find(a => a.id === formData.avatarName);
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                situation: formData.situation,
                avatar: {
                    configured: !!formData.avatarName,
                    avatarName: formData.avatarName,
                    imageUrl: selectedAvatar?.preview || candidate?.avatar?.imageUrl,
                },
                voice: {
                    configured: !!formData.voiceId,
                    voiceId: formData.voiceId,
                },
                llm: {
                    localModel: formData.localModel,
                    cloudProvider: formData.cloudProvider,
                    cloudModel: formData.cloudModel,
                }
            };

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push('/dashboard/candidates');
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to save candidate:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {candidate?.isDemo && (
                <div className="glass bg-primary/10 border-primary/20 rounded-2xl p-6 flex items-center gap-4">
                    <div className="text-3xl">🧩</div>
                    <div>
                        <h4 className="font-bold text-primary">Demo Account</h4>
                        <p className="text-sm text-muted">This is a pre-configured profile with mock data for demonstration purposes.</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start p-6 glass rounded-2xl">
                <div className="w-32 h-32 rounded-2xl bg-primary/10 border-2 border-white/10 shadow-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    {avatars.find(a => a.id === formData.avatarName)?.preview || candidate?.avatar?.imageUrl ? (
                        <img
                            src={avatars.find(a => a.id === formData.avatarName)?.preview || candidate?.avatar?.imageUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-5xl font-black text-primary/40">
                            {formData.name.charAt(0).toUpperCase() || '?'}
                        </span>
                    )}
                </div>
                <div className="flex-1 text-center md:text-left pt-2">
                    <h2 className="text-3xl font-black gradient-text mb-1">{formData.name || 'New Profile'}</h2>
                    <p className="text-muted text-sm flex items-center justify-center md:justify-start gap-2">
                        <span className={`w-2 h-2 rounded-full ${candidate?.avatar.configured ? 'bg-success' : 'bg-warning'}`} />
                        {candidate?.avatar.configured ? `Avatar: ${candidate.avatar.avatarName}` : 'No Avatar Configured'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="glass rounded-2xl p-6 space-y-4">
                        <h3 className="text-lg font-bold">Identity</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                disabled={isReadOnly}
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="input w-full"
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                disabled={isReadOnly}
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="input w-full"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Professional Role</label>
                            <input
                                type="text"
                                disabled={isReadOnly}
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="input w-full"
                                placeholder="e.g. Senior Frontend Engineer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Interview Situation</label>
                            <textarea
                                disabled={isReadOnly}
                                value={formData.situation}
                                onChange={e => setFormData({ ...formData, situation: e.target.value })}
                                className="input w-full h-24 resize-none"
                                placeholder="e.g. Applying for a staff engineer role at a Fintech company. The interview is focusing on system design."
                            />
                        </div>
                    </div>

                    {/* LLM Selection */}
                    <div className="glass rounded-2xl p-6 space-y-6">
                        <h3 className="text-lg font-bold">Brain (LLM Preferences)</h3>

                        {/* Local Model */}
                        <div className="space-y-3 pb-4 border-b border-border/50">
                            <h4 className="text-sm font-semibold text-primary">Local Setup (Ollama)</h4>
                            <div>
                                <label className="block text-xs text-muted mb-1">Preferred Local Model</label>
                                <select
                                    disabled={isReadOnly}
                                    value={formData.localModel}
                                    onChange={e => setFormData({ ...formData, localModel: e.target.value })}
                                    className="select w-full"
                                >
                                    {localModels.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                    {!localModels.includes(formData.localModel) && (
                                        <option value={formData.localModel}>{formData.localModel}</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Cloud Model */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-primary">Cloud Setup (Vercel/Production)</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-muted mb-1">Provider</label>
                                    <select
                                        disabled={isReadOnly}
                                        value={formData.cloudProvider}
                                        onChange={e => setFormData({ ...formData, cloudProvider: e.target.value })}
                                        className="select w-full"
                                    >
                                        <option value="openai">OpenAI</option>
                                        <option value="anthropic">Anthropic</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-muted mb-1">Model Name</label>
                                    <input
                                        type="text"
                                        disabled={isReadOnly}
                                        value={formData.cloudModel}
                                        onChange={e => setFormData({ ...formData, cloudModel: e.target.value })}
                                        className="input w-full"
                                        placeholder={formData.cloudProvider === 'openai' ? 'gpt-4o' : 'claude-3-5-sonnet...'}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Avatar Selection */}
                    <div className="glass rounded-2xl p-6 space-y-4">
                        <h3 className="text-lg font-bold">Visuals (HeyGen)</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">Avatar</label>
                            <select
                                disabled={isReadOnly}
                                value={formData.avatarName}
                                onChange={e => setFormData({ ...formData, avatarName: e.target.value })}
                                className="select w-full"
                            >
                                <option value="">Select an Avatar</option>
                                {avatars.map(a => (
                                    <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                                ))}
                            </select>
                        </div>
                        {(formData.avatarName || candidate?.avatar?.imageUrl) && (
                            <div className="mt-4 aspect-square max-w-[200px] rounded-xl overflow-hidden glass border border-border">
                                <img
                                    src={avatars.find(a => a.id === formData.avatarName)?.preview || candidate?.avatar?.imageUrl}
                                    alt="Avatar Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>

                    {/* Voice Selection */}
                    <div className="glass rounded-2xl p-6 space-y-4">
                        <h3 className="text-lg font-bold">Voice (ElevenLabs)</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">Voice</label>
                            <select
                                disabled={isReadOnly}
                                value={formData.voiceId}
                                onChange={e => setFormData({ ...formData, voiceId: e.target.value })}
                                className="select w-full"
                            >
                                <option value="">Select a Voice</option>
                                {voices.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* RAG Section (Read Only in Form) */}
                    {candidate && (
                        <div className="glass rounded-2xl p-6 col-span-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">Expert Knowledge (RAG)</h3>
                                {candidate.isDemo && (
                                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded font-medium">
                                        Mock Data
                                    </span>
                                )}
                            </div>

                            {candidate.isDemo && (
                                <div className="mb-4 p-3 rounded-xl bg-card border border-border text-sm flex items-start gap-3">
                                    <span className="text-lg">📁</span>
                                    <p className="text-muted leading-relaxed">
                                        The original source documents for this demo profile can be found in the
                                        <code className="mx-1 px-1.5 py-0.5 rounded bg-border text-primary font-medium">docs/mock-user-context-files</code>
                                        directory of the repository.
                                    </p>
                                </div>
                            )}

                            <p className="text-sm text-muted mb-4 italic">
                                RAG documents are managed in the <Link href="/dashboard/context" className="text-primary hover:underline">Context</Link> section.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard/candidates')}
                        className="btn btn-card"
                    >
                        Cancel
                    </button>
                    {!isReadOnly && (
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary px-8"
                        >
                            {loading ? 'Saving...' : candidate ? 'Save Changes' : 'Create Candidate'}
                        </button>
                    )}
                </div>
                {isReadOnly && (
                    <p className="text-center text-sm text-muted">
                        Profile editing is disabled in public demo mode.
                    </p>
                )}
            </form>
        </div>
    );
}
