'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-muted">Configure your AI interview environment</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* LLM Settings */}
                <Link href="/dashboard/settings/llm" className="glass p-6 rounded-2xl card-interactive group">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🧠</div>
                    <h2 className="text-xl font-bold mb-2">LLM Provider</h2>
                    <p className="text-muted text-sm">
                        Configure OpenAI, Anthropic, or local Ollama models.
                    </p>
                </Link>

                {/* Voice Settings */}
                <Link href="/dashboard/settings/voice" className="glass p-6 rounded-2xl card-interactive group">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🎙️</div>
                    <h2 className="text-xl font-bold mb-2">Voice Synthesis</h2>
                    <p className="text-muted text-sm">
                        Select and tune the interviewer's voice (ElevenLabs/OpenAI).
                    </p>
                </Link>

                {/* Avatar Settings */}
                <Link href="/dashboard/settings/avatar" className="glass p-6 rounded-2xl card-interactive group">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">👤</div>
                    <h2 className="text-xl font-bold mb-2">Avatar Appearance</h2>
                    <p className="text-muted text-sm">
                        Customize the visual appearance of your AI interviewer.
                    </p>
                </Link>

                {/* Context/RAG Link (Shortcut) */}
                <Link href="/dashboard/context" className="glass p-6 rounded-2xl card-interactive group border-primary/20">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📚</div>
                    <h2 className="text-xl font-bold mb-2">Knowledge Base</h2>
                    <p className="text-muted text-sm">
                        Manage RAG context separately in the Context section.
                    </p>
                </Link>
            </div>
        </div>
    );
}
