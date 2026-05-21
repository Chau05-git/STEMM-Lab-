import type { ActivityDefinition } from '@/constants/types';

import parachuteDrop      from './parachute-drop';
import soundPollution     from './sound-pollution';
import handFan            from './hand-fan';
import earthquakeStructure from './earthquake-structure';
import humanPerformance   from './human-performance';
import reactionBoard      from './reaction-board';
import breathingPace      from './breathing-pace';

// ─── Master list (display order) ────────────────────────────────
export const ACTIVITIES: ActivityDefinition[] = [
    // Engineering
    parachuteDrop,
    soundPollution,
    handFan,
    earthquakeStructure,
    // Health
    humanPerformance,
    reactionBoard,
    breathingPace,
];

// ─── Filtered views ───────────────────────────────────────────────
export const ENGINEERING_ACTIVITIES = ACTIVITIES.filter(
    (a) => a.category === 'engineering',
);

export const HEALTH_ACTIVITIES = ACTIVITIES.filter(
    (a) => a.category === 'health',
);

// ─── Lookup ───────────────────────────────────────────────────────
export function getActivityById(id: string): ActivityDefinition | undefined {
    return ACTIVITIES.find((a) => a.id === id);
}
