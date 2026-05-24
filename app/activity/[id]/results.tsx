import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { VideoReview } from '@/components/VideoReview';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { getActivityById } from '@/constants/activities';
import { activityHeaderOptions } from '@/constants/screenOptions';
import { BorderRadius, Colors, IconSize, Spacing } from '@/constants/theme';
import type { ActivityAttempt } from '@/constants/types';
import { useActivity } from '@/context/ActivityContext';
import { useSettings } from '@/context/SettingsContext';
import { useTeam } from '@/context/TeamContext';
import { calculateHandFan, calculateParachute, calculateSound, parachuteScore, type CalculationResult } from '@/services/calculations';
import { saveAttempt } from '@/services/database';
import { getCurrentLocation } from '@/services/location';
import { getHearingRisk } from '@/services/sensors/audio';

export default function ResultsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { activeAttempt, finishAttempt, discardAttempt } = useActivity();
    const { setActivityProgress } = useTeam();
    const colors = Colors[resolvedTheme];

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [saving, setSaving] = useState(false);

    const activity = getActivityById(id);
    if (!activity) return null;

    const accent = activity.category === 'engineering' ? colors.engineering : colors.health;

    // ── Compute live results from the recorded sensor readings ──
    const reading = (label: string) =>
        activeAttempt?.sensorReadings.find((r) => r.label === label)?.value ?? 0;

    let results: CalculationResult[] = [];
    if (activity.id === 'parachute-drop' && activeAttempt) {
        results = calculateParachute({
            distance: reading('dropHeight'),
            mass: reading('mass'),
            dropTime: reading('dropTime'),
            contactTime: reading('contactTime'),
        });
    } else if (activity.id === 'sound-pollution' && activeAttempt) {
        const dbValues = activeAttempt.sensorReadings
            .filter((r) => r.sensorType === 'microphone')
            .map((r) => r.value);
        results = calculateSound(dbValues);
    } else if (activity.id === 'hand-fan' && activeAttempt) {
        const k = activeAttempt.sensorReadings.find((r) => r.label === 'stiffness')?.value ?? 0.05;
        const designs = activeAttempt.sensorReadings
            .filter((r) => r.label !== 'stiffness')
            .map((r) => ({ label: r.label ?? 'Design', angle: r.value }));
        results = calculateHandFan(designs, k);
    }

    // For sound, classify the loudest (peak) reading into a hearing-risk band.
    const peakSound = results.find((r) => r.name === 'Peak Sound Level')?.value ?? 0;
    const soundRisk =
        activity.id === 'sound-pollution' && peakSound > 0 ? getHearingRisk(peakSound) : null;

    const handleSave = async () => {
        setSaving(true);

        const finished = finishAttempt();
        if (finished) {
            const loc = await getCurrentLocation();
            const toSave: ActivityAttempt = {
                ...finished,
                rating,
                comment,
                gpsLatitude: loc?.latitude,
                gpsLongitude: loc?.longitude,
            };
            await saveAttempt(toSave);

            const score = activity.id === 'parachute-drop' ? parachuteScore(results) : 0;
            await setActivityProgress(activity.id, {
                status: 'completed',
                bestScore: score,
                bestScoreUnit: 'safety',
                lastAttemptAt: Date.now(),
            });
        }
        discardAttempt();
        setSaving(false);
        router.dismissAll();
    };

    return (
        <>
            <Stack.Screen options={activityHeaderOptions(colors, 'Results')} />
            <Screen scroll>
                {/* Recorded drop video — scrub to read off contact time */}
                {activeAttempt?.videoUri ? (
                    <>
                        <ThemedText variant="titleMedium" style={styles.sectionTitle}>Your recording</ThemedText>
                        <VideoReview uri={activeAttempt.videoUri} />
                    </>
                ) : null}

                {/* Computed results */}
                {results.length > 0 ? (
                    <>
                        <ThemedText variant="titleMedium" style={styles.sectionTitle}>Your results</ThemedText>
                        <View style={styles.resultGrid}>
                            {results.map((r) => (
                                <View key={r.name} style={[styles.resultCard, { backgroundColor: colors.surface }]}>
                                    <ThemedText variant="caption" color="textTertiary">{r.name}</ThemedText>
                                    <ThemedText variant="headlineSmall" style={{ color: accent }}>
                                        {r.value}
                                    </ThemedText>
                                    <ThemedText variant="caption" color="textSecondary">{r.unit}</ThemedText>
                                </View>
                            ))}
                        </View>

                        {/* Hearing-risk classification for the loudest reading */}
                        {soundRisk ? (
                            <View style={[styles.riskBanner, { backgroundColor: soundRisk.color + '1A', borderColor: soundRisk.color }]}>
                                <Ionicons name="ear-outline" size={IconSize.lg} color={soundRisk.color} />
                                <View style={styles.riskText}>
                                    <ThemedText variant="labelLarge" style={{ color: soundRisk.color }}>
                                        {soundRisk.level}
                                    </ThemedText>
                                    <ThemedText variant="caption" color="textSecondary">
                                        {soundRisk.description}
                                    </ThemedText>
                                </View>
                            </View>
                        ) : null}
                    </>
                ) : null}

                {/* Formula reference */}
                {activity.formulas.length > 0 ? (
                    <>
                        <ThemedText variant="titleMedium" style={styles.sectionTitle}>How it&apos;s calculated</ThemedText>
                        {activity.formulas.map((f) => (
                            <View key={f.name} style={[styles.formulaCard, { backgroundColor: colors.surface }]}>
                                <ThemedText variant="labelLarge" style={{ color: accent }}>{f.name}</ThemedText>
                                <ThemedText variant="bodyMedium" style={styles.formula}>{f.formula}</ThemedText>
                                {f.example ? (
                                    <ThemedText variant="caption" color="textTertiary">e.g. {f.example}</ThemedText>
                                ) : null}
                                <ThemedText variant="caption" color="textSecondary">{f.example}</ThemedText>
                            </View>
                        ))}
                    </>
                ) : null}

                {/* Reflection prompts */}
                <ThemedText variant="titleMedium" style={styles.sectionTitle}>Reflection</ThemedText>
                {activity.writeUp.prompts.map((p, i) => (
                    <View key={i} style={styles.bullet}>
                        <Ionicons name="help-circle-outline" size={IconSize.md} color={accent} />
                        <ThemedText variant="bodyMedium" style={styles.bulletText}>{p}</ThemedText>
                    </View>
                ))}

                {/* Rating */}
                <ThemedText variant="titleMedium" style={styles.sectionTitle}>Rate this activity</ThemedText>
                <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <Pressable key={n} onPress={() => setRating(n)} accessibilityLabel={`${n} stars`}>
                            <Ionicons
                                name={n <= rating ? 'star' : 'star-outline'}
                                size={36}
                                color={n <= rating ? colors.secondary : colors.textTertiary}
                                style={styles.star}
                            />
                        </Pressable>
                    ))}
                </View>

                {/* Comment */}
                <TextField
                    label="Team comment"
                    value={comment}
                    onChangeText={setComment}
                    placeholder="What did your team discover?"
                    multiline
                    numberOfLines={3}
                    style={styles.commentBox}
                />

                <Button label="Save & Finish" onPress={handleSave} loading={saving} style={styles.cta} />
            </Screen>
        </>
    );
}

const styles = StyleSheet.create({
    sectionTitle: { marginTop: Spacing.lg, marginBottom: Spacing.md },
    resultGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    resultCard: {
        width: '31%',
        flexGrow: 1,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
    },
    riskBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginTop: Spacing.md,
    },
    riskText: { flex: 1, marginLeft: Spacing.md },
    formulaCard: { padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm },
    formula: { marginVertical: Spacing.xxs, fontFamily: 'monospace' },
    bullet: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
    bulletText: { flex: 1, marginLeft: Spacing.sm },
    stars: { flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.lg },
    star: { marginHorizontal: Spacing.xs },
    commentBox: { height: 90, paddingTop: Spacing.md, textAlignVertical: 'top' },
    cta: { marginTop: Spacing.lg },
});
