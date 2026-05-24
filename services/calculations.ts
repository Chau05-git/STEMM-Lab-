/**
 * Physics / data calculations shared across activities.
 * Each activity adds its functions here as it is implemented.
 */

export interface CalculationResult {
    name: string;
    value: number;
    unit: string;
    formula: string;
    level: 'primary' | 'secondary';
}

/**
 * Round to `dp` decimals without the classic `Math.round(n*f)/f` float bug
 * (e.g. 1.005 → 1.01, not 1.00). Parsing via exponential notation avoids the
 * binary multiplication error.
 */
const round = (n: number, dp = 3): number => {
    if (!Number.isFinite(n)) return 0;
    const m = Number(`${n}e${dp}`);
    return Number(`${Math.round(m)}e-${dp}`);
};

export const GRAVITY = 9.81; // m/s²

// ─── Activity 1: Parachute Drop ──────────────────────────────────

export function finalVelocity(distance: number, time: number): CalculationResult {
    const v = time > 0 ? distance / time : 0;
    return {
        name: 'Final Velocity',
        value: round(v),
        unit: 'm/s',
        formula: `v = d / t = ${distance} / ${time}`,
        level: 'primary',
    };
}

export function acceleration(vFinal: number, vInitial: number, time: number): CalculationResult {
    const a = time > 0 ? (vFinal - vInitial) / time : 0;
    return {
        name: 'Acceleration',
        value: round(a),
        unit: 'm/s²',
        formula: `a = (v_final − v_initial) / t = (${round(vFinal)} − ${vInitial}) / ${time}`,
        level: 'secondary',
    };
}

export function netForce(mass: number, accel: number): CalculationResult {
    return {
        name: 'Net Force',
        value: round(mass * accel),
        unit: 'N',
        formula: `F_net = m × a = ${mass} × ${round(accel)}`,
        level: 'secondary',
    };
}

export function weight(mass: number): CalculationResult {
    return {
        name: 'Weight',
        value: round(mass * GRAVITY),
        unit: 'N',
        formula: `W = m × g = ${mass} × ${GRAVITY}`,
        level: 'secondary',
    };
}

export function dragForce(weightN: number, netForceN: number): CalculationResult {
    return {
        name: 'Drag Force',
        value: round(Math.abs(weightN - netForceN)),
        unit: 'N',
        formula: `F_drag = W − F_net = ${round(weightN)} − ${round(netForceN)}`,
        level: 'secondary',
    };
}

export function gForceNoBounce(vImpact: number, contactTime: number): CalculationResult {
    const g = contactTime > 0 ? vImpact / (contactTime * GRAVITY) : 0;
    return {
        name: 'G-Force (no bounce)',
        value: round(g, 2),
        unit: 'g',
        formula: `g = v / (t_contact × g) = ${round(vImpact)} / (${contactTime} × ${GRAVITY})`,
        level: 'secondary',
    };
}

export interface ParachuteInput {
    distance: number;     // drop height (m)
    mass: number;         // toy mass (kg)
    dropTime: number;     // measured fall time (s)
    contactTime?: number; // optional landing contact time (s)
}

/** Full parachute result set, ordered for display. */
export function calculateParachute({ distance, mass, dropTime, contactTime }: ParachuteInput): CalculationResult[] {
    if (!(distance > 0) || !(dropTime > 0)) return [];

    // Chain with EXACT (unrounded) intermediates to avoid compounding rounding
    // error; each function still rounds only its own displayed value.
    const vRaw = distance / dropTime;
    const aRaw = vRaw / dropTime;          // (vRaw − 0) / dropTime
    const wRaw = mass * GRAVITY;
    const nfRaw = mass * aRaw;

    const v = finalVelocity(distance, dropTime);
    const a = acceleration(vRaw, 0, dropTime);
    const w = weight(mass);
    const nf = netForce(mass, aRaw);
    const df = dragForce(wRaw, nfRaw);

    const results = [v, a, nf, w, df];
    if (contactTime && contactTime > 0) {
        results.push(gForceNoBounce(vRaw, contactTime));
    }
    return results;
}

/**
 * Single representative score for the leaderboard. For the parachute the
 * "best" outcome is the slowest fall → lowest impact velocity. We invert it
 * so a higher leaderboard score means a safer landing.
 */
export function parachuteScore(results: CalculationResult[]): number {
    const velocity = results.find((r) => r.name === 'Final Velocity')?.value ?? 0;
    if (velocity <= 0) return 0;
    return Math.round((10 / velocity) * 100) / 100;
}

// ─── Activity 2: Sound Pollution ─────────────────────────────────

export function averageDb(values: number[]): CalculationResult {
    const avg = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
    return {
        name: 'Average Sound Level',
        value: round(avg, 1),
        unit: 'dB',
        formula: `avg = Σ(readings) / n = total / ${values.length}`,
        level: 'primary',
    };
}

export function peakDb(values: number[]): CalculationResult {
    return {
        name: 'Peak Sound Level',
        value: values.length ? Math.max(...values) : 0,
        unit: 'dB',
        formula: 'peak = max(readings)',
        level: 'primary',
    };
}

/** Average + peak from a list of dB readings. */
export function calculateSound(values: number[]): CalculationResult[] {
    if (values.length === 0) return [];
    return [averageDb(values), peakDb(values)];
}
