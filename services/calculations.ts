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

// ─── Activity 3: Hand Fan ────────────────────────────────────────

export const HAND_FAN_MATERIALS = {
    paper:     { label: 'Thin paper',     k: 0.05 },
    cardstock: { label: 'Card stock',     k: 0.2 },
    cardboard: { label: 'Thin cardboard', k: 0.5 },
} as const;

export type HandFanMaterial = keyof typeof HAND_FAN_MATERIALS;

/** Delimiter used to pack the material key into a design reading's label. */
export const HF_DELIM = '||';

export interface HandFanDesign {
    label: string;
    angle: number;            // bend angle in degrees
    material: HandFanMaterial; // each design records its own material
}

/**
 * One card per design — labelled with its material — showing the bend angle
 * and the estimated force for that material (F ≈ k × θ).
 */
export function calculateHandFan(designs: HandFanDesign[]): CalculationResult[] {
    if (designs.length === 0) return [];

    return designs.map((d) => {
        const mat = HAND_FAN_MATERIALS[d.material] ?? HAND_FAN_MATERIALS.paper;
        const thetaRad = (d.angle * Math.PI) / 180;
        const force = round(mat.k * thetaRad, 4);
        return {
            name: `${d.label} · ${mat.label}`,
            value: round(d.angle, 1),
            unit: `° · F≈${force} N`,
            formula: `F = k × θ = ${mat.k} × ${round(thetaRad, 3)} rad`,
            level: 'primary',
        };
    });
}

// ─── Activity 4: Earthquake-Resistant Structure ─────────────────

export interface EarthquakeDesign {
    label: string;
    peakMm: number; // peak vibration amplitude over the shake test (mm)
}

/**
 * One card per design (peak movement) plus a card naming the most stable
 * design — simply the one that vibrated the least during its test.
 */
export function calculateEarthquake(designs: EarthquakeDesign[]): CalculationResult[] {
    if (designs.length === 0) return [];

    const cards: CalculationResult[] = designs.map((d) => ({
        name: d.label,
        value: round(d.peakMm, 1),
        unit: 'mm movement',
        formula: 'peak = max(|vibration amplitude|) over the test',
        level: 'primary',
    }));

    const best = designs.reduce((a, b) => (b.peakMm < a.peakMm ? b : a));
    cards.push({
        name: `🏆 Most stable: ${best.label}`,
        value: round(best.peakMm, 1),
        unit: 'mm movement',
        formula: 'least vibration = most stable',
        level: 'primary',
    });
    return cards;
}

// ─── Activity 5: Human Performance Lab ──────────────────────────

export interface MovementAttempt {
    label: string;      // includes the attempt name + duration for display
    smoothness: number; // 0–100, higher = smoother / better control
}

/**
 * One card per movement attempt (smoothness score) plus a card naming the
 * smoothest attempt — the one with the most controlled motion.
 */
export function calculateHumanPerformance(attempts: MovementAttempt[]): CalculationResult[] {
    if (attempts.length === 0) return [];

    const cards: CalculationResult[] = attempts.map((a) => ({
        name: a.label,
        value: a.smoothness,
        unit: 'smoothness /100',
        formula: 'smoothness = 100 − average movement jitter',
        level: 'primary',
    }));

    const best = attempts.reduce((a, b) => (b.smoothness > a.smoothness ? b : a));
    cards.push({
        name: `🏆 Smoothest: ${best.label}`,
        value: best.smoothness,
        unit: 'smoothness /100',
        formula: 'highest smoothness = best coordination',
        level: 'primary',
    });
    return cards;
}

// ─── Leaderboard scoring ─────────────────────────────────────────

export interface ActivityScore {
    value: number;
    unit: string;
    /** true if a HIGHER value is better (affects "best" comparison + ranking). */
    higherIsBetter: boolean;
}

/**
 * Reduce an activity's full result set to a single headline score + unit for
 * the leaderboard. Each activity measures something different, so each has its
 * own metric and "better" direction.
 */
export function activityScore(activityId: string, results: CalculationResult[]): ActivityScore {
    const find = (name: string) => results.find((r) => r.name === name)?.value ?? 0;

    switch (activityId) {
        case 'parachute-drop':
            return { value: parachuteScore(results), unit: 'safety pts', higherIsBetter: true };
        case 'sound-pollution':
            return { value: find('Peak Sound Level'), unit: 'dB peak', higherIsBetter: false };
        case 'hand-fan': {
            const maxBend = results.length ? Math.max(...results.map((r) => r.value)) : 0;
            return { value: maxBend, unit: '° max bend', higherIsBetter: true };
        }
        case 'earthquake-structure': {
            // The most stable design's peak movement; less movement is better.
            const winner = results.find((r) => r.name.startsWith('🏆'))?.value ?? 0;
            return { value: winner, unit: 'mm (least)', higherIsBetter: false };
        }
        case 'human-performance': {
            const best = results.find((r) => r.name.startsWith('🏆'))?.value ?? 0;
            return { value: best, unit: 'smoothness', higherIsBetter: true };
        }
        default:
            return { value: 0, unit: '', higherIsBetter: true };
    }
}
