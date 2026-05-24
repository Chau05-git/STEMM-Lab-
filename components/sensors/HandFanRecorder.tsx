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
import { HAND_FAN_MATERIALS, type HandFanMaterial } from '@/services/calculations';
import { createAccelerometerService } from '@/services/sensors/accelerometer';

interface Props {
    activity: ActivityDefinition;
    accent: string;
}

function makeId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const MATERIALS = Object.keys(HAND_FAN_MATERIALS) as HandFanMaterial[];

export function HandFanRecorder({ activity, accent }: Props) {
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { setSensorReadings } = useActivity();
    const colors = Colors[resolvedTheme];

    const accelRef = useRef(createAccelerometerService());
    const [isActive, setIsActive] = useState(false);
    const [angle, setAngle] = useState(0);
    const [peak, setPeak] = useState(0);
    const [material, setMaterial] = useState<HandFanMaterial>('paper');
    const [design, setDesign] = useState('');
    const [saved, setSaved] = useState<SensorReading[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const accel = accelRef.current;
        return () => accel.cleanup();
    }, []);

    const handleToggle = async () => {
        const accel = accelRef.current;
        if (isActive) {
            accel.stop();
            setIsActive(false);
        } else {
            accel.clearReadings();
            setPeak(0);
            accel.setOnReading((r) => {
                setAngle(r.bendAngleDeg);
                setPeak((p) => (r.bendAngleDeg > p ? r.bendAngleDeg : p));
            });
            try {
                await accel.start(100);
                setIsActive(true);
            } catch {
                setError('Accelerometer permission is required.');
            }
        }
    };

    const handleCapture = () => {
        if (peak <= 0) return setError('Start the sensor and fan the material first.');
        setError('');
        const reading: SensorReading = {
            id: makeId(),
            sensorType: 'accelerometer',
            value: peak,
            unit: '°',
            timestamp: Date.now(),
            label: design.trim() || `Design ${saved.length + 1}`,
        };
        setSaved((prev) => [...prev, reading]);
        setDesign('');
        setPeak(0);
    };

    const handleContinue = () => {
        if (saved.length === 0) return setError('Capture at least one design first.');
        // Store the chosen material stiffness so Results can estimate force.
        const stiffness: SensorReading = {
            id: makeId(),
            sensorType: 'accelerometer',
            value: HAND_FAN_MATERIALS[material].k,
            unit: 'N/rad',
            timestamp: Date.now(),
            label: 'stiffness',
        };
        setSensorReadings([stiffness, ...saved]);
        router.push(`/activity/${activity.id}/results`);
    };

    return (
        <View>
            {/* Live bend angle */}
            <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: accent }]}>
                <ThemedText variant="labelMedium" color="textSecondary">BEND ANGLE</ThemedText>
                <ThemedText variant="displayMedium" style={[styles.value, { color: accent }]}>
                    {angle.toFixed(1)}°
                </ThemedText>
                <ThemedText variant="bodySmall" color="textTertiary">peak: {peak.toFixed(1)}°</ThemedText>
            </View>

            <Pressable
                onPress={handleToggle}
                style={[styles.mainBtn, { backgroundColor: isActive ? colors.error : accent }]}
                accessibilityLabel={isActive ? 'Stop sensor' : 'Start sensor'}
            >
                <Ionicons name={isActive ? 'stop' : 'pulse'} size={20} color="#FFFFFF" />
                <ThemedText variant="labelLarge" color="onPrimary" style={styles.mainBtnText}>
                    {isActive ? 'Stop sensor' : 'Start sensor'}
                </ThemedText>
            </Pressable>

            <ThemedText variant="bodySmall" color="textTertiary" style={styles.hint}>
                Attach the phone to the material, then fan it. Capture the peak bend for each design.
            </ThemedText>

            {/* Material selector */}
            <ThemedText variant="labelMedium" color="textSecondary" style={styles.matLabel}>Material</ThemedText>
            <View style={styles.matRow}>
                {MATERIALS.map((m) => {
                    const selected = material === m;
                    return (
                        <Pressable
                            key={m}
                            onPress={() => setMaterial(m)}
                            style={[
                                styles.matChip,
                                {
                                    backgroundColor: selected ? accent : colors.surfaceVariant,
                                    borderColor: selected ? accent : colors.border,
                                },
                            ]}
                        >
                            <ThemedText
                                variant="labelSmall"
                                style={{ color: selected ? colors.onPrimary : colors.textSecondary }}
                            >
                                {HAND_FAN_MATERIALS[m].label}
                            </ThemedText>
                        </Pressable>
                    );
                })}
            </View>

            {/* Design name + capture */}
            <View style={styles.captureRow}>
                <View style={styles.designInput}>
                    <TextField
                        value={design}
                        onChangeText={setDesign}
                        placeholder="Design (e.g. 1 cm folds)"
                        style={styles.noMargin}
                    />
                </View>
                <Pressable
                    onPress={handleCapture}
                    style={[styles.captureBtn, { borderColor: accent }]}
                    accessibilityLabel="Capture this design's bend"
                >
                    <Ionicons name="add" size={20} color={accent} />
                </Pressable>
            </View>

            {error ? (
                <ThemedText variant="bodySmall" color="error" style={styles.error}>{error}</ThemedText>
            ) : null}

            {/* Saved designs */}
            {saved.length > 0 ? (
                <View style={[styles.savedCard, { backgroundColor: colors.surface }]}>
                    {saved.map((r) => (
                        <View key={r.id} style={styles.savedRow}>
                            <ThemedText variant="bodyMedium" style={styles.savedLabel} numberOfLines={1}>
                                {r.label}
                            </ThemedText>
                            <ThemedText variant="labelLarge" style={{ color: accent }}>
                                {r.value.toFixed(1)}°
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
    mainBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
    },
    mainBtnText: { marginLeft: Spacing.sm },
    hint: { textAlign: 'center', marginBottom: Spacing.lg },
    matLabel: { marginBottom: Spacing.sm, marginLeft: Spacing.xs },
    matRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
    matChip: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
    },
    captureRow: { flexDirection: 'row', alignItems: 'center' },
    designInput: { flex: 1 },
    noMargin: { marginBottom: 0 },
    captureBtn: {
        width: 52,
        height: 52,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: Spacing.sm,
    },
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

export default HandFanRecorder;
