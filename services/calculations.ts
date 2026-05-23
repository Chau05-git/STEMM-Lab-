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

const round = (n: number, dp = 3) => {
    const f = 10 ** dp;
    return Math.round(n * f) / f;
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
        formula: `a = (v_final − v_initial) / t = (${vFinal} − ${vInitial}) / ${time}`,
        level: 'secondary',
    };
}

export function netForce(mass: number, accel: number): CalculationResult {
    return {
        name: 'Net Force',
        value: round(mass * accel),
        unit: 'N',
        formula: `F_net = m × a = ${mass} × ${accel}`,
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
        formula: `F_drag = W − F_net = ${weightN} − ${netForceN}`,
        level: 'secondary',
    };
}

export function gForceNoBounce(vImpact: number, contactTime: number): CalculationResult {
    const g = contactTime > 0 ? vImpact / (contactTime * GRAVITY) : 0;
    return {
        name: 'G-Force (no bounce)',
        value: round(g, 2),
        unit: 'g',
        formula: `g = v / (t_contact × g) = ${vImpact} / (${contactTime} × ${GRAVITY})`,
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

    const v = finalVelocity(distance, dropTime);
    const a = acceleration(v.value, 0, dropTime);
    const w = weight(mass);
    const nf = netForce(mass, a.value);
    const df = dragForce(w.value, nf.value);

    const results = [v, a, nf, w, df];
    if (contactTime && contactTime > 0) {
        results.push(gForceNoBounce(v.value, contactTime));
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
