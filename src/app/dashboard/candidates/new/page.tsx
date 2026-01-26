'use client';

import Link from 'next/link';
import { CandidateForm } from '@/components/CandidateForm';
import { isReadOnly } from '@/lib/env';

export default function NewCandidatePage() {
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
                            <h1 className="text-xl font-bold">Add New Candidate</h1>
                            <p className="text-sm text-muted">Create a new digital identity for interviews</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <CandidateForm isReadOnly={isReadOnly} />
            </main>
        </div>
    );
}
