'use client';

import Link from 'next/link';
import { useCandidateProfiles } from '@/hooks/useCandidateProfiles';

export default function DashboardHome() {
    const { candidates, activeCandidate, activeCandidateId } = useCandidateProfiles();

    // State A: No candidate selected or no candidates exist
    if (!activeCandidate) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-5xl mb-6">
                    👤
                </div>
                <h2 className="text-3xl font-bold mb-4">Add Your First Candidate</h2>
                <p className="text-lg text-muted mb-8">
                    Upload a 2-minute selfie video to create your digital twin.
                    Your AI avatar will look and sound just like you.
                </p>

                <Link
                    href="/dashboard/candidates/new"
                    className="btn btn-primary glow-primary text-lg px-8 py-4 flex items-center gap-3"
                >
                    <span>Create Candidate</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </Link>

                {candidates.length > 0 && (
                    <div className="mt-12 w-full">
                        <p className="text-sm text-muted mb-4 uppercase tracking-wider font-semibold">Or select existing candidate:</p>
                        <div className="grid sm:grid-cols-2 gap-4 text-left">
                            {candidates.map(candidate => (
                                <Link
                                    key={candidate.id}
                                    href={`/dashboard?candidateId=${candidate.id}`}
                                    className="glass p-4 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-4"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                        {candidate.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold">{candidate.name}</div>
                                        <div className="text-xs text-muted">{candidate.role || 'No role set'}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // State B: Candidate Selected
    return (
        <div className="max-w-6xl mx-auto">
            {/* Hero Welcome */}
            <section className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Welcome back, <span className="gradient-text">{activeCandidate.name.split(' ')[0]}</span> 👋
                </h1>
                <div className="flex flex-wrap gap-3 mb-8">
                    <StatusChip
                        label={activeCandidate.avatar.configured ? "Avatar Ready" : "Avatar Pending"}
                        type={activeCandidate.avatar.configured ? "success" : "warning"}
                    />
                    <StatusChip
                        label={activeCandidate.voice.configured ? "Voice Ready" : "Voice Pending"}
                        type={activeCandidate.voice.configured ? "success" : "warning"}
                    />
                    <StatusChip
                        label={activeCandidate.llm?.preferredMode === 'LOCAL' ? "Local Mode" : "Cloud Mode"}
                        type="info"
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6">
                    <ActionCard
                        title="Start Interview"
                        description="Launch live interview session with your avatar"
                        icon="🎬"
                        href="/dashboard/start"
                        primary
                    />
                    <ActionCard
                        title="Practice Mode"
                        description="Refine your answers with AI feedback"
                        icon="🎯"
                        href="/dashboard/practice"
                    />
                    <ActionCard
                        title="Mock Interview"
                        description="Test your avatar as a candidate"
                        icon="👑"
                        href="/dashboard/mock"
                    />
                </div>
            </section>

            {/* Stats / Activity Placeholder */}
            <section className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                <div className="text-center py-12 text-muted">
                    <p className="mb-2">No recent interviews recorded.</p>
                    <p className="text-sm">Start your first session to track progress.</p>
                </div>
            </section>
        </div>
    );
}

function StatusChip({ label, type }: { label: string; type: 'success' | 'warning' | 'info' }) {
    const bg = {
        success: 'bg-success/10 text-success border-success/20',
        warning: 'bg-warning/10 text-warning border-warning/20',
        info: 'bg-primary/10 text-primary border-primary/20',
    }[type];

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${bg}`}>
            {label}
        </span>
    );
}

function ActionCard({ title, description, icon, href, primary = false }: any) {
    return (
        <Link
            href={href}
            className={`
                p-6 rounded-2xl transition-all border-2
                ${primary
                    ? 'bg-primary/10 border-primary/20 hover:border-primary/50 text-foreground'
                    : 'glass border-transparent hover:border-border'
                }
            `}
        >
            <div className="text-3xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-sm text-muted">{description}</p>
        </Link>
    );
}
