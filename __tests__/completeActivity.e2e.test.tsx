// End-to-End test: simulate a team completing a Parachute Drop challenge from
// starting the attempt, recording sensor data, computing results, saving the
// record, and reading it back — exercising the real ActivityContext and
// calculation services together with an in-memory database.

const store: any[] = [];
jest.mock('@/services/database', () => ({
    saveAttempt: jest.fn(async (a: any) => { store.push(a); }),
    getAttemptsByTeam: jest.fn(async (teamId: string) => store.filter((a) => a.teamId === teamId)),
    markSynced: jest.fn(async () => {}),
}));

import { act, renderHook } from '@testing-library/react-native';
import React from 'react';

import { ActivityProvider, useActivity } from '@/context/ActivityContext';
import { calculateParachute } from '@/services/calculations';
import { getAttemptsByTeam, saveAttempt } from '@/services/database';
import type { SensorReading } from '@/constants/types';

const reading = (label: string, value: number, unit: string): SensorReading => ({
    id: `${label}-${value}`,
    sensorType: 'timer',
    value,
    unit,
    timestamp: Date.now(),
    label,
});

describe('E2E — complete and save a Parachute Drop challenge', () => {
    beforeEach(() => { store.length = 0; });

    it('records, computes, saves and reloads the result under the correct activity', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ActivityProvider>{children}</ActivityProvider>
        );
        const { result } = renderHook(() => useActivity(), { wrapper });

        // 1. Team opens the Parachute Drop challenge → a fresh attempt begins.
        act(() => result.current.startAttempt('parachute-drop', 'team-1'));
        expect(result.current.activeAttempt?.activityId).toBe('parachute-drop');

        // 2. Team measures the drop and enters the height and mass.
        act(() => result.current.setSensorReadings([
            reading('dropTime', 0.5, 's'),
            reading('dropHeight', 1.5, 'm'),
            reading('mass', 0.2, 'kg'),
        ]));

        // 3. Team rates and comments, then finishes.
        act(() => result.current.setRating(5));
        act(() => result.current.setComment('Slow, safe landing'));
        let finished: ReturnType<typeof result.current.finishAttempt> = null;
        act(() => { finished = result.current.finishAttempt(); });

        expect(finished).not.toBeNull();
        expect(finished!.activityId).toBe('parachute-drop'); // correct challenge
        expect(finished!.completedAt).toBeDefined();

        // 4. The Results screen computes the physics from the readings.
        const get = (l: string) => finished!.sensorReadings.find((r) => r.label === l)?.value ?? 0;
        const results = calculateParachute({
            distance: get('dropHeight'),
            mass: get('mass'),
            dropTime: get('dropTime'),
        });
        expect(results.find((r) => r.name === 'Final Velocity')?.value).toBe(3); // 1.5 / 0.5

        // 5. The record is saved, then reloaded from storage.
        await saveAttempt(finished!);
        const saved = await getAttemptsByTeam('team-1');
        expect(saved).toHaveLength(1);
        expect(saved[0].activityId).toBe('parachute-drop');
        expect(saved[0].rating).toBe(5);
        expect(saved[0].sensorReadings).toHaveLength(3);
    });
});
