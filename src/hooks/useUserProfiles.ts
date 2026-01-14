'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProfile, MAX_USERS } from '@/types/user';

export function useUserProfiles() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [activeUserId, setActiveUserId] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from API on mount
    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
            }
        } catch (e) {
            console.error('Failed to load users:', e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        // Load active user ID from localStorage (client-side only preference)
        const stored = localStorage.getItem('active-user-id');
        if (stored) setActiveUserId(stored);
    }, [fetchUsers]);

    const activeUser = users.find(u => u.id === activeUserId) || null;

    const setActiveUser = useCallback((id: string | null) => {
        setActiveUserId(id);
        if (id) {
            localStorage.setItem('active-user-id', id);
        } else {
            localStorage.removeItem('active-user-id');
        }
    }, []);

    const deleteUser = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(prev => {
                    const next = prev.filter(u => u.id !== id);
                    if (activeUserId === id) {
                        setActiveUser(next[0]?.id || null);
                    }
                    return next;
                });
            }
        } catch (e) {
            console.error('Failed to delete user:', e);
        }
    }, [activeUserId, setActiveUser]);

    const updateUser = useCallback(async (id: string, updates: Partial<UserProfile>) => {
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (res.ok) {
                // Refresh local state
                await fetchUsers();
            }
        } catch (e) {
            console.error('Failed to update user:', e);
        }
    }, [fetchUsers]);

    return {
        users,
        activeUser,
        activeUserId,
        isLoaded,
        canAddUser: users.length < MAX_USERS,
        fetchUsers,
        deleteUser,
        updateUser,
        setActiveUser,
    };
}
