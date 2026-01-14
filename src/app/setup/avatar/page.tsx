'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUserProfiles } from '@/hooks/useUserProfiles';

export default function AvatarSetup() {
    const { activeUser, updateUser, isLoaded } = useUserProfiles();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [manualAvatarName, setManualAvatarName] = useState('');
    const [availableAvatars, setAvailableAvatars] = useState<any[]>([]);
    const [isLoadingAvatars, setIsLoadingAvatars] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch available avatars on mount
    useEffect(() => {
        const fetchAvatars = async () => {
            setIsLoadingAvatars(true);
            try {
                const res = await fetch('/api/video/avatars');
                if (res.ok) {
                    const data = await res.json();
                    setAvailableAvatars(data.avatars || []);
                }
            } catch (error) {
                console.error('Failed to fetch avatars:', error);
            } finally {
                setIsLoadingAvatars(false);
            }
        };
        fetchAvatars();
    }, []);

    const avatarReady = activeUser?.avatar.configured || false;

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

    const selectAvatar = (avatarId: string, previewUrl?: string) => {
        if (!activeUser) return;
        updateUser(activeUser.id, {
            avatar: {
                configured: true,
                avatarName: avatarId,
                imageUrl: previewUrl,
            },
        });
    };

    const createAvatar = async () => {
        if (!imageFile || !activeUser) return;

        setIsCreating(true);
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const res = await fetch('/api/video/avatar', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                const avatarName = data.avatarName || 'custom_avatar_' + Date.now();

                // Update user profile
                updateUser(activeUser.id, {
                    avatar: {
                        configured: true,
                        imageUrl: imagePreview || undefined,
                        avatarName,
                    },
                });
            }
        } catch (error) {
            console.error('Avatar creation failed:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const saveManualAvatarName = () => {
        if (!manualAvatarName.trim() || !activeUser) return;

        // Try to find if it matches an available avatar to get the preview
        const found = availableAvatars.find(a => a.id === manualAvatarName.trim());

        updateUser(activeUser.id, {
            avatar: {
                configured: true,
                avatarName: manualAvatarName.trim(),
                imageUrl: found?.preview,
            },
        });
        setManualAvatarName('');
    };

    const resetAvatar = () => {
        if (!activeUser) return;

        updateUser(activeUser.id, {
            avatar: {
                configured: false,
                imageUrl: undefined,
                avatarName: undefined,
            },
        });
        setImagePreview(null);
        setImageFile(null);
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
                    <div className="flex-1">
                        <h1 className="text-xl font-bold">Avatar Setup</h1>
                        <p className="text-sm text-muted">
                            {activeUser
                                ? `Configure avatar for ${activeUser.name}`
                                : 'Upload a photo to create your AI avatar'
                            }
                        </p>
                    </div>
                    {activeUser && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            {activeUser.name}
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* No User Warning */}
                {isLoaded && !activeUser && (
                    <section className="glass rounded-2xl p-8 mb-8 border-2 border-warning text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold mb-2">No User Selected</h2>
                        <p className="text-muted mb-4">
                            Please select or create a user profile to configure avatar.
                        </p>
                        <Link href="/users" className="btn btn-primary">
                            Manage Users
                        </Link>
                    </section>
                )}

                {activeUser && (
                    <>
                        {/* Status Section */}
                        {avatarReady && (
                            <section className="glass rounded-2xl p-8 mb-8">
                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    <div className="w-48 h-48 rounded-2xl overflow-hidden glass">
                                        {activeUser.avatar.imageUrl ? (
                                            <Image
                                                src={activeUser.avatar.imageUrl}
                                                alt="Avatar"
                                                width={192}
                                                height={192}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h2 className="text-2xl font-bold mb-2 text-success">Avatar Active</h2>
                                        <p className="text-muted mb-1">
                                            Currently using <span className="font-mono text-xs">{activeUser.avatar.avatarName}</span>
                                        </p>
                                        <p className="text-sm text-muted mb-6">
                                            This avatar will be used in all live interview sessions for {activeUser.name}.
                                        </p>
                                        <button
                                            onClick={resetAvatar}
                                            className="btn btn-secondary border-error/50 text-error hover:bg-error/10"
                                        >
                                            Reset Selection
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Selection Section */}
                        {!avatarReady && (
                            <>
                                {/* Browse Avatars */}
                                <section className="mb-12">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <span>🌍</span> Choose a Professional Avatar
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {availableAvatars.map((avatar) => (
                                            <button
                                                key={avatar.id}
                                                onClick={() => selectAvatar(avatar.id, avatar.preview)}
                                                className="glass rounded-xl overflow-hidden group hover:glow-primary transition-all text-left"
                                            >
                                                <div className="aspect-[3/4] relative bg-card">
                                                    {avatar.preview ? (
                                                        <Image
                                                            src={avatar.preview}
                                                            alt={avatar.name}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center text-3xl">👤</div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                                        <span className="text-xs font-bold text-white">Select {avatar.name.split(' ')[0]}</span>
                                                    </div>
                                                </div>
                                                <div className="p-3 border-t border-white/5">
                                                    <div className="text-sm font-bold truncate">{avatar.name}</div>
                                                    <div className="text-xs text-primary font-mono truncate">{avatar.id}</div>
                                                </div>
                                            </button>
                                        ))}

                                        {isLoadingAvatars && [1, 2, 3, 4].map(i => (
                                            <div key={i} className="glass rounded-xl aspect-[3/4] animate-pulse" />
                                        ))}
                                    </div>
                                </section>

                                {/* OR Divider */}
                                <div className="flex items-center gap-4 mb-12">
                                    <div className="h-px flex-1 bg-border" />
                                    <span className="text-xs font-bold text-muted uppercase tracking-widest">or create custom</span>
                                    <div className="h-px flex-1 bg-border" />
                                </div>

                                {/* Custom Upload */}
                                <section className="glass rounded-2xl p-8 mb-12">
                                    <div className="flex flex-col md:flex-row gap-8 items-center">
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`
                                                w-48 h-48 rounded-2xl overflow-hidden flex items-center justify-center
                                                cursor-pointer hover:border-primary transition-all
                                                ${imagePreview ? '' : 'glass border-2 border-dashed border-border'}
                                            `}
                                        >
                                            {imagePreview ? (
                                                <Image
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    width={192}
                                                    height={192}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-center p-4">
                                                    <div className="text-4xl mb-2">📸</div>
                                                    <p className="text-xs text-muted">Upload Photo</p>
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

                                        <div className="flex-1 text-center md:text-left">
                                            <h3 className="text-xl font-bold mb-2">Create AI Avatar</h3>
                                            <p className="text-sm text-muted mb-6">
                                                Upload a clear photo of yourself to create a custom AI-animated avatar.
                                            </p>
                                            {imagePreview ? (
                                                <div className="flex gap-3 justify-center md:justify-start">
                                                    <button
                                                        onClick={() => setImagePreview(null)}
                                                        className="btn btn-secondary text-sm"
                                                        disabled={isCreating}
                                                    >
                                                        Clear
                                                    </button>
                                                    <button
                                                        onClick={createAvatar}
                                                        className="btn btn-primary glow-primary text-sm"
                                                        disabled={isCreating}
                                                    >
                                                        {isCreating ? 'Creating...' : 'Generate Avatar'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="btn btn-secondary text-sm"
                                                >
                                                    Choose File
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                {/* Manual ID */}
                                <section className="glass rounded-2xl p-6 mb-8 border border-white/5">
                                    <h3 className="font-semibold mb-1">HeyGen Avatar ID</h3>
                                    <p className="text-xs text-muted mb-4 italic">Already have an ID? Enter it below.</p>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={manualAvatarName}
                                            onChange={(e) => setManualAvatarName(e.target.value)}
                                            placeholder="e.g., Wayne_20240711"
                                            className="flex-1 px-4 py-2 rounded-xl bg-card border border-border focus:border-primary outline-none font-mono text-xs"
                                        />
                                        <button
                                            onClick={saveManualAvatarName}
                                            disabled={!manualAvatarName.trim()}
                                            className="btn btn-primary px-6 text-sm"
                                        >
                                            Save ID
                                        </button>
                                    </div>
                                </section>
                            </>
                        )}
                    </>
                )}

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
