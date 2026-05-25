import React, { createContext, useContext, useEffect, useState } from 'react';

import type { ActivityProgress, Team } from '@/constants/types';
import { useAuth } from '@/context/AuthContext';
import {
    getProgressCloud,
    getTeamCloud,
    saveProgressCloud,
    saveTeamCloud,
} from '@/services/firestore';
import {
    clearTeam as clearTeamStorage,
    getProgress,
    getTeam,
    saveProgress,
    saveTeam,
    type ActivityProgressMap,
} from '@/services/storage';

interface TeamContextValue {
    team: Team | null;
    activityProgress: ActivityProgressMap;
    isLoading: boolean;
    isRegistered: boolean;
    registerTeam: (team: Team) => Promise<void>;
    updateTeam: (updates: Partial<Team>) => Promise<void>;
    setActivityProgress: (activityId: string, progress: ActivityProgress) => Promise<void>;
    clearTeam: () => Promise<void>;
}

const TeamContext = createContext<TeamContextValue>({
    team: null,
    activityProgress: {},
    isLoading: true,
    isRegistered: false,
    registerTeam: async () => {},
    updateTeam: async () => {},
    setActivityProgress: async () => {},
    clearTeam: async () => {},
});

export function TeamProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const uid = user?.uid;
    const [team, setTeam] = useState<Team | null>(null);
    const [activityProgress, setProgress] = useState<ActivityProgressMap>({});
    const [isLoading, setIsLoading] = useState(true);

    // Load this account's team + progress. Everything is scoped per account
    // (cloud users/{uid} first, then a uid-keyed local cache) so two accounts
    // on the same device never see each other's data.
    useEffect(() => {
        let active = true;
        (async () => {
            setIsLoading(true);

            if (uid) {
                const [cloudTeam, cloudProg] = await Promise.all([
                    getTeamCloud(uid),
                    getProgressCloud(uid),
                ]);
                if (!active) return;

                const nextTeam = cloudTeam ?? (await getTeam(uid));
                const nextProg = cloudProg ?? (await getProgress(uid));
                if (!active) return;

                setTeam(nextTeam);
                setProgress(nextProg);

                // Cache cloud copies locally for offline use.
                if (cloudTeam) await saveTeam(cloudTeam, uid);
                if (cloudProg) await saveProgress(cloudProg, uid);
            } else {
                // Local-only mode (no Firebase / not signed in).
                setTeam(await getTeam());
                setProgress(await getProgress());
            }
            if (active) setIsLoading(false);
        })();
        return () => { active = false; };
    }, [uid]);

    const registerTeam = async (t: Team) => {
        setTeam(t);
        await saveTeam(t, uid);
        if (uid) await saveTeamCloud(uid, t);
    };

    const updateTeam = async (updates: Partial<Team>) => {
        if (!team) return;
        const next = { ...team, ...updates };
        setTeam(next);
        await saveTeam(next, uid);
        if (uid) await saveTeamCloud(uid, next);
    };

    const setActivityProgress = async (activityId: string, progress: ActivityProgress) => {
        const next = { ...activityProgress, [activityId]: progress };
        setProgress(next);
        await saveProgress(next, uid);
        if (uid) await saveProgressCloud(uid, next);
    };

    const clearTeam = async () => {
        setTeam(null);
        setProgress({});
        await clearTeamStorage(uid);
    };

    return (
        <TeamContext.Provider
            value={{
                team,
                activityProgress,
                isLoading,
                isRegistered: team !== null,
                registerTeam,
                updateTeam,
                setActivityProgress,
                clearTeam,
            }}
        >
            {children}
        </TeamContext.Provider>
    );
}

export function useTeam() {
    return useContext(TeamContext);
}
