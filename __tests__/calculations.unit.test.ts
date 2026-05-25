import {
    activityScore,
    calculateBreathing,
    calculateEarthquake,
    calculateHandFan,
    calculateParachute,
    calculateReaction,
    calculateSound,
    parachuteScore,
} from '@/services/calculations';

const byName = (arr: { name: string; value: number }[], name: string) =>
    arr.find((r) => r.name === name);

describe('calculateParachute', () => {
    const results = calculateParachute({ distance: 1.5, mass: 0.2, dropTime: 0.5, contactTime: 0.05 });

    it('returns all six physics results', () => {
        expect(results).toHaveLength(6);
    });

    it('computes final velocity = distance / time', () => {
        expect(byName(results, 'Final Velocity')?.value).toBe(3);
    });

    it('computes acceleration from the raw velocity (no compounding error)', () => {
        expect(byName(results, 'Acceleration')?.value).toBe(6);
    });

    it('computes weight = mass × g', () => {
        expect(byName(results, 'Weight')?.value).toBe(1.962);
    });

    it('computes g-force only when contact time is given', () => {
        expect(byName(results, 'G-Force (no bounce)')?.value).toBe(6.12);
        const noContact = calculateParachute({ distance: 1.5, mass: 0.2, dropTime: 0.5 });
        expect(noContact).toHaveLength(5);
    });

    it('returns nothing for invalid input', () => {
        expect(calculateParachute({ distance: 0, mass: 0.2, dropTime: 0.5 })).toEqual([]);
    });
});

describe('calculateSound', () => {
    const results = calculateSound([60, 80, 70]);
    it('averages the readings', () => {
        expect(byName(results, 'Average Sound Level')?.value).toBe(70);
    });
    it('reports the peak', () => {
        expect(byName(results, 'Peak Sound Level')?.value).toBe(80);
    });
    it('handles no readings', () => {
        expect(calculateSound([])).toEqual([]);
    });
});

describe('calculateHandFan', () => {
    it('labels each card with its material and estimates force', () => {
        const [card] = calculateHandFan([{ label: '1cm folds', angle: 30, material: 'paper' }]);
        expect(card.name).toBe('1cm folds · Thin paper');
        expect(card.value).toBe(30);
        expect(card.unit).toContain('0.0262'); // F = 0.05 × (30° in rad)
    });

    it('uses the per-material stiffness', () => {
        const [paper] = calculateHandFan([{ label: 'x', angle: 30, material: 'paper' }]);
        const [board] = calculateHandFan([{ label: 'x', angle: 30, material: 'cardboard' }]);
        // cardboard k (0.5) is 10× paper k (0.05) → 10× the force at the same angle
        const f = (u: string) => parseFloat(u.match(/F≈([\d.]+)/)![1]);
        expect(f(board.unit)).toBeCloseTo(f(paper.unit) * 10, 3);
    });
});

describe('calculateEarthquake', () => {
    const results = calculateEarthquake([
        { label: 'D1', peakMm: 4 },
        { label: 'D2', peakMm: 2 },
    ]);
    it('names the least-vibrating design as most stable', () => {
        const winner = results.find((r) => r.name.startsWith('🏆'));
        expect(winner?.name).toBe('🏆 Most stable: D2');
        expect(winner?.value).toBe(2);
    });
});

describe('calculateReaction', () => {
    const results = calculateReaction([300, 250, 400]);
    it('averages and picks the fastest', () => {
        expect(byName(results, 'Average Reaction')?.value).toBe(317);
        expect(results.find((r) => r.name.startsWith('⚡'))?.value).toBe(250);
    });
});

describe('calculateBreathing', () => {
    it('reports the change from first to last condition', () => {
        const results = calculateBreathing([
            { label: 'Rest', bpm: 12 },
            { label: 'After', bpm: 20 },
        ]);
        const change = results.find((r) => r.name.includes('Change'));
        expect(change?.value).toBe(8);
    });
});

describe('parachuteScore + activityScore', () => {
    it('rewards a slower (safer) landing with a higher score', () => {
        const slow = parachuteScore(calculateParachute({ distance: 1, mass: 0.2, dropTime: 1 })); // v=1
        const fast = parachuteScore(calculateParachute({ distance: 4, mass: 0.2, dropTime: 1 })); // v=4
        expect(slow).toBeGreaterThan(fast);
    });

    it('marks lower-is-better for sound, earthquake and reaction', () => {
        expect(activityScore('sound-pollution', calculateSound([70])).higherIsBetter).toBe(false);
        expect(activityScore('reaction-board', calculateReaction([300])).higherIsBetter).toBe(false);
        expect(
            activityScore('earthquake-structure', calculateEarthquake([{ label: 'D', peakMm: 3 }])).higherIsBetter,
        ).toBe(false);
    });

    it('marks higher-is-better for parachute', () => {
        expect(activityScore('parachute-drop', calculateParachute({ distance: 1, mass: 0.2, dropTime: 0.5 })).higherIsBetter).toBe(true);
    });
});
