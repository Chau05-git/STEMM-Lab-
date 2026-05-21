import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Local auth stub (Phase 1). Firebase Authentication is wired up later
 * (Phase 4). For now we model a minimal "signed-in" flag persisted in
 * memory so the navigation flow can be built and tested offline.
 */
interface LocalUser {
    uid: string;
    email: string | null;
}

interface AuthContextValue {
    user: LocalUser | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<LocalUser>;
    signUp: (email: string, password: string) => Promise<LocalUser>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    isLoading: true,
    signIn: async () => { throw new Error('AuthContext not ready'); },
    signUp: async () => { throw new Error('AuthContext not ready'); },
    signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<LocalUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // No persisted session yet — resolve immediately.
    useEffect(() => {
        setIsLoading(false);
    }, []);

    const signIn = async (email: string): Promise<LocalUser> => {
        const u: LocalUser = { uid: `local-${Date.now()}`, email };
        setUser(u);
        return u;
    };

    const signUp = async (email: string): Promise<LocalUser> => {
        const u: LocalUser = { uid: `local-${Date.now()}`, email };
        setUser(u);
        return u;
    };

    const signOut = async () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
