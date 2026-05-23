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
import { createTimer, type TimerState } from '@/services/sensors/timer';

interface Props {
    activity: ActivityDefinition;
    accent: string;
}

function makeId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ParachuteRecorder({ activity, accent }: Props) {
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { addSensorReading } = useActivity();
    const colors = Colors[resolvedTheme];

    const timerRef = useRef(createTimer());
    const [timer, setTimer] = useState<TimerState>({ isRunning: false, elapsedMs: 0 });
    const [dropTime, setDropTime] = useState(0);

    const [height, setHeight] = useState('');
    const [mass, setMass] = useState('');
    const [contact, setContact] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const t = timerRef.current;
        t.setOnUpdate(setTimer);
        return () => t.cleanup();
    }, []);

    const handleStartStop = () => {
        const t = timerRef.current;
        if (timer.isRunning) {
            const ms = t.stop();
            setDropTime(Math.round(ms) / 1000);
        } else {
            setDropTime(0);
            t.start();
        }
    };

    const handleReset = () => {
        timerRef.current.reset();
        setTimer({ isRunning: false, elapsedMs: 0 });
        setDropTime(0);
    };

    const handleContinue = () => {
        setError('');
        const h = parseFloat(height);
        const m = parseFloat(mass);
        const c = parseFloat(contact);

        if (dropTime <= 0) return setError('Measure the drop time first.');
        if (!(h > 0)) return setError('Enter the drop height in metres.');
        if (!(m > 0)) return setError('Enter the toy mass in kilograms.');

        const now = Date.now();
        const readings: SensorReading[] = [
            { id: makeId(), sensorType: 'timer',  value: dropTime, unit: 's',  timestamp: now, label: 'dropTime' },
            { id: makeId(), sensorType: 'timer',  value: h,        unit: 'm',  timestamp: now, label: 'dropHeight' },
            { id: makeId(), sensorType: 'timer',  value: m,        unit: 'kg', timestamp: now, label: 'mass' },
        ];
        if (c > 0) {
            readings.push({ id: makeId(), sensorType: 'timer', value: c, unit: 's', timestamp: now, label: 'contactTime' });
        }
        readings.forEach(addSensorReading);

        router.push(`/activity/${activity.id}/results`);
    };

    const seconds = (timer.isRunning ? timer.elapsedMs / 1000 : dropTime).toFixed(3);

    return (
        <View>
            {/* Timer */}
            <View style={[styles.timerPanel, { backgroundColor: colors.surface, borderColor: accent }]}>
                <ThemedText variant="labelMedium" color="textSecondary">DROP TIME</ThemedText>
                <ThemedText variant="displayMedium" style={[styles.timerValue, { color: accent }]}>
                    {seconds}
                </ThemedText>
                <ThemedText variant="bodySmall" color="textTertiary">seconds</ThemedText>
            </View>

            <View style={styles.controls}>
                <Pressable
                    onPress={handleStartStop}
                    style={[styles.mainBtn, { backgroundColor: timer.isRunning ? colors.error : accent }]}
                    accessibilityLabel={timer.isRunning ? 'Stop timer' : 'Start timer'}
                >
                    <Ionicons name={timer.isRunning ? 'stop' : 'play'} size={20} color="#FFFFFF" />
                    <ThemedText variant="labelLarge" color="onPrimary" style={styles.mainBtnText}>
                        {timer.isRunning ? 'Stop' : 'Start'}
                    </ThemedText>
                </Pressable>
                {!timer.isRunning && dropTime > 0 ? (
                    <Pressable
                        onPress={handleReset}
                        style={[styles.resetBtn, { borderColor: colors.border }]}
                        accessibilityLabel="Reset timer"
                    >
                        <Ionicons name="refresh" size={20} color={colors.text} />
                    </Pressable>
                ) : null}
            </View>

            <ThemedText variant="bodySmall" color="textTertiary" style={styles.hint}>
                {timer.isRunning
                    ? 'Drop now! Tap Stop the moment it lands.'
                    : 'Tap Start just before releasing the toy.'}
            </ThemedText>

            {/* Inputs */}
            <View style={styles.inputs}>
                <TextField
                    label="Drop height (m)"
                    value={height}
                    onChangeText={setHeight}
                    placeholder="e.g. 1.5"
                    keyboardType="decimal-pad"
                />
                <TextField
                    label="Toy mass (kg)"
                    value={mass}
                    onChangeText={setMass}
                    placeholder="e.g. 0.2"
                    keyboardType="decimal-pad"
                />
                <TextField
                    label="Contact time on landing (s) — optional"
                    value={contact}
                    onChangeText={setContact}
                    placeholder="e.g. 0.05 (for g-force)"
                    keyboardType="decimal-pad"
                    error={error}
                />
            </View>

            <Button label="View Results" onPress={handleContinue} />
        </View>
    );
}

const styles = StyleSheet.create({
    timerPanel: {
        borderRadius: BorderRadius.xxl,
        borderWidth: 2,
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        marginBottom: Spacing.lg,
    },
    timerValue: { fontVariant: ['tabular-nums'], marginVertical: Spacing.xxs },
    controls: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
    mainBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: BorderRadius.lg,
    },
    mainBtnText: { marginLeft: Spacing.sm },
    resetBtn: {
        width: 52,
        height: 52,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hint: { textAlign: 'center', marginBottom: Spacing.lg },
    inputs: { marginBottom: Spacing.sm },
});

export default ParachuteRecorder;
