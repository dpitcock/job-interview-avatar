'use client';

import Link from 'next/link';
import { UserForm } from '@/components/UserForm';
import { isReadOnly } from '@/lib/env';

export default function NewUserPage() {
    return (
        <div className="min-h-screen bg-background">
            <header className="glass sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/users" className="p-2 rounded-lg hover:bg-card transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">Add New Person</h1>
                            <p className="text-sm text-muted">Create a new digital identity for interviews</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <UserForm isReadOnly={isReadOnly} />
            </main>
        </div>
    );
}
