'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CandidateProfile } from '@/types/candidate';

interface CandidateProfileCardProps {
    candidate: CandidateProfile;
    isActive: boolean;
    onSelect: () => void;
    onUpdate: (updates: Partial<CandidateProfile>) => void;
    onDelete: () => void;
}

export function CandidateProfileCard({
    candidate,
    isActive,
    onSelect,
    onDelete,
}: Omit<CandidateProfileCardProps, 'onUpdate'>) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        // TODO: Update URL parameter for sharing
        const url = `${window.location.origin}/dashboard?candidateId=${candidate.id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className={`glass rounded-2xl p-6 transition-all ${isActive ? 'ring-2 ring-primary glow-primary' : 'hover:border-primary/50'
                }`}
        >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-white/10 shadow-lg">
                    {candidate.avatar.imageUrl ? (
                        <img
                            src={candidate.avatar.imageUrl}
                            alt={candidate.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-2xl font-black text-primary">{candidate.name.charAt(0).toUpperCase()}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold truncate">{candidate.name}</h3>
                        {candidate.isDemo && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary font-bold uppercase tracking-wider">Demo</span>
                        )}
                    </div>
                    {isActive && (
                        <span className="text-xs text-primary font-medium">Active</span>
                    )}
                </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-1 mb-4 text-sm text-muted">
                {candidate.email && (
                    <div className="flex items-center gap-2 truncate">
                        <span>📧</span>
                        <span className="truncate">{candidate.email}</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <span>🤖</span>
                    <span>{candidate.llm?.cloudProvider || 'ollama'} ({candidate.llm?.localModel || 'local'})</span>
                </div>
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <div
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs ${candidate.voice.configured ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}
                >
                    <span className={`w-2 h-2 rounded-full ${candidate.voice.configured ? 'bg-success' : 'bg-warning'}`} />
                    Voice {candidate.voice.configured ? '✓' : '⚠'}
                </div>
                <div
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs ${candidate.avatar.configured ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}
                >
                    <span className={`w-2 h-2 rounded-full ${candidate.avatar.configured ? 'bg-success' : 'bg-warning'}`} />
                    Avatar {candidate.avatar.configured ? '✓' : '⚠'}
                </div>
            </div>

            {/* Actions */}
            {isDeleting ? (
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsDeleting(false)}
                        className="flex-1 px-3 py-2 rounded-lg text-sm bg-card hover:bg-border transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onDelete();
                            setIsDeleting(false);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg text-sm bg-error text-white hover:bg-error/80 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            ) : (
                <div className="flex gap-2">
                    {!isActive ? (
                        <button
                            onClick={onSelect}
                            className="flex-1 px-3 py-2 rounded-lg text-sm bg-primary text-white hover:bg-primary/80 transition-all font-medium"
                        >
                            Select
                        </button>
                    ) : (
                        <div className="flex-1" />
                    )}
                    <button
                        onClick={handleShare}
                        className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-1.5 min-w-[80px] ${copied
                            ? 'bg-success/20 text-success border border-success/30'
                            : 'bg-card hover:bg-border border border-transparent'
                            }`}
                        title="Copy direct link to this profile"
                    >
                        {copied ? (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                <span>Share</span>
                            </>
                        )}
                    </button>
                    <Link
                        href={`/dashboard/candidates/${candidate.id}/edit`}
                        className="px-4 py-2 rounded-lg text-sm bg-card hover:bg-border transition-colors flex items-center justify-center"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => setIsDeleting(true)}
                        className="px-3 py-2 rounded-lg text-sm text-error hover:bg-error/10 transition-colors"
                        title="Delete profile"
                    >
                        🗑
                    </button>
                </div>
            )}
        </div>
    );
}
