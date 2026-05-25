import React, { createContext, useContext, useEffect, useState } from 'react';

import type { ActivityProgress, Team } from '@/constants/types';
import { useAuth } from '@/context/AuthContext';
import { getTeamCloud, saveTeamCloud } from '@/services/firestore';
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
    const [team, setTeam] = useState<Team | null>(null);
    const [activityProgress, setProgress] = useState<ActivityProgressMap>({});
    const [isLoading, setIsLoading] = useState(true);

    // Load team for the current account. When signed in, the cloud copy
    // (users/{uid}.team) is the source of truth so each account only ever
    // sees its own team — falling back to the local cache when offline.
    useEffect(() => {
        let active = true;
        (async () => {
            setIsLoading(true);
            const progress = await getProgress();
            if (active) setProgress(progress);

            if (user) {
                const cloud = await getTeamCloud(user.uid);
                if (!active) return;
                if (cloud) {
                    setTeam(cloud);
                    await saveTeam(cloud); // cache locally for offline
                } else {
                    setTeam(await getTeam()); // not-yet-synced / offline cache
                }
            } else {
                setTeam(await getTeam());
            }
            if (active) setIsLoading(false);
        })();
        return () => { active = false; };
    }, [user]);

    const registerTeam = async (t: Team) => {
        setTeam(t);
        await saveTeam(t);
        if (user) await saveTeamCloud(user.uid, t);
    };

    const updateTeam = async (updates: Partial<Team>) => {
        if (!team) return;
        const next = { ...team, ...updates };
        setTeam(next);
        await saveTeam(next);
        if (user) await saveTeamCloud(user.uid, next);
    };

    const setActivityProgress = async (activityId: string, progress: ActivityProgress) => {
        const next = { ...activityProgress, [activityId]: progress };
        setProgress(next);
        await saveProgress(next);
    };

    const clearTeam = async () => {
        setTeam(null);
        setProgress({});
        await clearTeamStorage();
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
