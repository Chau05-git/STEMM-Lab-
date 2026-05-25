import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ACTIVITIES } from '@/constants/activities';
import { BorderRadius, Colors, IconSize, Spacing } from '@/constants/theme';
import type { ActivityDefinition } from '@/constants/types';
import { useSettings } from '@/context/SettingsContext';
import { useTeam } from '@/context/TeamContext';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { activityProgress } = useTeam();
    const colors = Colors[resolvedTheme];

    // Completed activities, ranked by how recently the best result was set.
    const completed = ACTIVITIES
        .map((a) => ({ activity: a, progress: activityProgress[a.id] }))
        .filter((x) => x.progress?.status === 'completed')
        .sort((a, b) => (b.progress?.lastAttemptAt ?? 0) - (a.progress?.lastAttemptAt ?? 0));

    const notDone = ACTIVITIES.filter((a) => activityProgress[a.id]?.status !== 'completed');

    return (
        <Screen scroll>
            <ThemedText variant="bodyMedium" color="textSecondary" style={styles.intro}>
                Your team&apos;s best result for each challenge. Online cross-team ranking
                arrives when Firebase is connected.
            </ThemedText>

            {completed.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="trophy-outline" size={IconSize.xxl} color={colors.textTertiary} />
                    <ThemedText variant="bodySmall" color="textTertiary" style={styles.emptyText}>
                        No results yet — complete an activity to see your scores here!
                    </ThemedText>
                </View>
            ) : (
                <>
                    <ThemedText variant="labelMedium" color="textTertiary" style={styles.groupLabel}>
                        YOUR RESULTS
                    </ThemedText>
                    {completed.map(({ activity, progress }, i) => (
                        <View
                            key={activity.id}
                            style={[styles.row, { backgroundColor: colors.surface }]}
                        >
                            <View style={styles.rankCol}>
                                {i < 3 ? (
                                    <ThemedText style={styles.medal}>{MEDALS[i]}</ThemedText>
                                ) : (
                                    <ThemedText variant="labelLarge" color="textTertiary">#{i + 1}</ThemedText>
                                )}
                            </View>
                            <ThemedText style={styles.icon}>{activity.icon}</ThemedText>
                            <View style={styles.rowText}>
                                <ThemedText variant="titleSmall" numberOfLines={1}>{activity.name}</ThemedText>
                                <ThemedText variant="caption" color="textTertiary">
                                    {activity.keyMeasurement}
                                </ThemedText>
                            </View>
                            <View style={styles.scoreCol}>
                                <ThemedText variant="titleMedium" style={{ color: colors.primary }}>
                                    {progress?.bestScore ?? 0}
                                </ThemedText>
                                <ThemedText variant="caption" color="textTertiary">
                                    {progress?.bestScoreUnit ?? ''}
                                </ThemedText>
                            </View>
                        </View>
                    ))}
                </>
            )}

            {/* Activities still to attempt */}
            {notDone.length > 0 ? (
                <>
                    <ThemedText variant="labelMedium" color="textTertiary" style={styles.groupLabel}>
                        STILL TO TRY
                    </ThemedText>
                    {notDone.map((activity) => (
                        <ToTryRow key={activity.id} activity={activity} colors={colors} onPress={() => router.push(`/activity/${activity.id}`)} />
                    ))}
                </>
            ) : null}
        </Screen>
    );
}

function ToTryRow({
    activity,
    colors,
    onPress,
}: {
    activity: ActivityDefinition;
    colors: Record<string, string>;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.row,
                { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
            ]}
        >
            <View style={styles.rankCol}>
                <Ionicons name="ellipse-outline" size={IconSize.md} color={colors.textTertiary} />
            </View>
            <ThemedText style={[styles.icon, styles.dim]}>{activity.icon}</ThemedText>
            <View style={styles.rowText}>
                <ThemedText variant="titleSmall" color="textSecondary" numberOfLines={1}>{activity.name}</ThemedText>
                <ThemedText variant="caption" color="textTertiary">Not attempted yet</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={IconSize.md} color={colors.textTertiary} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    intro: { marginBottom: Spacing.lg },
    groupLabel: { marginTop: Spacing.md, marginBottom: Spacing.sm, marginLeft: Spacing.xs, letterSpacing: 1 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
    },
    rankCol: { width: 32, alignItems: 'center' },
    medal: { fontSize: 22, lineHeight: 28, includeFontPadding: false },
    icon: { fontSize: 28, lineHeight: 36, marginHorizontal: Spacing.sm, includeFontPadding: false },
    dim: { opacity: 0.5 },
    rowText: { flex: 1 },
    scoreCol: { alignItems: 'flex-end', minWidth: 64 },
    emptyState: { alignItems: 'center', marginTop: Spacing.xxxl },
    emptyText: { marginTop: Spacing.md, textAlign: 'center', maxWidth: 260 },
});
