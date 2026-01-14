'use client';

import { IS_VERCEL } from '@/lib/env';

export function VercelBanner() {
    if (!IS_VERCEL) return null;

    return (
        <div className="bg-primary/20 border-b border-primary/30 py-3 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-xl">🌐</span>
                    <p className="text-sm font-medium">
                        <span className="font-bold">Demo Mode:</span> This is a read-only preview running on Vercel.
                        Data persistence is disabled and AI models are mocked.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <a
                        href="https://github.com/dpitcock/job-interview-avatar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold bg-primary text-white px-4 py-2 rounded-full hover:glow-primary transition-all"
                    >
                        Install Locally
                    </a>
                </div>
            </div>
        </div>
    );
}
