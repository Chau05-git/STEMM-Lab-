/**
 * Audio sensor helpers — microphone dB level (Activity 2: Sound Pollution).
 *
 * expo-audio metering returns dBFS (0 = max input, negative = quieter).
 * We add an empirical offset to approximate environmental decibels.
 */

export const DBFS_OFFSET = 90;

/** Convert raw dBFS metering to an approximate environmental dB (0–130). */
export function toEnvironmentalDb(dbFS: number): number {
    return Math.max(0, Math.min(130, dbFS + DBFS_OFFSET));
}

/** Exponential moving average so the live readout doesn't jitter. */
export function smoothDb(prev: number, next: number, alpha = 0.25): number {
    return Math.round(alpha * next + (1 - alpha) * prev);
}

export interface HearingRisk {
    level: string;
    color: string;
    description: string;
}

/** Hearing-risk band for a dB level — mirrors the User Spec table. */
export function getHearingRisk(db: number): HearingRisk {
    if (db < 30) return { level: 'No risk', color: '#10B981', description: 'Whisper, quiet library' };
    if (db < 60) return { level: 'Safe', color: '#10B981', description: 'Normal conversation, classroom' };
    if (db < 85) return { level: 'Generally safe', color: '#F59E0B', description: 'Busy traffic — fatigue if prolonged' };
    if (db < 90) return { level: 'Damage possible', color: '#F97316', description: 'Lawn mower, loud classroom' };
    if (db < 100) return { level: 'Damage likely', color: '#EF4444', description: 'Motorbike, power tools' };
    if (db < 110) return { level: 'Serious damage', color: '#DC2626', description: 'Nightclub, rock concert' };
    if (db < 120) return { level: 'Painful', color: '#B91C1C', description: 'Siren, car horn at 1 m' };
    return { level: 'Dangerous', color: '#7F1D1D', description: 'Jet engine — immediate damage' };
}

/** Colour for the live level bar based on dB. */
export function dbColor(db: number): string {
    if (db < 60) return '#10B981';
    if (db < 85) return '#F59E0B';
    if (db < 100) return '#EF4444';
    return '#DC2626';
}
