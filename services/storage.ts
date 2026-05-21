import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, ActivityProgress, Team } from '@/constants/types';

// ─── Keys ────────────────────────────────────────────────────────
const KEYS = {
    TEAM:     '@stemmlab/team',
    SETTINGS: '@stemmlab/settings',
    PROGRESS: '@stemmlab/progress',
} as const;

// Map of activityId → progress
export type ActivityProgressMap = Record<string, ActivityProgress>;

// ─── Defaults ────────────────────────────────────────────────────
export const DEFAULT_SETTINGS: AppSettings = {
    theme: 'system',
    notificationsEnabled: true,
    soundEnabled: true,
    hapticsEnabled: true,
    gradeFilter: '',
};

// ─── Team profile ────────────────────────────────────────────────
export async function saveTeam(team: Team): Promise<void> {
    await AsyncStorage.setItem(KEYS.TEAM, JSON.stringify(team));
}

export async function getTeam(): Promise<Team | null> {
    const json = await AsyncStorage.getItem(KEYS.TEAM);
    return json ? (JSON.parse(json) as Team) : null;
}

export async function clearTeam(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.TEAM);
}

// ─── Settings ────────────────────────────────────────────────────
export async function saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export async function getSettings(): Promise<AppSettings> {
    const json = await AsyncStorage.getItem(KEYS.SETTINGS);
    return json
        ? { ...DEFAULT_SETTINGS, ...(JSON.parse(json) as Partial<AppSettings>) }
        : DEFAULT_SETTINGS;
}

// ─── Activity progress ───────────────────────────────────────────
export async function saveProgress(progress: ActivityProgressMap): Promise<void> {
    await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
}

export async function getProgress(): Promise<ActivityProgressMap> {
    const json = await AsyncStorage.getItem(KEYS.PROGRESS);
    return json ? (JSON.parse(json) as ActivityProgressMap) : {};
}

// ─── Reset everything ────────────────────────────────────────────
export async function clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([KEYS.TEAM, KEYS.SETTINGS, KEYS.PROGRESS]);
}
