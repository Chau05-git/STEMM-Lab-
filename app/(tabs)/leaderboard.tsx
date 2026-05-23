import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ACTIVITIES } from '@/constants/activities';
import { BorderRadius, Colors, IconSize, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

export default function LeaderboardScreen() {
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    return (
        <Screen scroll>
            <ThemedText variant="bodyMedium" color="textSecondary" style={styles.intro}>
                See how your team ranks against others for each challenge.
            </ThemedText>

            {ACTIVITIES.map((activity) => (
                <View
                    key={activity.id}
                    style={[styles.row, { backgroundColor: colors.surface }]}
                >
                    <ThemedText style={styles.icon}>{activity.icon}</ThemedText>
                    <View style={styles.rowText}>
                        <ThemedText variant="titleSmall" numberOfLines={1}>{activity.name}</ThemedText>
                        <ThemedText variant="caption" color="textTertiary">
                            {activity.keyMeasurement}
                        </ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={IconSize.md} color={colors.textTertiary} />
                </View>
            ))}

            {/* Empty-state hint (live data comes with Firebase, Phase 4) */}
            <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={IconSize.xxl} color={colors.textTertiary} />
                <ThemedText variant="bodySmall" color="textTertiary" style={styles.emptyText}>
                    Complete activities to climb the ranks!
                </ThemedText>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    intro: { marginBottom: Spacing.lg },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
    },
    icon: { fontSize: 28, marginRight: Spacing.md },
    rowText: { flex: 1 },
    emptyState: { alignItems: 'center', marginTop: Spacing.xxxl },
    emptyText: { marginTop: Spacing.md, textAlign: 'center' },
});
