import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
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

export function BreathingRecorder({ activity, accent }: Props) {
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { setSensorReadings } = useActivity();
    const colors = Colors[resolvedTheme];

    const accelRef = useRef(createAccelerometerService());
    const startRef = useRef(0);
    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [isActive, setIsActive] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [liveBpm, setLiveBpm] = useState(0);
    const [condition, setCondition] = useState('');
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
        setLiveBpm(0);

        try {
            await accel.start(50);
        } catch {
            setError('Accelerometer permission is required.');
            return;
        }
        startRef.current = Date.now();
        setElapsed(0);
        tickRef.current = setInterval(() => {
            const secs = (Date.now() - startRef.current) / 1000;
            setElapsed(secs);
            // Slow breathing needs ~8s of data before a period can be found.
            if (secs > 8) setLiveBpm(accel.getBreathsPerMinute(secs));
        }, 700);
        setIsActive(true);
    };

    const handleStop = () => {
        const accel = accelRef.current;
        accel.stop();
        if (tickRef.current) clearInterval(tickRef.current);

        const secs = (Date.now() - startRef.current) / 1000;
        if (secs < 10) {
            setIsActive(false);
            setError('Record for at least 10 seconds for an accurate rate.');
            return;
        }
        const bpm = accel.getBreathsPerMinute(secs);
        const reading: SensorReading = {
            id: makeId(),
            sensorType: 'accelerometer',
            value: bpm,
            unit: 'bpm',
            timestamp: Date.now(),
            label: condition.trim() || `Reading ${saved.length + 1}`,
        };
        setSaved((prev) => [...prev, reading]);
        setLiveBpm(bpm);
        setCondition('');
        setIsActive(false);
    };

    const handleContinue = () => {
        if (saved.length === 0) return setError('Record at least one breathing reading first.');
        setSensorReadings(saved);
        router.push(`/activity/${activity.id}/results`);
    };

    return (
        <View>
            {/* Live BPM panel */}
            <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: isActive ? colors.info : accent }]}>
                <ThemedText variant="labelMedium" color="textSecondary">
                    {isActive ? `RECORDING… ${elapsed.toFixed(0)}s` : 'BREATHS / MIN'}
                </ThemedText>
                <ThemedText variant="displayMedium" style={[styles.value, { color: isActive ? colors.info : accent }]}>
                    {isActive && liveBpm === 0 ? '…' : liveBpm}
                </ThemedText>
                <ThemedText variant="bodySmall" color="textTertiary">
                    {isActive && liveBpm === 0 ? 'measuring…' : 'breaths per minute'}
                </ThemedText>
            </View>

            <ThemedText variant="bodySmall" color="textTertiary" style={styles.hint}>
                Lie down and place the phone gently on your chest. Name the condition, tap Start,
                and breathe normally for ~30 seconds.
            </ThemedText>

            <TextField
                label="Condition"
                value={condition}
                onChangeText={setCondition}
                placeholder="e.g. At rest / After exercise"
                editable={!isActive}
            />

            <Pressable
                onPress={isActive ? handleStop : handleStart}
                style={[styles.mainBtn, { backgroundColor: isActive ? colors.error : accent }]}
                accessibilityLabel={isActive ? 'Stop recording' : 'Start recording'}
            >
                <Ionicons name={isActive ? 'stop' : 'fitness'} size={20} color="#FFFFFF" />
                <ThemedText variant="labelLarge" color="onPrimary" style={styles.mainBtnText}>
                    {isActive ? 'Stop' : 'Start recording'}
                </ThemedText>
            </Pressable>

            {error ? (
                <ThemedText variant="bodySmall" color="error" style={styles.error}>{error}</ThemedText>
            ) : null}

            {/* Saved readings */}
            {saved.length > 0 ? (
                <View style={[styles.savedCard, { backgroundColor: colors.surface }]}>
                    {saved.map((r) => (
                        <View key={r.id} style={styles.savedRow}>
                            <ThemedText variant="bodyMedium" style={styles.savedLabel} numberOfLines={1}>
                                {r.label}
                            </ThemedText>
                            <ThemedText variant="labelLarge" style={{ color: accent }}>
                                {r.value} bpm
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

export default BreathingRecorder;
