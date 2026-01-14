/**
 * User Profile Types for Multi-User Support
 */

export interface UserProfile {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar: {
        configured: boolean;
        imageUrl?: string;
        avatarName?: string; // HeyGen avatarName
    };
    voice: {
        configured: boolean;
        voiceId?: string; // ElevenLabs voice_id
        sampleUrl?: string;
    };
    llm?: {
        localModel: string;
        cloudProvider: string;
        cloudModel: string;
        preferredMode: 'LOCAL' | 'CLOUD';
    };
    isDemo?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserState {
    users: UserProfile[];
    activeUserId: string | null;
}

export const MAX_USERS = 5;

export function createEmptyProfile(name: string): UserProfile {
    const now = new Date().toISOString();
    return {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        name,
        avatar: { configured: false },
        voice: { configured: false },
        createdAt: now,
        updatedAt: now,
    };
}
