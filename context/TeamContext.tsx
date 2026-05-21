import React, { createContext, useContext, useEffect, useState } from 'react';

import type { Team } from '@/constants/types';
import {
    clearTeam as clearTeamStorage,
    getProgress,
    getTeam,
    saveProgress,
    saveTeam,
    type ActivityProgressMap,
} from '@/services/storage';
import type { ActivityProgress } from '@/constants/types';

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
    const [team, setTeam] = useState<Team | null>(null);
    const [activityProgress, setProgress] = useState<ActivityProgressMap>({});
    const [isLoading, setIsLoading] = useState(true);

    // Load persisted team + progress on mount
    useEffect(() => {
        Promise.all([getTeam(), getProgress()]).then(([t, p]) => {
            setTeam(t);
            setProgress(p);
            setIsLoading(false);
        });
    }, []);

    const registerTeam = async (t: Team) => {
        setTeam(t);
        await saveTeam(t);
    };

    const updateTeam = async (updates: Partial<Team>) => {
        if (!team) return;
        const next = { ...team, ...updates };
        setTeam(next);
        await saveTeam(next);
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
