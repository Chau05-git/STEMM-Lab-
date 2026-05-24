import { Accelerometer, type AccelerometerMeasurement } from 'expo-sensors';

export interface AccelerometerReading {
    x: number;
    y: number;
    z: number;
    timestamp: number;
    vibrationMagnitude: number;   // m/s² deviation from 1g
    vibrationAmplitudeMm: number; // rough mm estimate
    bendAngleDeg: number;         // tilt from vertical
}

const GRAVITY = 9.81;

function processReading(data: AccelerometerMeasurement): AccelerometerReading {
    const { x, y, z } = data;

    const totalAccel = Math.sqrt(x * x + y * y + z * z);
    const vibrationG = Math.abs(totalAccel - 1.0);          // deviation from gravity
    const vibrationMagnitude = vibrationG * GRAVITY;        // → m/s²
    const vibrationAmplitudeMm = Math.round(vibrationMagnitude * 10 * 100) / 100;

    // Bend / tilt angle: angle between the acceleration vector and the z-axis.
    const bendAngleRad = Math.atan2(Math.sqrt(x * x + y * y), Math.abs(z));
    const bendAngleDeg = Math.round((bendAngleRad * 180) / Math.PI * 10) / 10;

    return {
        x, y, z,
        timestamp: Date.now(),
        vibrationMagnitude: Math.round(vibrationMagnitude * 1000) / 1000,
        vibrationAmplitudeMm,
        bendAngleDeg,
    };
}

export function createAccelerometerService() {
    let subscription: ReturnType<typeof Accelerometer.addListener> | null = null;
    let onReading: ((r: AccelerometerReading) => void) | null = null;
    let readings: AccelerometerReading[] = [];
    let latest: AccelerometerReading | null = null;

    return {
        async start(intervalMs = 100) {
            const { status } = await Accelerometer.requestPermissionsAsync();
            if (status !== 'granted') throw new Error('Accelerometer permission denied');

            Accelerometer.setUpdateInterval(intervalMs);
            subscription = Accelerometer.addListener((data) => {
                const reading = processReading(data);
                latest = reading;
                readings.push(reading);
                if (readings.length > 600) readings = readings.slice(-600);
                onReading?.(reading);
            });
        },

        stop() {
            subscription?.remove();
            subscription = null;
        },

        getLatest: () => latest,
        getReadings: () => [...readings],
        clearReadings() {
            readings = [];
            latest = null;
        },
        setOnReading(cb: (r: AccelerometerReading) => void) {
            onReading = cb;
        },

        /** Smoothness 0–100 (100 = perfectly smooth). */
        getSmoothnessScore(): number {
            if (readings.length < 10) return 100;
            const recent = readings.slice(-50);
            const avg = recent.reduce((s, r) => s + r.vibrationMagnitude, 0) / recent.length;
            return Math.round(Math.max(0, Math.min(100, 100 - avg * 20)));
        },

        /** Breaths per minute from z-axis peaks over a duration. */
        getBreathsPerMinute(durationSeconds: number): number {
            if (readings.length < 20 || durationSeconds <= 0) return 0;
            const z = readings.map((r) => r.z);
            let peaks = 0;
            for (let i = 1; i < z.length - 1; i++) {
                if (z[i] > z[i - 1] && z[i] > z[i + 1] && z[i] - (z[i - 1] + z[i + 1]) / 2 > 0.02) {
                    peaks++;
                }
            }
            return Math.round((peaks / durationSeconds) * 60);
        },

        getPeakVibration(): number {
            return readings.length ? Math.max(...readings.map((r) => r.vibrationAmplitudeMm)) : 0;
        },

        cleanup() {
            this.stop();
            readings = [];
            latest = null;
            onReading = null;
        },
    };
}

export type AccelerometerService = ReturnType<typeof createAccelerometerService>;
