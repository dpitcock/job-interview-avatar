'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserProfile } from '@/types/user';

interface UserSelectorProps {
    users: UserProfile[];
    activeUser: UserProfile | null;
    onSelectUser: (userId: string) => void;
}

export function UserSelector({
    users,
    activeUser,
    onSelectUser,
}: UserSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:glow-primary transition-all"
            >
                {activeUser ? (
                    <>
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
                            {activeUser.avatar.imageUrl ? (
                                <img
                                    src={activeUser.avatar.imageUrl}
                                    alt={activeUser.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-sm font-bold text-primary">
                                    {activeUser.name.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <span className="font-semibold max-w-[100px] truncate">{activeUser.name}</span>
                    </>
                ) : (
                    <>
                        <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center border border-warning/20">
                            <span className="text-sm">👤</span>
                        </div>
                        <span className="text-muted font-medium">Select Person</span>
                    </>
                )}
                <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 glass rounded-xl shadow-2xl z-50 overflow-hidden">
                    {/* User List */}
                    <div className="max-h-60 overflow-y-auto">
                        {users.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => {
                                    onSelectUser(user.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-card transition-colors ${user.id === activeUser?.id ? 'bg-primary/10' : ''
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/5 shadow-sm">
                                    {user.avatar.imageUrl ? (
                                        <img
                                            src={user.avatar.imageUrl}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="font-bold text-primary">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="font-medium truncate">{user.name}</div>
                                    <div className="flex items-center gap-2 text-xs text-muted">
                                        <span className={`w-2 h-2 rounded-full ${user.voice.configured ? 'bg-success' : 'bg-warning'}`} />
                                        <span className={`w-2 h-2 rounded-full ${user.avatar.configured ? 'bg-success' : 'bg-warning'}`} />
                                    </div>
                                </div>
                                {user.id === activeUser?.id && (
                                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    {users.length > 0 && <div className="border-t border-border" />}

                    {/* Create New User Link */}
                    <Link
                        href="/users/new"
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-card transition-colors text-primary"
                    >
                        <div className="w-10 h-10 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </div>
                        <span className="font-medium">Add Person</span>
                    </Link>

                    {/* Manage Users Link */}
                    {users.length > 0 && (
                        <Link
                            href="/users"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-card transition-colors text-sm text-muted border-t border-border"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Manage Users
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
