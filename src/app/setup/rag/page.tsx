'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function RAGSetup() {
    const [documents, setDocuments] = useState<Array<{ id: string; title: string }>>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

        const files = e.dataTransfer.files;
        if (files?.[0]) {
            await handleFile(files[0]);
        }
    };

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await handleFile(file);
        }
    };

    const handleFile = async (file: File) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/rag', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                // Add placeholder documents
                const newDocs = data.ids.map((id: string, i: number) => ({
                    id,
                    title: `Document ${documents.length + i + 1}`,
                }));
                setDocuments(prev => [...prev, ...newDocs]);
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="glass sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-lg hover:bg-card transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">RAG Setup</h1>
                        <p className="text-sm text-muted">Upload behavioral answers & project examples</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Upload Zone */}
                <section className="mb-8">
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
              glass rounded-2xl p-12 text-center cursor-pointer transition-all
              ${dragActive ? 'border-primary glow-primary' : 'hover:border-primary/50'}
              ${isUploading ? 'opacity-50 pointer-events-none' : ''}
            `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,.md,.json"
                            className="hidden"
                            onChange={handleFileInput}
                        />

                        <div className="text-5xl mb-4">📚</div>
                        <h3 className="text-xl font-bold mb-2">
                            {isUploading ? 'Uploading...' : 'Drop files here'}
                        </h3>
                        <p className="text-muted">
                            Upload .txt or .md files with your behavioral answers, project descriptions, or expertise notes.
                        </p>
                    </div>
                </section>

                {/* Document List */}
                <section>
                    <h3 className="text-lg font-semibold mb-4">
                        Indexed Documents ({documents.length})
                    </h3>

                    {documents.length === 0 ? (
                        <div className="glass rounded-xl p-8 text-center text-muted">
                            <p>No documents indexed yet. Upload files to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {documents.map((doc) => (
                                <div key={doc.id} className="glass rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">📄</span>
                                        <span>{doc.title}</span>
                                    </div>
                                    <span className="text-xs text-muted font-mono">{doc.id.slice(0, 12)}...</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

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
            </main>
        </div>
    );
}
