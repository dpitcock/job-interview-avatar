'use client';

import Link from 'next/link';
import { useCandidateProfiles } from '@/hooks/useCandidateProfiles';
import { CandidateProfileCard } from '@/components/CandidateProfileCard';
import { MAX_CANDIDATES } from '@/types/candidate';

export default function CandidatesPage() {
    const {
        candidates,
        activeCandidate,
        canAddCandidate,
        deleteCandidate,
        setActiveCandidate,
    } = useCandidateProfiles();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Candidates</h1>
                    <p className="text-muted">Manage up to {MAX_CANDIDATES} interview profiles</p>
                </div>
                {canAddCandidate && (
                    <Link
                        href="/dashboard/candidates/new"
                        className="btn btn-primary"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add Candidate
                    </Link>
                )}
            </div>

            {/* Candidates Cards Grid */}
            {candidates.length === 0 ? (
                <section className="glass rounded-2xl p-12 text-center">
                    <div className="text-6xl mb-4">👤</div>
                    <h2 className="text-2xl font-bold mb-2">No Candidates Yet</h2>
                    <p className="text-muted mb-6">
                        Create your first candidate profile to get started.
                    </p>
                    {canAddCandidate && (
                        <Link
                            href="/dashboard/candidates/new"
                            className="btn btn-primary glow-primary"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Create Candidate
                        </Link>
                    )}
                </section>
            ) : (
                <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidates.map((candidate) => (
                        <CandidateProfileCard
                            key={candidate.id}
                            candidate={candidate}
                            isActive={candidate.id === activeCandidate?.id}
                            onSelect={() => setActiveCandidate(candidate.id)}
                            onDelete={() => deleteCandidate(candidate.id)}
                        />
                    ))}
                </section>
            )}

            {/* Info Section */}
            <section className="mt-8 glass rounded-2xl p-6">
                <h3 className="font-semibold mb-3">💡 About Candidate Profiles</h3>
                <ul className="space-y-2 text-sm text-muted">
                    <li>• Each profile has its own voice, avatar, and RAG context</li>
                    <li>• Switch between profiles to use different interview identities</li>
                    <li>• Upload separate resumes and experiences for each profile</li>
                    <li>• You can create up to {MAX_CANDIDATES} profiles</li>
                </ul>
            </section>
        </div>

    );
}

