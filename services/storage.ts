import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, ActivityProgress, Team } from '@/constants/types';

// ─── Keys ────────────────────────────────────────────────────────
// Team & progress are scoped per account (uid) so two accounts on the same
// device never see each other's data. Settings stay global to the device.
const KEYS = {
    SETTINGS: '@stemmlab/settings',
} as const;

const teamKey = (uid?: string) => (uid ? `@stemmlab/team/${uid}` : '@stemmlab/team');
const progressKey = (uid?: string) => (uid ? `@stemmlab/progress/${uid}` : '@stemmlab/progress');

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

// ─── Team profile (per account) ──────────────────────────────────
export async function saveTeam(team: Team, uid?: string): Promise<void> {
    await AsyncStorage.setItem(teamKey(uid), JSON.stringify(team));
}

export async function getTeam(uid?: string): Promise<Team | null> {
    const json = await AsyncStorage.getItem(teamKey(uid));
    return json ? (JSON.parse(json) as Team) : null;
}

export async function clearTeam(uid?: string): Promise<void> {
    await AsyncStorage.removeItem(teamKey(uid));
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

// ─── Activity progress (per account) ─────────────────────────────
export async function saveProgress(progress: ActivityProgressMap, uid?: string): Promise<void> {
    await AsyncStorage.setItem(progressKey(uid), JSON.stringify(progress));
}

export async function getProgress(uid?: string): Promise<ActivityProgressMap> {
    const json = await AsyncStorage.getItem(progressKey(uid));
    return json ? (JSON.parse(json) as ActivityProgressMap) : {};
}

// ─── Reset everything (this device) ──────────────────────────────
export async function clearAll(): Promise<void> {
    await AsyncStorage.clear();
}
