/**
 * Candidate Profile Types for Multi-Candidate Support
 */

export interface CandidateProfile {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    situation?: string;
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

export interface CandidateState {
    candidates: CandidateProfile[];
    activeCandidateId: string | null;
}

export const MAX_CANDIDATES = 5;

export function createEmptyCandidate(name: string): CandidateProfile {
    const now = new Date().toISOString();
    return {
        id: `candidate_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        name,
        avatar: { configured: false },
        voice: { configured: false },
        createdAt: now,
        updatedAt: now,
    };
}
