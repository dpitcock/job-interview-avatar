'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { CandidateForm } from '@/components/CandidateForm';
import { CandidateProfile } from '@/types/candidate';
import { isReadOnly } from '@/lib/env';

interface EditCandidatePageProps {
    params: Promise<{ id: string }>;
}

export default function EditCandidatePage({ params }: EditCandidatePageProps) {
    const { id } = use(params);
    const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
    const [files, setFiles] = useState<{ filename: string; created_at: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Update endpoint to /api/candidates/${id}
        fetch(`/api/candidates/${id}`)
            .then(res => res.json())
            .then(data => {
                setCandidate(data.user || data.candidate); // Mapping user -> candidate (same structure)
                setFiles(data.files || []);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
                <h1 className="text-2xl font-bold mb-4">Candidate Not Found</h1>
                <Link href="/dashboard/candidates" className="btn btn-primary">Back to Profiles</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="glass sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/candidates" className="p-2 rounded-lg hover:bg-card transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">Edit Profile: {candidate.name}</h1>
                            <p className="text-sm text-muted">Update settings and manage expert context</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
                <section>
                    <CandidateForm candidate={candidate} isReadOnly={isReadOnly} />
                </section>

                {/* Context Tracking Section */}
                <section className="glass rounded-2xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Expert Context (RAG)</h2>
                        <Link href="/dashboard/context" className="btn btn-card text-sm">Upload More</Link>
                    </div>

                    {files.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                            <p className="text-muted">No files added to this profile yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {files.map((file, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl text-primary">📄</span>
                                        <div>
                                            <p className="font-medium">{file.filename}</p>
                                            <p className="text-xs text-muted">Added on {new Date(file.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-sm">
                                        <span className="px-2 py-1 rounded bg-success/10 text-success">Active</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
