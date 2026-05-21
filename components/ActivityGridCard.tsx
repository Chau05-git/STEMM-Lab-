import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import type { ActivityDefinition, ActivityStatus } from '@/constants/types';
import { useSettings } from '@/context/SettingsContext';

interface Props {
    activity: ActivityDefinition;
    status: ActivityStatus;
    accentColor: string;
    onPress: () => void;
}

const STATUS_LABEL: Record<ActivityStatus, string> = {
    not_started: 'Not started',
    in_progress: 'In progress',
    completed: 'Completed',
};

/**
 * Square grid tile — gradient-style header band with big emoji, title and a
 * status dot. Distinct from the reference repo's left-border list cards.
 */
export function ActivityGridCard({ activity, status, accentColor, onPress }: Props) {
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    const statusColor = {
        not_started: colors.statusNotStarted,
        in_progress: colors.statusInProgress,
        completed: colors.statusCompleted,
    }[status];

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${activity.name}. ${STATUS_LABEL[status]}.`}
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.surface, transform: [{ scale: pressed ? 0.97 : 1 }] },
                Shadows.sm,
            ]}
        >
            {/* Coloured header band with icon */}
            <View style={[styles.iconBand, { backgroundColor: accentColor + '1A' }]}>
                <ThemedText style={styles.icon}>{activity.icon}</ThemedText>
            </View>

            <View style={styles.body}>
                <ThemedText variant="titleSmall" numberOfLines={2} style={styles.title}>
                    {activity.name}
                </ThemedText>
                <ThemedText variant="caption" color="textTertiary" numberOfLines={1}>
                    {activity.categoryLabel}
                </ThemedText>

                <View style={styles.footer}>
                    <View style={[styles.dot, { backgroundColor: statusColor }]} />
                    <ThemedText variant="labelSmall" style={{ color: statusColor }}>
                        {STATUS_LABEL[status]}
                    </ThemedText>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
    },
    iconBand: {
        height: 76,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: { fontSize: 40 },
    body: { padding: Spacing.md },
    title: { marginBottom: Spacing.xxs, minHeight: 40 },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    dot: { width: 7, height: 7, borderRadius: 4, marginRight: Spacing.xs },
});

export default ActivityGridCard;
