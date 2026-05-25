import type { ActivityAttempt } from '@/constants/types';
import { decodeAttempt, encodeAttempt } from '@/services/qr';

const sample: ActivityAttempt = {
    id: 'abc-123',
    teamId: 'team-1',
    teamName: 'The Gravity Crew',
    activityId: 'parachute-drop',
    iteration: 1,
    sensorReadings: [
        { id: 'r1', sensorType: 'timer', value: 0.5, unit: 's', timestamp: 1000, label: 'dropTime' },
        { id: 'r2', sensorType: 'timer', value: 1.5, unit: 'm', timestamp: 1000, label: 'dropHeight' },
    ],
    dataTableRows: [],
    rating: 4,
    comment: 'Nice slow drop',
    gpsLatitude: -33.8688,
    gpsLongitude: 151.2093,
    startedAt: 1000,
    completedAt: 2000,
    synced: false,
};

describe('qr encode/decode', () => {
    it('produces a prefixed string', () => {
        expect(encodeAttempt(sample).startsWith('STEMMLAB1:')).toBe(true);
    });

    it('round-trips the key fields', () => {
        const decoded = decodeAttempt(encodeAttempt(sample));
        expect(decoded).not.toBeNull();
        expect(decoded!.id).toBe(sample.id);
        expect(decoded!.teamName).toBe(sample.teamName);
        expect(decoded!.activityId).toBe(sample.activityId);
        expect(decoded!.rating).toBe(4);
        expect(decoded!.comment).toBe('Nice slow drop');
        expect(decoded!.sensorReadings).toHaveLength(2);
        expect(decoded!.sensorReadings[0].label).toBe('dropTime');
        expect(decoded!.sensorReadings[0].value).toBe(0.5);
        expect(decoded!.gpsLatitude).toBeCloseTo(-33.8688, 4);
    });

    it('marks an imported record as not synced', () => {
        expect(decodeAttempt(encodeAttempt(sample))!.synced).toBe(false);
    });

    it('rejects non-STEMM QR content', () => {
        expect(decodeAttempt('https://example.com')).toBeNull();
        expect(decodeAttempt('STEMMLAB1:{bad json')).toBeNull();
    });
});
