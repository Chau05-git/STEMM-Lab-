import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { getActivityById } from '@/constants/activities';
import { activityHeaderOptions } from '@/constants/screenOptions';
import { BorderRadius, Colors, IconSize, Spacing } from '@/constants/theme';
import type { ActivityAttempt } from '@/constants/types';
import { useSettings } from '@/context/SettingsContext';
import { getAttemptById } from '@/services/database';
import { encodeAttempt } from '@/services/qr';

export default function RecordDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    const [attempt, setAttempt] = useState<ActivityAttempt | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAttemptById(id).then((a) => {
            setAttempt(a);
            setLoading(false);
        });
    }, [id]);

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    }
    if (!attempt) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ThemedText variant="titleMedium">Record not found</ThemedText>
            </View>
        );
    }

    const activity = getActivityById(attempt.activityId);
    const accent = activity?.category === 'health' ? colors.health : colors.engineering;
    const payload = encodeAttempt(attempt);

    return (
        <>
            <Stack.Screen options={activityHeaderOptions(colors, 'Record')} />
            <Screen scroll>
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText style={styles.icon}>{activity?.icon ?? '🔬'}</ThemedText>
                    <View style={styles.headerText}>
                        <ThemedText variant="titleLarge" numberOfLines={2}>{activity?.name ?? attempt.activityId}</ThemedText>
                        <ThemedText variant="caption" color="textTertiary">
                            {attempt.teamName ?? 'Team'} · {new Date(attempt.completedAt ?? attempt.startedAt).toLocaleString()}
                        </ThemedText>
                    </View>
                </View>

                {/* QR code */}
                <View style={[styles.qrCard, { backgroundColor: '#FFFFFF' }]}>
                    <QRCode value={payload} size={220} backgroundColor="#FFFFFF" color="#0F172A" />
                </View>
                <ThemedText variant="bodySmall" color="textSecondary" style={styles.qrHint}>
                    Scan this with another device&apos;s “Scan a record QR” to copy this result across.
                </ThemedText>

                {/* Data */}
                <ThemedText variant="titleMedium" style={styles.sectionTitle}>Recorded data</ThemedText>
                {attempt.sensorReadings.length === 0 ? (
                    <ThemedText variant="bodySmall" color="textTertiary">No sensor readings.</ThemedText>
                ) : (
                    <View style={[styles.dataCard, { backgroundColor: colors.surface }]}>
                        {attempt.sensorReadings.map((r) => (
                            <View key={r.id} style={styles.dataRow}>
                                <ThemedText variant="bodyMedium" style={styles.dataLabel} numberOfLines={1}>
                                    {r.label ?? r.sensorType}
                                </ThemedText>
                                <ThemedText variant="labelLarge" style={{ color: accent }}>
                                    {r.value} {r.unit}
                                </ThemedText>
                            </View>
                        ))}
                    </View>
                )}

                {/* Meta */}
                <View style={[styles.dataCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.dataRow}>
                        <ThemedText variant="bodyMedium" style={styles.dataLabel}>Rating</ThemedText>
                        <ThemedText variant="labelLarge">{'★'.repeat(attempt.rating)}{'☆'.repeat(5 - attempt.rating)}</ThemedText>
                    </View>
                    {attempt.gpsLatitude != null ? (
                        <View style={styles.dataRow}>
                            <Ionicons name="location" size={IconSize.sm} color={colors.textTertiary} />
                            <ThemedText variant="caption" color="textTertiary" style={styles.gps}>
                                {attempt.gpsLatitude.toFixed(4)}, {attempt.gpsLongitude?.toFixed(4)}
                            </ThemedText>
                        </View>
                    ) : null}
                    {attempt.comment ? (
                        <ThemedText variant="bodySmall" color="textSecondary" style={styles.comment}>
                            “{attempt.comment}”
                        </ThemedText>
                    ) : null}
                </View>

                <Button
                    label="Copy record data"
                    variant="ghost"
                    onPress={() => Clipboard.setStringAsync(payload)}
                    style={styles.copyBtn}
                />
            </Screen>
        </>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
    icon: { fontSize: 40, lineHeight: 52, marginRight: Spacing.md, includeFontPadding: false },
    headerText: { flex: 1 },
    qrCard: {
        alignSelf: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.md,
    },
    qrHint: { textAlign: 'center', marginBottom: Spacing.lg },
    sectionTitle: { marginTop: Spacing.sm, marginBottom: Spacing.md },
    dataCard: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md },
    dataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.xs,
        gap: Spacing.sm,
    },
    dataLabel: { flex: 1 },
    gps: { flex: 1 },
    comment: { marginTop: Spacing.sm, fontStyle: 'italic' },
    copyBtn: { marginTop: Spacing.sm },
});
