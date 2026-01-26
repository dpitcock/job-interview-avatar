'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCandidateProfiles } from '@/hooks/useCandidateProfiles';
import { CandidateSelector } from '@/components/CandidateSelector';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const { candidates, activeCandidate, setActiveCandidate } = useCandidateProfiles();
    const [isSidenavOpen, setIsSidenavOpen] = useState(false);

    const navItems = [
        { href: '/dashboard', label: 'Dashboard Home', icon: '🏠' },
        { href: '/dashboard/start', label: 'Start Interview', icon: '🎬' },
        { href: '/dashboard/practice', label: 'Practice Mode', icon: '🎯' },
        { href: '/dashboard/mock', label: 'Mock Interviews', icon: '👑' },
        { href: '/dashboard/chatbot', label: 'Interview Chatbot', icon: '💬' },
        { href: '/dashboard/context', label: 'Context', icon: '📚' },
        { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            {/* Mobile Sidenav Overlay */}
            {isSidenavOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidenavOpen(false)}
                />
            )}

            {/* Sidenav */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border
                transform transition-transform duration-200 ease-in-out
                md:translate-x-0 md:static
                ${isSidenavOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-16 flex items-center px-6 border-b border-border">
                    <Link href="/" className="text-xl font-bold gradient-text">
                        Twinterview
                    </Link>
                </div>

                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidenavOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-muted hover:bg-white/5 hover:text-foreground'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                    <div className="text-xs text-muted text-center">
                        v0.1.0 • Open Source
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header/Toolbar */}
                <header className="h-16 border-b border-border glass sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2 -ml-2 text-muted hover:text-foreground"
                            onClick={() => setIsSidenavOpen(true)}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Breadcrumbs or Page Title could go here */}
                    </div>

                    <div className="flex items-center gap-4">
                        <CandidateSelector
                            candidates={candidates}
                            activeCandidate={activeCandidate}
                            onSelectCandidate={setActiveCandidate}
                        />

                        {activeCandidate && (
                            <div className="hidden md:flex items-center gap-2 text-xs bg-card px-3 py-1.5 rounded-full border border-border">
                                <span className={`w-2 h-2 rounded-full ${activeCandidate.llm?.preferredMode === 'LOCAL' ? 'bg-success' : 'bg-primary'}`} />
                                <span className="font-medium text-muted">
                                    {activeCandidate.llm?.preferredMode === 'LOCAL' ? 'Local Mode' : 'Cloud Mode'}
                                </span>
                            </div>
                        )}
                    </div>
                </header>

                {/* Subheader (Status Bar) */}
                {activeCandidate && (
                    <div className="bg-card/50 border-b border-border px-4 md:px-8 py-2 flex overflow-x-auto gap-6 no-scrollbar text-xs">
                        <Link href="/dashboard/settings#llm" className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap">
                            <span className="text-muted">Brain:</span>
                            <span className="font-medium">
                                {activeCandidate.llm?.preferredMode === 'LOCAL'
                                    ? `Ollama (${activeCandidate.llm.localModel})`
                                    : `${activeCandidate.llm?.cloudProvider} (${activeCandidate.llm?.cloudModel})`
                                }
                            </span>
                        </Link>
                        <Link href="/dashboard/settings#voice" className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap">
                            <span className="text-muted">Voice:</span>
                            <span className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${activeCandidate.voice.configured ? 'bg-success' : 'bg-warning'}`} />
                                {activeCandidate.voice.configured ? 'Ready' : 'Not Configured'}
                            </span>
                        </Link>
                        <Link href="/dashboard/settings#avatar" className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap">
                            <span className="text-muted">Avatar:</span>
                            <span className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${activeCandidate.avatar.configured ? 'bg-success' : 'bg-warning'}`} />
                                {activeCandidate.avatar.configured ? 'Ready' : 'Not Configured'}
                            </span>
                        </Link>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
