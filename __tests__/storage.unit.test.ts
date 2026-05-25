// Use the official in-memory AsyncStorage mock.
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ActivityProgressMap } from '@/services/storage';
import { getProgress, getTeam, saveProgress, saveTeam } from '@/services/storage';
import type { Team } from '@/constants/types';

const makeTeam = (name: string): Team => ({
    id: name,
    name,
    discriminator: '1234',
    gradeLevel: 'Year 6',
    members: [{ id: 'm1', firstName: 'Alex' }],
    createdAt: 0,
});

beforeEach(async () => {
    await AsyncStorage.clear();
});

describe('per-account team isolation', () => {
    it('keeps each account\'s team separate', async () => {
        await saveTeam(makeTeam('Alpha'), 'uidA');
        await saveTeam(makeTeam('Beta'), 'uidB');

        expect((await getTeam('uidA'))?.name).toBe('Alpha');
        expect((await getTeam('uidB'))?.name).toBe('Beta');
    });

    it('returns null for an account that never registered', async () => {
        await saveTeam(makeTeam('Alpha'), 'uidA');
        expect(await getTeam('uidNew')).toBeNull();
    });
});

describe('per-account progress isolation', () => {
    it('does not leak one account\'s completed status to another', async () => {
        const progress: ActivityProgressMap = {
            'parachute-drop': { status: 'completed', bestScore: 3.3, bestScoreUnit: 'safety pts' },
        };
        await saveProgress(progress, 'uidA');

        // The bug we fixed: a different account must start clean.
        expect(await getProgress('uidB')).toEqual({});
        expect(await getProgress('uidA')).toEqual(progress);
    });
});
