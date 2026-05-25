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

// ─── Signal-processing helpers (breathing detection) ────────────

function mean(a: number[]): number {
    return a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
}

/** Centred moving-average low-pass filter. */
function movingAverage(a: number[], win: number): number[] {
    if (win <= 1) return a.slice();
    const half = Math.floor(win / 2);
    const out = new Array<number>(a.length);
    for (let i = 0; i < a.length; i++) {
        const lo = Math.max(0, i - half);
        const hi = Math.min(a.length - 1, i + half);
        let sum = 0;
        for (let j = lo; j <= hi; j++) sum += a[j];
        out[i] = sum / (hi - lo + 1);
    }
    return out;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

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

        /**
         * Breaths per minute from chest movement, via autocorrelation.
         *
         * Breathing is a slow, periodic oscillation whose amplitude varies a
         * lot (gentle vs deep breaths). Counting peaks is amplitude-sensitive
         * and brittle, so instead we find the *period* of the signal:
         *   1. pick the axis that moves the most (orientation-independent),
         *   2. light low-pass smooth to drop jitter/heartbeat,
         *   3. subtract a long baseline (~8 s) to remove slow drift/tilt,
         *   4. autocorrelate and take the FIRST prominent peak — its lag is the
         *      breathing period (first peak = fundamental, avoids 2×/3× errors).
         * This reads correctly for both faint and heavy breathing.
         */
        getBreathsPerMinute(durationSeconds: number): number {
            if (readings.length < 20 || durationSeconds <= 0) return 0;
            const sr = readings.length / durationSeconds; // samples per second

            // 1. Axis with the most variation = where breathing shows up.
            let series: number[] = [];
            let bestVar = -1;
            for (const ax of ['x', 'y', 'z'] as const) {
                const s = readings.map((r) => r[ax]);
                const m = mean(s);
                const v = s.reduce((acc, val) => acc + (val - m) ** 2, 0) / s.length;
                if (v > bestVar) {
                    bestVar = v;
                    series = s;
                }
            }

            // 2 + 3. Smooth, then detrend with a long baseline.
            const smoothWin = clamp(Math.round(sr * 0.4), 3, 25);
            const smoothed = movingAverage(series, smoothWin);
            const baseWin = clamp(Math.round(sr * 8), smoothWin * 3, 801);
            const baseline = movingAverage(smoothed, baseWin);
            const detr = smoothed.map((v, i) => v - baseline[i]);

            // 4. Biased autocorrelation, normalised by zero-lag energy.
            const N = detr.length;
            const r0 = detr.reduce((acc, v) => acc + v * v, 0) / N;
            if (r0 < 1e-9) return 0;

            const minLag = Math.round(sr * 1.4);  // ≤ ~43 breaths/min
            const maxLag = Math.min(N - 1, Math.round(sr * 12)); // ≥ 5 breaths/min
            const nr: number[] = [];
            for (let lag = 0; lag <= maxLag; lag++) {
                let c = 0;
                for (let i = 0; i + lag < N; i++) c += detr[i] * detr[i + lag];
                nr[lag] = c / N / r0;
            }

            // First clear autocorrelation peak = breathing period. We use a low
            // bar (0.15) so faint breathing still registers; if no local peak is
            // found we just take the strongest lag (never gets stuck at 0).
            let lagPeak = -1;
            for (let lag = minLag; lag < maxLag; lag++) {
                if (nr[lag] > 0.15 && nr[lag] >= nr[lag - 1] && nr[lag] > nr[lag + 1]) {
                    lagPeak = lag;
                    break;
                }
            }
            if (lagPeak < 0) {
                let best = -Infinity;
                for (let lag = minLag; lag <= maxLag; lag++) {
                    if (nr[lag] > best) {
                        best = nr[lag];
                        lagPeak = lag;
                    }
                }
            }
            if (lagPeak < 0) return 0;

            return Math.round(60 / (lagPeak / sr));
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
