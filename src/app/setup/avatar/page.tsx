'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AvatarSetup() {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [avatarReady, setAvatarReady] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const createAvatar = async () => {
        if (!imageFile) return;

        setIsCreating(true);
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const res = await fetch('/api/video/avatar', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                setAvatarReady(true);
            }
        } catch (error) {
            console.error('Avatar creation failed:', error);
        } finally {
            setIsCreating(false);
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
                        <h1 className="text-xl font-bold">Avatar Setup</h1>
                        <p className="text-sm text-muted">Upload a photo to create your AI avatar</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Upload Section */}
                <section className="glass rounded-2xl p-8 mb-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        {/* Image Preview */}
                        <div
                            onClick={() => !avatarReady && fileInputRef.current?.click()}
                            className={`
                w-64 h-64 rounded-2xl overflow-hidden flex items-center justify-center
                ${avatarReady ? '' : 'cursor-pointer hover:border-primary'}
                ${imagePreview ? '' : 'glass border-2 border-dashed border-border'}
              `}
                        >
                            {imagePreview ? (
                                <Image
                                    src={imagePreview}
                                    alt="Avatar preview"
                                    width={256}
                                    height={256}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-center p-4">
                                    <div className="text-5xl mb-2">👤</div>
                                    <p className="text-sm text-muted">Click to upload photo</p>
                                </div>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileInput}
                        />

                        {/* Controls */}
                        <div className="flex-1 text-center md:text-left">
                            {avatarReady ? (
                                <>
                                    <h2 className="text-2xl font-bold mb-2 text-success">Avatar Ready!</h2>
                                    <p className="text-muted mb-6">
                                        Your avatar has been created and is ready for interviews.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setAvatarReady(false);
                                            setImagePreview(null);
                                            setImageFile(null);
                                        }}
                                        className="btn btn-secondary"
                                    >
                                        Upload New Photo
                                    </button>
                                </>
                            ) : imagePreview ? (
                                <>
                                    <h2 className="text-2xl font-bold mb-2">Photo Selected</h2>
                                    <p className="text-muted mb-6">
                                        {isCreating ? 'Creating your avatar...' : 'Ready to create your avatar.'}
                                    </p>
                                    <div className="flex gap-4 justify-center md:justify-start">
                                        <button
                                            onClick={() => {
                                                setImagePreview(null);
                                                setImageFile(null);
                                            }}
                                            className="btn btn-secondary"
                                            disabled={isCreating}
                                        >
                                            Change Photo
                                        </button>
                                        <button
                                            onClick={createAvatar}
                                            className="btn btn-primary glow-primary"
                                            disabled={isCreating}
                                        >
                                            {isCreating ? 'Creating...' : 'Create Avatar'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold mb-2">Upload Your Photo</h2>
                                    <p className="text-muted">
                                        Use a clear, front-facing photo with good lighting.
                                        This will be used to animate your AI avatar during interviews.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Tips */}
                <section className="glass rounded-2xl p-6">
                    <h3 className="font-semibold mb-3">💡 Photo Tips</h3>
                    <ul className="space-y-2 text-sm text-muted">
                        <li>• Use a well-lit, front-facing photo</li>
                        <li>• Neutral expression works best</li>
                        <li>• High resolution (at least 512x512 pixels)</li>
                        <li>• Plain background preferred</li>
                    </ul>
                </section>
            </main>
        </div>
    );
}
