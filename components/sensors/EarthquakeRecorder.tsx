import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import type { ActivityDefinition, SensorReading } from '@/constants/types';
import { useActivity } from '@/context/ActivityContext';
import { useSettings } from '@/context/SettingsContext';
import { earthquakeStability } from '@/services/calculations';
import { createAccelerometerService } from '@/services/sensors/accelerometer';

interface Props {
    activity: ActivityDefinition;
    accent: string;
}

const TEST_SECONDS = 5;

function makeId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function EarthquakeRecorder({ activity, accent }: Props) {
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { setSensorReadings } = useActivity();
    const colors = Colors[resolvedTheme];

    const accelRef = useRef(createAccelerometerService());
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [testing, setTesting] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [liveAmp, setLiveAmp] = useState(0);
    const [design, setDesign] = useState('');
    const [saved, setSaved] = useState<SensorReading[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const accel = accelRef.current;
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            accel.cleanup();
        };
    }, []);

    const finishTest = () => {
        const accel = accelRef.current;
        accel.stop();
        if (intervalRef.current) clearInterval(intervalRef.current);

        const peak = Math.round(accel.getPeakVibration() * 10) / 10;
        const reading: SensorReading = {
            id: makeId(),
            sensorType: 'accelerometer',
            value: peak,
            unit: 'mm',
            timestamp: Date.now(),
            label: design.trim() || `Design ${saved.length + 1}`,
        };
        setSaved((prev) => [...prev, reading]);
        setDesign('');
        setTesting(false);
        setLiveAmp(peak);
    };

    const handleRunTest = async () => {
        if (testing) return;
        setError('');
        const accel = accelRef.current;
        accel.clearReadings();
        setLiveAmp(0);
        accel.setOnReading((r) => setLiveAmp(r.vibrationAmplitudeMm));

        try {
            await accel.start(50);
        } catch {
            setError('Accelerometer permission is required.');
            return;
        }

        setTesting(true);
        setCountdown(TEST_SECONDS);
        intervalRef.current = setInterval(() => {
            setCountdown((c) => (c > 1 ? c - 1 : 0));
        }, 1000);
        timeoutRef.current = setTimeout(finishTest, TEST_SECONDS * 1000);
    };

    const handleContinue = () => {
        if (saved.length === 0) return setError('Run a shake test on at least one design first.');
        setSensorReadings(saved);
        router.push(`/activity/${activity.id}/results`);
    };

    return (
        <View>
            {/* Live amplitude / countdown panel */}
            <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: testing ? colors.error : accent }]}>
                <ThemedText variant="labelMedium" color="textSecondary">
                    {testing ? `SHAKING… ${countdown}s` : 'VIBRATION AMPLITUDE'}
                </ThemedText>
                <ThemedText variant="displayMedium" style={[styles.value, { color: testing ? colors.error : accent }]}>
                    {liveAmp.toFixed(1)}
                </ThemedText>
                <ThemedText variant="bodySmall" color="textTertiary">mm</ThemedText>
            </View>

            <ThemedText variant="bodySmall" color="textTertiary" style={styles.hint}>
                Place the phone on your structure, name the design, then start a {TEST_SECONDS}s test
                and gently shake the table. Lower movement = a more stable structure.
            </ThemedText>

            {/* Design name */}
            <TextField
                label="Design"
                value={design}
                onChangeText={setDesign}
                placeholder="e.g. 4 folds + 4 pillars"
                editable={!testing}
            />

            <Button
                label={testing ? `Testing… ${countdown}s` : `Run ${TEST_SECONDS}s shake test`}
                variant="secondary"
                onPress={handleRunTest}
                loading={testing}
            />

            {error ? (
                <ThemedText variant="bodySmall" color="error" style={styles.error}>{error}</ThemedText>
            ) : null}

            {/* Saved designs */}
            {saved.length > 0 ? (
                <View style={[styles.savedCard, { backgroundColor: colors.surface }]}>
                    {saved.map((r) => {
                        const stab = earthquakeStability(r.value);
                        return (
                            <View key={r.id} style={styles.savedRow}>
                                <ThemedText variant="bodyMedium" style={styles.savedLabel} numberOfLines={1}>
                                    {r.label}
                                </ThemedText>
                                <ThemedText variant="labelMedium" color="textTertiary">{r.value} mm</ThemedText>
                                <ThemedText variant="labelLarge" style={{ color: accent }}>{stab}%</ThemedText>
                            </View>
                        );
                    })}
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
    error: { marginTop: Spacing.sm },
    savedCard: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginTop: Spacing.md },
    savedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingVertical: Spacing.xs,
    },
    savedLabel: { flex: 1 },
    cta: { marginTop: Spacing.lg },
});

export default EarthquakeRecorder;
