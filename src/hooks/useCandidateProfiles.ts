'use client';

import { useState, useEffect, useCallback } from 'react';
import { CandidateProfile, MAX_CANDIDATES } from '@/types/candidate';

export function useCandidateProfiles() {
    const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
    const [activeCandidateId, setActiveCandidateId] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from API on mount
    const fetchCandidates = useCallback(async () => {
        try {
            const res = await fetch('/api/candidates');
            if (res.ok) {
                const data = await res.json();
                // Map existing user data to candidates if needed, but types match
                setCandidates(data.users || data.candidates || []);
            }
        } catch (e) {
            console.error('Failed to load candidates:', e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    useEffect(() => {
        fetchCandidates();

        // Handle URL parameter precedence: ?candidateId=xxx (or legacy userId)
        const params = new URLSearchParams(window.location.search);
        const urlId = params.get('candidateId') || params.get('userId');

        if (urlId) {
            setActiveCandidateId(urlId);
            localStorage.setItem('active-candidate-id', urlId);
        } else {
            // Fallback to localStorage
            const stored = localStorage.getItem('active-candidate-id');
            // Migration: check old key if new key missing
            if (stored) {
                setActiveCandidateId(stored);
            } else {
                const legacy = localStorage.getItem('active-user-id');
                if (legacy) setActiveCandidateId(legacy);
            }
        }
    }, [fetchCandidates]);

    const activeCandidate = candidates.find(c => c.id === activeCandidateId) || null;

    const setActiveCandidate = useCallback((id: string | null) => {
        setActiveCandidateId(id);
        if (id) {
            localStorage.setItem('active-candidate-id', id);
        } else {
            localStorage.removeItem('active-candidate-id');
        }
    }, []);

    const deleteCandidate = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/candidates/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCandidates(prev => {
                    const next = prev.filter(c => c.id !== id);
                    if (activeCandidateId === id) {
                        setActiveCandidate(next[0]?.id || null);
                    }
                    return next;
                });
            }
        } catch (e) {
            console.error('Failed to delete candidate:', e);
        }
    }, [activeCandidateId, setActiveCandidate]);

    const updateCandidate = useCallback(async (id: string, updates: Partial<CandidateProfile>) => {
        try {
            const res = await fetch(`/api/candidates/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (res.ok) {
                // Refresh local state
                await fetchCandidates();
            }
        } catch (e) {
            console.error('Failed to update candidate:', e);
        }
    }, [fetchCandidates]);

    return {
        candidates,
        activeCandidate,
        activeCandidateId,
        isLoaded,
        canAddCandidate: candidates.length < MAX_CANDIDATES,
        fetchCandidates,
        deleteCandidate,
        updateCandidate,
        setActiveCandidate,
    };
}
