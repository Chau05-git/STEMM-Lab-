export interface TimerState {
    isRunning: boolean;
    elapsedMs: number;
}

/**
 * High-resolution stopwatch driven by requestAnimationFrame.
 * Used by the parachute drop (and any timed activity) to measure elapsed
 * seconds between two taps.
 */
export function createTimer() {
    let startTime: number | null = null;
    let accumulatedMs = 0;
    let running = false;
    let rafId: number | null = null;
    let onUpdate: ((state: TimerState) => void) | null = null;

    function elapsed(): number {
        return running && startTime !== null
            ? accumulatedMs + (performance.now() - startTime)
            : accumulatedMs;
    }

    function tick() {
        if (!running) return;
        onUpdate?.({ isRunning: true, elapsedMs: elapsed() });
        rafId = requestAnimationFrame(tick);
    }

    return {
        start() {
            if (running) return;
            running = true;
            startTime = performance.now();
            tick();
        },
        stop(): number {
            if (!running) return elapsed();
            running = false;
            accumulatedMs += performance.now() - (startTime ?? performance.now());
            startTime = null;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            return accumulatedMs;
        },
        reset() {
            running = false;
            startTime = null;
            accumulatedMs = 0;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        },
        getSeconds(): number {
            return Math.round(elapsed()) / 1000;
        },
        setOnUpdate(cb: (state: TimerState) => void) {
            onUpdate = cb;
        },
        cleanup() {
            running = false;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            onUpdate = null;
        },
    };
}

export type Timer = ReturnType<typeof createTimer>;
