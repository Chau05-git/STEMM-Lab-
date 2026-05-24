import { Ionicons } from '@expo/vector-icons';
import {
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioRecorder,
    useAudioRecorderState,
} from 'expo-audio';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import type { ActivityDefinition, SensorReading } from '@/constants/types';
import { useActivity } from '@/context/ActivityContext';
import { useSettings } from '@/context/SettingsContext';
import { dbColor, getHearingRisk, smoothDb, toEnvironmentalDb } from '@/services/sensors/audio';
import { getCurrentLocation } from '@/services/location';

interface Props {
    activity: ActivityDefinition;
    accent: string;
}

function makeId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function SoundRecorder({ activity, accent }: Props) {
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { setSensorReadings } = useActivity();
    const colors = Colors[resolvedTheme];

    const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
    const recorderState = useAudioRecorderState(recorder, 200);

    const [isActive, setIsActive] = useState(false);
    const [currentDb, setCurrentDb] = useState(0);
    const [peak, setPeak] = useState(0);
    const [label, setLabel] = useState('');
    const [saved, setSaved] = useState<SensorReading[]>([]);
    const [savingGps, setSavingGps] = useState(false);
    const [error, setError] = useState('');

    // Request microphone permission once.
    useEffect(() => {
        AudioModule.requestRecordingPermissionsAsync().then((s) => {
            if (!s.granted) setError('Microphone permission is required to measure sound.');
        });
    }, []);

    // Process live metering → smoothed environmental dB.
    useEffect(() => {
        if (!isActive || recorderState.metering == null) return;
        const raw = toEnvironmentalDb(recorderState.metering);
        setCurrentDb((prev) => {
            const next = prev === 0 ? Math.round(raw) : smoothDb(prev, raw);
            setPeak((p) => (next > p ? next : p));
            return next;
        });
    }, [recorderState.metering, isActive]);

    const handleToggle = async () => {
        if (isActive) {
            await recorder.stop();
            setIsActive(false);
        } else {
            await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
            await recorder.prepareToRecordAsync();
            recorder.record();
            setIsActive(true);
        }
    };

    const handleSaveReading = async () => {
        if (currentDb <= 0) return setError('Start the meter and let it read a level first.');
        setError('');
        setSavingGps(true);
        const loc = await getCurrentLocation();
        setSavingGps(false);

        const reading: SensorReading = {
            id: makeId(),
            sensorType: 'microphone',
            value: currentDb,
            unit: 'dB',
            timestamp: Date.now(),
            label: label.trim() || `Action ${saved.length + 1}`,
            latitude: loc?.latitude,
            longitude: loc?.longitude,
        };
        setSaved((prev) => [...prev, reading]);
        setLabel('');
    };

    const handleContinue = () => {
        if (saved.length === 0) return setError('Save at least one sound reading first.');
        setSensorReadings(saved);
        router.push(`/activity/${activity.id}/results`);
    };

    const risk = getHearingRisk(currentDb);
    const barColor = dbColor(currentDb);
    const barPct = Math.min(currentDb / 130, 1) * 100;

    return (
        <View>
            {/* Live dB meter */}
            <View style={[styles.meter, { backgroundColor: colors.surface, borderColor: accent }]}>
                <ThemedText variant="labelMedium" color="textSecondary">SOUND LEVEL</ThemedText>
                <ThemedText variant="displayMedium" style={[styles.dbValue, { color: barColor }]}>
                    {currentDb}
                </ThemedText>
                <ThemedText variant="bodySmall" color="textTertiary">dB (approx)</ThemedText>

                {/* Level bar */}
                <View style={[styles.barTrack, { backgroundColor: colors.surfaceVariant }]}>
                    <View style={[styles.barFill, { backgroundColor: barColor, width: `${barPct}%` }]} />
                </View>

                <View style={styles.statsRow}>
                    <ThemedText variant="labelSmall" color="textSecondary">Peak: {peak} dB</ThemedText>
                    <ThemedText variant="labelSmall" style={{ color: risk.color }}>{risk.level}</ThemedText>
                </View>
            </View>

            {/* Controls */}
            <Pressable
                onPress={handleToggle}
                style={[styles.mainBtn, { backgroundColor: isActive ? colors.error : accent }]}
                accessibilityLabel={isActive ? 'Stop sound meter' : 'Start sound meter'}
            >
                <Ionicons name={isActive ? 'stop' : 'mic'} size={20} color="#FFFFFF" />
                <ThemedText variant="labelLarge" color="onPrimary" style={styles.mainBtnText}>
                    {isActive ? 'Stop meter' : 'Start meter'}
                </ThemedText>
            </Pressable>

            {/* Label + save reading */}
            <View style={styles.saveRow}>
                <View style={styles.labelInput}>
                    <TextField
                        value={label}
                        onChangeText={setLabel}
                        placeholder="Action (e.g. dropping a book)"
                        style={styles.noMargin}
                    />
                </View>
                <Pressable
                    onPress={handleSaveReading}
                    disabled={savingGps}
                    style={[styles.saveBtn, { borderColor: accent, opacity: savingGps ? 0.6 : 1 }]}
                    accessibilityLabel="Save this reading"
                >
                    <Ionicons name={savingGps ? 'location' : 'add'} size={20} color={accent} />
                </Pressable>
            </View>

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
                            {r.latitude != null ? (
                                <Ionicons name="location" size={14} color={colors.textTertiary} />
                            ) : null}
                            <ThemedText variant="labelLarge" style={{ color: dbColor(r.value) }}>
                                {r.value} dB
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
    meter: {
        borderRadius: BorderRadius.xxl,
        borderWidth: 2,
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    dbValue: { fontVariant: ['tabular-nums'], marginVertical: Spacing.xxs },
    barTrack: {
        width: '100%',
        height: 14,
        borderRadius: BorderRadius.full,
        overflow: 'hidden',
        marginTop: Spacing.md,
    },
    barFill: { height: '100%', borderRadius: BorderRadius.full },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: Spacing.sm,
    },
    mainBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.lg,
    },
    mainBtnText: { marginLeft: Spacing.sm },
    saveRow: { flexDirection: 'row', alignItems: 'center' },
    labelInput: { flex: 1 },
    noMargin: { marginBottom: 0 },
    saveBtn: {
        width: 52,
        height: 52,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: Spacing.sm,
    },
    error: { marginTop: Spacing.sm },
    savedCard: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginTop: Spacing.md,
    },
    savedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.xs,
    },
    savedLabel: { flex: 1 },
    cta: { marginTop: Spacing.lg },
});

export default SoundRecorder;
