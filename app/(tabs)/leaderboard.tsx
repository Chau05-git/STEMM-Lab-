import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { getActivityById } from '@/constants/activities';
import { BorderRadius, Colors, IconSize, Spacing } from '@/constants/theme';
import type { ActivityAttempt } from '@/constants/types';
import { useSettings } from '@/context/SettingsContext';
import { getAllAttempts } from '@/services/database';

function formatDate(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) +
        ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function RecordsScreen() {
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];
    const [records, setRecords] = useState<ActivityAttempt[]>([]);

    // Reload whenever the tab regains focus (after saving / importing).
    useFocusEffect(
        useCallback(() => {
            let active = true;
            getAllAttempts().then((r) => { if (active) setRecords(r); });
            return () => { active = false; };
        }, []),
    );

    return (
        <Screen scroll>
            <ThemedText variant="bodyMedium" color="textSecondary" style={styles.intro}>
                Every challenge record saved on this device. Tap one to view its data and QR code,
                or scan another team&apos;s QR to import their record.
            </ThemedText>

            <Button
                label="Scan a record QR"
                variant="outline"
                onPress={() => router.push('/scan' as Href)}
                style={styles.scanBtn}
            />

            {records.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="albums-outline" size={IconSize.xxl} color={colors.textTertiary} />
                    <ThemedText variant="bodySmall" color="textTertiary" style={styles.emptyText}>
                        No records yet — complete a challenge or scan one in.
                    </ThemedText>
                </View>
            ) : (
                records.map((rec) => {
                    const activity = getActivityById(rec.activityId);
                    return (
                        <Pressable
                            key={rec.id}
                            onPress={() => router.push(`/record/${rec.id}` as Href)}
                            style={({ pressed }) => [
                                styles.row,
                                { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
                            ]}
                        >
                            <ThemedText style={styles.icon}>{activity?.icon ?? '🔬'}</ThemedText>
                            <View style={styles.rowText}>
                                <ThemedText variant="titleSmall" numberOfLines={1}>
                                    {activity?.name ?? rec.activityId}
                                </ThemedText>
                                <ThemedText variant="caption" color="textTertiary" numberOfLines={1}>
                                    {rec.teamName ?? 'Team'} · {formatDate(rec.completedAt ?? rec.startedAt)}
                                </ThemedText>
                            </View>
                            <Ionicons name="qr-code-outline" size={IconSize.md} color={colors.primary} />
                        </Pressable>
                    );
                })
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    intro: { marginBottom: Spacing.md },
    scanBtn: { marginBottom: Spacing.lg },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
    },
    icon: { fontSize: 28, lineHeight: 36, marginRight: Spacing.md, includeFontPadding: false },
    rowText: { flex: 1 },
    emptyState: { alignItems: 'center', marginTop: Spacing.xxxl },
    emptyText: { marginTop: Spacing.md, textAlign: 'center', maxWidth: 260 },
});
