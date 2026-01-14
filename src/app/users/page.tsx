'use client';

import Link from 'next/link';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import { UserProfileCard } from '@/components/UserProfileCard';
import { MAX_USERS } from '@/types/user';

export default function UsersPage() {
    const {
        users,
        activeUser,
        canAddUser,
        deleteUser,
        setActiveUser,
    } = useUserProfiles();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="glass sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-lg hover:bg-card transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">User Profiles</h1>
                            <p className="text-sm text-muted">Manage up to {MAX_USERS} interview profiles</p>
                        </div>
                    </div>

                    {canAddUser && (
                        <Link
                            href="/users/new"
                            className="btn btn-primary"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add Person
                        </Link>
                    )}
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* User Cards Grid */}
                {users.length === 0 ? (
                    <section className="glass rounded-2xl p-12 text-center">
                        <div className="text-6xl mb-4">👤</div>
                        <h2 className="text-2xl font-bold mb-2">No Profiles Yet</h2>
                        <p className="text-muted mb-6">
                            Create your first interview profile to get started.
                        </p>
                        {canAddUser && (
                            <Link
                                href="/users/new"
                                className="btn btn-primary glow-primary"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Create Profile
                            </Link>
                        )}
                    </section>
                ) : (
                    <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map((user) => (
                            <UserProfileCard
                                key={user.id}
                                user={user}
                                isActive={user.id === activeUser?.id}
                                onSelect={() => setActiveUser(user.id)}
                                onDelete={() => deleteUser(user.id)}
                            />
                        ))}
                    </section>
                )}

                {/* Info Section */}
                <section className="mt-8 glass rounded-2xl p-6">
                    <h3 className="font-semibold mb-3">💡 About User Profiles</h3>
                    <ul className="space-y-2 text-sm text-muted">
                        <li>• Each profile has its own voice, avatar, and RAG context</li>
                        <li>• Switch between profiles to use different interview identities</li>
                        <li>• Upload separate resumes and experiences for each profile</li>
                        <li>• You can create up to {MAX_USERS} profiles</li>
                    </ul>
                </section>
            </main>
        </div>
    );
}

