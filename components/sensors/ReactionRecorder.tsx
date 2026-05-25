import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import type { ActivityDefinition, SensorReading } from '@/constants/types';
import { useActivity } from '@/context/ActivityContext';
import { useSettings } from '@/context/SettingsContext';
import { reactionRating } from '@/services/calculations';

interface Props {
    activity: ActivityDefinition;
    accent: string;
}

type Phase = 'idle' | 'waiting' | 'go' | 'tooSoon' | 'result';

function makeId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ReactionRecorder({ activity, accent }: Props) {
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { setSensorReadings } = useActivity();
    const colors = Colors[resolvedTheme];

    const [phase, setPhase] = useState<Phase>('idle');
    const [lastMs, setLastMs] = useState(0);
    const [times, setTimes] = useState<number[]>([]);
    const goTimeRef = useRef(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    const startRound = () => {
        setPhase('waiting');
        const delay = 1500 + Math.random() * 3000; // 1.5–4.5s
        timeoutRef.current = setTimeout(() => {
            goTimeRef.current = Date.now();
            setPhase('go');
        }, delay);
    };

    const handleTap = () => {
        switch (phase) {
            case 'idle':
            case 'result':
            case 'tooSoon':
                startRound();
                break;
            case 'waiting':
                // Tapped before green — false start.
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                setPhase('tooSoon');
                break;
            case 'go': {
                const ms = Date.now() - goTimeRef.current;
                setLastMs(ms);
                setTimes((prev) => [...prev, ms]);
                setPhase('result');
                break;
            }
        }
    };

    const handleContinue = () => {
        if (times.length === 0) return;
        const readings: SensorReading[] = times.map((ms, i) => ({
            id: makeId(),
            sensorType: 'touchscreen',
            value: ms,
            unit: 'ms',
            timestamp: Date.now(),
            label: `Round ${i + 1}`,
        }));
        setSensorReadings(readings);
        router.push(`/activity/${activity.id}/results`);
    };

    // Tap-zone appearance per phase.
    const zone = {
        idle:    { bg: colors.surface,        title: 'Tap to start',          sub: 'Tap as fast as you can when it turns green' },
        waiting: { bg: colors.warning,        title: 'Wait for green…',       sub: 'Don’t tap yet!' },
        go:      { bg: colors.success,        title: 'TAP NOW!',              sub: '' },
        tooSoon: { bg: colors.error,          title: 'Too soon! 😅',          sub: 'Tap to try again' },
        result:  { bg: colors.surface,        title: `${lastMs} ms`,          sub: reactionRating(lastMs) },
    }[phase];

    const best = times.length ? Math.min(...times) : 0;

    return (
        <View>
            {/* Tap zone */}
            <Pressable
                onPress={handleTap}
                style={[styles.zone, { backgroundColor: zone.bg, borderColor: accent }]}
                accessibilityLabel={zone.title}
            >
                <ThemedText
                    variant="headlineMedium"
                    style={[styles.zoneTitle, { color: phase === 'go' || phase === 'waiting' || phase === 'tooSoon' ? '#FFFFFF' : colors.text }]}
                >
                    {zone.title}
                </ThemedText>
                {zone.sub ? (
                    <ThemedText
                        variant="bodyMedium"
                        style={{ color: phase === 'go' || phase === 'waiting' || phase === 'tooSoon' ? '#FFFFFF' : colors.textSecondary, textAlign: 'center' }}
                    >
                        {zone.sub}
                    </ThemedText>
                ) : null}
            </Pressable>

            {/* Stats */}
            {times.length > 0 ? (
                <View style={styles.statsRow}>
                    <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
                        <ThemedText variant="headlineSmall" style={{ color: accent }}>{times.length}</ThemedText>
                        <ThemedText variant="caption" color="textSecondary">rounds</ThemedText>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
                        <ThemedText variant="headlineSmall" style={{ color: accent }}>{best}</ThemedText>
                        <ThemedText variant="caption" color="textSecondary">best (ms)</ThemedText>
                    </View>
                </View>
            ) : null}

            {/* Round list */}
            {times.length > 0 ? (
                <View style={[styles.savedCard, { backgroundColor: colors.surface }]}>
                    {times.map((ms, i) => (
                        <View key={i} style={styles.savedRow}>
                            <ThemedText variant="bodyMedium" style={styles.savedLabel}>
                                {ms === best ? '⚡ ' : ''}Round {i + 1}
                            </ThemedText>
                            <ThemedText variant="labelLarge" style={{ color: ms === best ? accent : colors.textSecondary }}>
                                {ms} ms
                            </ThemedText>
                        </View>
                    ))}
                </View>
            ) : null}

            <Button label="View Results" onPress={handleContinue} style={styles.cta} />
        </View>
    );
}

const styles = StyleSheet.create({
    zone: {
        height: 260,
        borderRadius: BorderRadius.xxl,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
        marginBottom: Spacing.lg,
    },
    zoneTitle: { textAlign: 'center', marginBottom: Spacing.xs },
    statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
    statBox: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.lg,
    },
    savedCard: { borderRadius: BorderRadius.lg, padding: Spacing.md },
    savedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.xs,
    },
    savedLabel: { flex: 1 },
    cta: { marginTop: Spacing.lg },
});

export default ReactionRecorder;
