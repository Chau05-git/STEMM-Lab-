import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import type { ActivityDefinition, SensorReading } from '@/constants/types';
import { useActivity } from '@/context/ActivityContext';
import { useSettings } from '@/context/SettingsContext';
import { createAccelerometerService } from '@/services/sensors/accelerometer';

interface Props {
    activity: ActivityDefinition;
    accent: string;
}

function makeId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function HumanPerformanceRecorder({ activity, accent }: Props) {
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { setSensorReadings } = useActivity();
    const colors = Colors[resolvedTheme];

    const accelRef = useRef(createAccelerometerService());
    const startRef = useRef<number>(0);
    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [isActive, setIsActive] = useState(false);
    const [smoothness, setSmoothness] = useState(100);
    const [elapsed, setElapsed] = useState(0);
    const [saved, setSaved] = useState<SensorReading[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const accel = accelRef.current;
        return () => {
            if (tickRef.current) clearInterval(tickRef.current);
            accel.cleanup();
        };
    }, []);

    const handleStart = async () => {
        setError('');
        const accel = accelRef.current;
        accel.clearReadings();
        setSmoothness(100);
        accel.setOnReading(() => setSmoothness(accel.getSmoothnessScore()));

        try {
            await accel.start(50);
        } catch {
            setError('Accelerometer permission is required.');
            return;
        }
        startRef.current = Date.now();
        setElapsed(0);
        tickRef.current = setInterval(() => {
            setElapsed((Date.now() - startRef.current) / 1000);
        }, 100);
        setIsActive(true);
    };

    const handleStop = () => {
        const accel = accelRef.current;
        accel.stop();
        if (tickRef.current) clearInterval(tickRef.current);

        const finalSmooth = accel.getSmoothnessScore();
        const seconds = Math.round((Date.now() - startRef.current) / 100) / 10;
        const reading: SensorReading = {
            id: makeId(),
            sensorType: 'accelerometer',
            value: finalSmooth,
            unit: '/100',
            timestamp: Date.now(),
            label: `Attempt ${saved.length + 1} · ${seconds}s`,
        };
        setSaved((prev) => [...prev, reading]);
        setSmoothness(finalSmooth);
        setIsActive(false);
    };

    const handleContinue = () => {
        if (saved.length === 0) return setError('Record at least one movement attempt first.');
        setSensorReadings(saved);
        router.push(`/activity/${activity.id}/results`);
    };

    return (
        <View>
            {/* Live smoothness panel */}
            <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: isActive ? colors.success : accent }]}>
                <ThemedText variant="labelMedium" color="textSecondary">
                    {isActive ? `MOVING… ${elapsed.toFixed(1)}s` : 'SMOOTHNESS'}
                </ThemedText>
                <ThemedText variant="displayMedium" style={[styles.value, { color: isActive ? colors.success : accent }]}>
                    {smoothness}
                </ThemedText>
                <ThemedText variant="bodySmall" color="textTertiary">/ 100</ThemedText>
            </View>

            <ThemedText variant="bodySmall" color="textTertiary" style={styles.hint}>
                Hold the phone, tap Start, perform the guided movement slowly and smoothly,
                then tap Stop. Smoother motion = better coordination.
            </ThemedText>

            <Pressable
                onPress={isActive ? handleStop : handleStart}
                style={[styles.mainBtn, { backgroundColor: isActive ? colors.error : accent }]}
                accessibilityLabel={isActive ? 'Stop movement' : 'Start movement'}
            >
                <Ionicons name={isActive ? 'stop' : 'walk'} size={20} color="#FFFFFF" />
                <ThemedText variant="labelLarge" color="onPrimary" style={styles.mainBtnText}>
                    {isActive ? 'Stop' : 'Start movement'}
                </ThemedText>
            </Pressable>

            {error ? (
                <ThemedText variant="bodySmall" color="error" style={styles.error}>{error}</ThemedText>
            ) : null}

            {/* Saved attempts — smoothest is highlighted */}
            {saved.length > 0 ? (
                <View style={[styles.savedCard, { backgroundColor: colors.surface }]}>
                    {(() => {
                        const best = Math.max(...saved.map((r) => r.value));
                        return saved.map((r) => {
                            const isBest = r.value === best;
                            return (
                                <View key={r.id} style={styles.savedRow}>
                                    <ThemedText variant="bodyMedium" style={styles.savedLabel} numberOfLines={1}>
                                        {isBest ? '🏆 ' : ''}{r.label}
                                    </ThemedText>
                                    <ThemedText variant="labelLarge" style={{ color: isBest ? colors.success : colors.textSecondary }}>
                                        {r.value}/100
                                    </ThemedText>
                                </View>
                            );
                        });
                    })()}
                </View>
            ) : null}

            <Button label="View Results" onPress={handleContinue} style={styles.cta} />
        </View>
    );
}

const styles = StyleSheet.create({
    panel: {
        borderRadius: BorderRadius.xxl,
        borderWidth: 2,
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        marginBottom: Spacing.lg,
    },
    value: { fontVariant: ['tabular-nums'], marginVertical: Spacing.xxs },
    hint: { textAlign: 'center', marginBottom: Spacing.lg },
    mainBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: BorderRadius.lg,
    },
    mainBtnText: { marginLeft: Spacing.sm },
    error: { marginTop: Spacing.sm },
    savedCard: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginTop: Spacing.md },
    savedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.xs,
    },
    savedLabel: { flex: 1, marginRight: Spacing.sm },
    cta: { marginTop: Spacing.lg },
});

export default HumanPerformanceRecorder;
