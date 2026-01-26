'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCandidateProfiles } from '@/hooks/useCandidateProfiles';
import { isReadOnly } from '@/lib/env';

export default function RagSetupPage() {
    const { activeCandidate, activeCandidateId, isLoaded } = useCandidateProfiles();
    const [documents, setDocuments] = useState<Array<{ id: string; title: string }>>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch document count for active candidate
    useEffect(() => {
        if (isLoaded && activeCandidateId) {
            fetchDocuments();
        } else {
            setDocuments([]);
        }
    }, [activeCandidateId, isLoaded]);

    const fetchDocuments = async () => {
        try {
            const res = await fetch(`/api/rag?userId=${activeCandidateId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.files) {
                    setDocuments(data.files);
                } else if (data.count > 0) {
                    // Fallback for old API version
                    setDocuments(Array.from({ length: data.count }, (_, i) => ({
                        id: `doc_${i}`,
                        title: `Document ${i + 1}`,
                    })));
                }
            }
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await handleFiles(files);
        }
    };

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (files.length > 0) {
            await handleFiles(files);
        }
    };

    const handleFiles = async (files: File[]) => {
        if (!activeCandidateId) return;

        setIsUploading(true);
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('candidateId', activeCandidateId);

                const res = await fetch('/api/rag', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) {
                    console.error(`Failed to upload ${file.name}`);
                }
            }
            // Refresh document list after all uploads
            await fetchDocuments();
        } catch (error) {
            console.error('Upload process failed:', error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteFile = async (filename: string) => {
        if (!activeCandidateId || isReadOnly) return;

        try {
            const res = await fetch(`/api/rag?candidateId=${activeCandidateId}&filename=${encodeURIComponent(filename)}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setDocuments(prev => prev.filter(doc => doc.title !== filename));
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleClearDocuments = async () => {
        if (!activeCandidateId) return;

        try {
            await fetch(`/api/rag?candidateId=${activeCandidateId}`, {
                method: 'DELETE',
            });
            setDocuments([]);
        } catch (error) {
            console.error('Clear failed:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Context (RAG)</h1>
                    <p className="text-muted">
                        {activeCandidate
                            ? `Upload documents for ${activeCandidate.name}`
                            : 'Upload behavioral answers & project examples'
                        }
                    </p>
                </div>
                {activeCandidate && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        {activeCandidate.name}
                    </div>
                )}
            </div>

            <div>
                {/* No User Warning */}
                {isLoaded && !activeCandidate && (
                    <section className="glass rounded-2xl p-8 mb-8 border-2 border-warning text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold mb-2">No Candidate Selected</h2>
                        <p className="text-muted mb-4">
                            Please select or create a candidate profile to upload documents.
                        </p>
                        <Link href="/dashboard/candidates" className="btn btn-primary">
                            Manage Candidates
                        </Link>
                    </section>
                )}

                {/* Demo Mode Notice */}
                {isReadOnly && activeCandidate && (
                    <section className="glass rounded-2xl p-6 mb-8 border border-primary/30 bg-primary/10">
                        <p className="text-sm font-medium">
                            <span className="font-bold">🌐 Demo Mode:</span> Uploads are disabled.
                            The files below are for demonstration purposes.
                        </p>
                    </section>
                )}

                {/* Upload Zone */}
                {activeCandidate && (
                    <section className="mb-8">
                        <div
                            onDragEnter={!isReadOnly ? handleDrag : undefined}
                            onDragLeave={!isReadOnly ? handleDrag : undefined}
                            onDragOver={!isReadOnly ? handleDrag : undefined}
                            onDrop={!isReadOnly ? handleDrop : undefined}
                            onClick={!isReadOnly ? () => fileInputRef.current?.click() : undefined}
                            className={`
                glass rounded-2xl p-12 text-center transition-all
                ${!isReadOnly ? 'cursor-pointer hover:border-primary/50' : 'cursor-default opacity-70'}
                ${dragActive && !isReadOnly ? 'border-primary glow-primary' : ''}
                ${isUploading ? 'opacity-50 pointer-events-none' : ''}
              `}
                        >
                            {!isReadOnly && (
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".txt,.md,.json,.pdf,.docx,.doc"
                                    className="hidden"
                                    multiple
                                    onChange={handleFileInput}
                                />
                            )}

                            <div className="text-5xl mb-4">📚</div>
                            <h3 className="text-xl font-bold mb-2">
                                {isReadOnly ? 'Context Repository' : isUploading ? 'Uploading...' : 'Drop files here'}
                            </h3>
                            <p className="text-muted">
                                {isReadOnly
                                    ? 'In a local installation, you can upload resumes and notes here.'
                                    : 'Upload .pdf, .docx, .md, or .txt files with your resume, behavioral answers, or project notes.'
                                }
                            </p>
                        </div>
                    </section>
                )}

                {/* Document List */}
                {activeCandidate && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                                Indexed Documents ({documents.length})
                            </h3>
                            {documents.length > 0 && !isReadOnly && (
                                <button
                                    onClick={handleClearDocuments}
                                    className="text-sm text-error hover:underline"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {documents.length === 0 ? (
                            <div className="glass rounded-xl p-8 text-center text-muted">
                                <p>No documents indexed yet for {activeCandidate.name}. Upload files to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="glass rounded-xl p-4 flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">📄</span>
                                            <div>
                                                <p className="font-medium">{doc.title}</p>
                                                {doc.id.startsWith('doc_') && (
                                                    <p className="text-[10px] text-muted font-mono">{doc.id}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!isReadOnly && (
                                                <button
                                                    onClick={() => handleDeleteFile(doc.title)}
                                                    className="p-2 text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remove document"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                            <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold">ACTIVE</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Tips */}
                <section className="mt-8 glass rounded-2xl p-6">
                    <h3 className="font-semibold mb-3">💡 Tips for better responses</h3>
                    <ul className="space-y-2 text-sm text-muted">
                        <li>• Include STAR method examples (Situation, Task, Action, Result)</li>
                        <li>• Add specific metrics and outcomes from your projects</li>
                        <li>• Include technical decisions and tradeoffs you've made</li>
                        <li>• Add common interview questions with your ideal answers</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
