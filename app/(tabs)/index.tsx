import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ActivityGridCard } from '@/components/ActivityGridCard';
import { ThemedText } from '@/components/ThemedText';
import { ENGINEERING_ACTIVITIES, HEALTH_ACTIVITIES } from '@/constants/activities';
import { Colors, Spacing } from '@/constants/theme';
import type { ActivityDefinition, ActivityStatus } from '@/constants/types';
import { useSettings } from '@/context/SettingsContext';
import { useTeam } from '@/context/TeamContext';

export default function HomeScreen() {
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { team, activityProgress } = useTeam();
    const colors = Colors[resolvedTheme];

    const statusOf = (id: string): ActivityStatus =>
        activityProgress[id]?.status ?? 'not_started';

    return (
        <ScrollView
            style={{ backgroundColor: colors.background }}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Greeting */}
            <ThemedText variant="bodyMedium" color="textSecondary">
                Welcome back,
            </ThemedText>
            <ThemedText variant="headlineMedium" style={styles.teamName}>
                {team?.name ?? 'Team'} 🔬
            </ThemedText>

            <Section
                title="Engineering Challenges"
                accent={colors.engineering}
                activities={ENGINEERING_ACTIVITIES}
                statusOf={statusOf}
                onPress={(id) => router.push(`/activity/${id}`)}
            />
            <Section
                title="Health & Medical Sciences"
                accent={colors.health}
                activities={HEALTH_ACTIVITIES}
                statusOf={statusOf}
                onPress={(id) => router.push(`/activity/${id}`)}
            />
        </ScrollView>
    );
}

function Section({
    title,
    accent,
    activities,
    statusOf,
    onPress,
}: {
    title: string;
    accent: string;
    activities: ActivityDefinition[];
    statusOf: (id: string) => ActivityStatus;
    onPress: (id: string) => void;
}) {
    // Group activities into rows of 2 for the grid
    const rows: ActivityDefinition[][] = [];
    for (let i = 0; i < activities.length; i += 2) {
        rows.push(activities.slice(i, i + 2));
    }

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <View style={[styles.accentBar, { backgroundColor: accent }]} />
                <ThemedText variant="titleLarge">{title}</ThemedText>
            </View>

            {rows.map((row, ri) => (
                <View key={ri} style={styles.row}>
                    {row.map((activity) => (
                        <ActivityGridCard
                            key={activity.id}
                            activity={activity}
                            status={statusOf(activity.id)}
                            accentColor={accent}
                            onPress={() => onPress(activity.id)}
                        />
                    ))}
                    {/* keep last odd card half-width */}
                    {row.length === 1 ? <View style={styles.spacer} /> : null}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxxxl,
    },
    teamName: { marginBottom: Spacing.xl },
    section: { marginBottom: Spacing.xl },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    accentBar: {
        width: 4,
        height: 22,
        borderRadius: 2,
        marginRight: Spacing.sm,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    spacer: { flex: 1 },
});
