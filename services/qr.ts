import type { ActivityAttempt, SensorReading, SensorType } from '@/constants/types';

/**
 * Compact QR payload for sharing a single activity record between devices.
 * Short keys keep the encoded string small enough for a scannable QR.
 */

const PREFIX = 'STEMMLAB1:';

// Tuple per reading: [label, value, unit, sensorType]
type ReadingTuple = [string, number, string, SensorType];

interface QrPayload {
    id: string;
    ti: string;            // team id
    tn: string;            // team name
    a: string;             // activity id
    it: number;            // iteration
    rt: number;            // rating
    c: string;             // comment
    ts: number;            // completed timestamp
    g?: [number, number];  // gps [lat, lon]
    r: ReadingTuple[];     // readings
}

const round5 = (n: number) => Math.round(n * 1e5) / 1e5;

export function encodeAttempt(a: ActivityAttempt): string {
    const payload: QrPayload = {
        id: a.id,
        ti: a.teamId,
        tn: a.teamName ?? '',
        a: a.activityId,
        it: a.iteration,
        rt: a.rating,
        c: a.comment,
        ts: a.completedAt ?? a.startedAt,
        r: a.sensorReadings.map((s): ReadingTuple => [s.label ?? '', s.value, s.unit, s.sensorType]),
    };
    if (a.gpsLatitude != null && a.gpsLongitude != null) {
        payload.g = [round5(a.gpsLatitude), round5(a.gpsLongitude)];
    }
    return PREFIX + JSON.stringify(payload);
}

export function decodeAttempt(text: string): ActivityAttempt | null {
    if (!text.startsWith(PREFIX)) return null;
    try {
        const p = JSON.parse(text.slice(PREFIX.length)) as QrPayload;
        if (!p.id || !p.a) return null;

        const readings: SensorReading[] = (p.r ?? []).map((t, i) => ({
            id: `${p.id}-r${i}`,
            label: t[0] || undefined,
            value: t[1],
            unit: t[2],
            sensorType: t[3],
            timestamp: p.ts,
        }));

        return {
            id: p.id,
            teamId: p.ti,
            teamName: p.tn || undefined,
            activityId: p.a,
            iteration: p.it ?? 1,
            sensorReadings: readings,
            dataTableRows: [],
            rating: p.rt ?? 0,
            comment: p.c ?? '',
            gpsLatitude: p.g?.[0],
            gpsLongitude: p.g?.[1],
            startedAt: p.ts,
            completedAt: p.ts,
            synced: false,
        };
    } catch {
        return null;
    }
}
