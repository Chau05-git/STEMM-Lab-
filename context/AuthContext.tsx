import React, { createContext, useContext, useEffect, useState } from 'react';

import {
    authErrorMessage,
    isFirebaseConfigured,
    signInWithEmail,
    signOutUser,
    signUpWithEmail,
    subscribeToAuth,
} from '@/services/firebase';

/** Minimal user shape — matches the fields we read from Firebase's User. */
export interface AppUser {
    uid: string;
    email: string | null;
}

interface AuthContextValue {
    user: AppUser | null;
    isLoading: boolean;
    isCloud: boolean; // true when backed by real Firebase Auth
    signIn: (email: string, password: string) => Promise<AppUser>;
    signUp: (email: string, password: string) => Promise<AppUser>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    isLoading: true,
    isCloud: false,
    signIn: async () => { throw new Error('AuthContext not ready'); },
    signUp: async () => { throw new Error('AuthContext not ready'); },
    signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isFirebaseConfigured) {
            // Real Firebase session — restores automatically across launches.
            const unsub = subscribeToAuth((u) => {
                setUser(u ? { uid: u.uid, email: u.email } : null);
                setIsLoading(false);
            });
            return () => unsub();
        }
        // Local fallback — no persisted session.
        setIsLoading(false);
    }, []);

    const signIn = async (email: string, password: string): Promise<AppUser> => {
        if (isFirebaseConfigured) {
            try {
                const u = await signInWithEmail(email, password);
                return { uid: u.uid, email: u.email };
            } catch (err) {
                throw new Error(authErrorMessage(err));
            }
        }
        const u: AppUser = { uid: `local-${Date.now()}`, email };
        setUser(u);
        return u;
    };

    const signUp = async (email: string, password: string): Promise<AppUser> => {
        if (isFirebaseConfigured) {
            try {
                const u = await signUpWithEmail(email, password);
                return { uid: u.uid, email: u.email };
            } catch (err) {
                throw new Error(authErrorMessage(err));
            }
        }
        const u: AppUser = { uid: `local-${Date.now()}`, email };
        setUser(u);
        return u;
    };

    const signOut = async () => {
        if (isFirebaseConfigured) await signOutUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, isLoading, isCloud: isFirebaseConfigured, signIn, signUp, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
