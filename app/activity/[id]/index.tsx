import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { getActivityById } from '@/constants/activities';
import { activityHeaderOptions } from '@/constants/screenOptions';
import { BorderRadius, Colors, IconSize, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

export default function ActivityOverviewScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    const activity = getActivityById(id);

    if (!activity) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ThemedText variant="titleMedium">Activity not found</ThemedText>
            </View>
        );
    }

    const accent = activity.category === 'engineering' ? colors.engineering : colors.health;

    return (
        <>
            <Stack.Screen options={activityHeaderOptions(colors, '')} />
            <Screen scroll>
                {/* Hero */}
                <View style={[styles.hero, { backgroundColor: accent + '1A' }]}>
                    <ThemedText style={styles.icon}>{activity.icon}</ThemedText>
                </View>

                <ThemedText variant="caption" style={[styles.category, { color: accent }]}>
                    {activity.categoryLabel.toUpperCase()}
                </ThemedText>
                <ThemedText variant="headlineMedium" style={styles.title}>{activity.name}</ThemedText>
                <ThemedText variant="bodyMedium" color="textSecondary" style={styles.overview}>
                    {activity.overview}
                </ThemedText>

                {/* Key measurement chip */}
                <View style={[styles.chip, { backgroundColor: colors.surface }]}>
                    <Ionicons name="analytics-outline" size={IconSize.md} color={accent} />
                    <View style={styles.chipText}>
                        <ThemedText variant="caption" color="textTertiary">You will measure</ThemedText>
                        <ThemedText variant="labelLarge">{activity.keyMeasurement}</ThemedText>
                    </View>
                </View>
                <View style={[styles.chip, { backgroundColor: colors.surface }]}>
                    <Ionicons name="hardware-chip-outline" size={IconSize.md} color={accent} />
                    <View style={styles.chipText}>
                        <ThemedText variant="caption" color="textTertiary">Sensor used</ThemedText>
                        <ThemedText variant="labelLarge">{activity.sensorLabel}</ThemedText>
                    </View>
                </View>

                {/* Equipment */}
                <ThemedText variant="titleMedium" style={styles.sectionTitle}>Equipment</ThemedText>
                {activity.equipment.map((item, i) => (
                    <View key={`${item}-${i}`} style={styles.bullet}>
                        <Ionicons name="ellipse" size={6} color={accent} style={styles.bulletDot} />
                        <ThemedText variant="bodyMedium" style={styles.bulletText}>{item}</ThemedText>
                    </View>
                ))}

                <Button
                    label="View Instructions"
                    onPress={() => router.push(`/activity/${activity.id}/instructions`)}
                    style={styles.cta}
                />
            </Screen>
        </>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    hero: {
        height: 140,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    icon: { fontSize: 72, lineHeight: 92, textAlign: 'center', includeFontPadding: false },
    category: { letterSpacing: 1, marginBottom: Spacing.xs },
    title: { marginBottom: Spacing.sm },
    overview: { marginBottom: Spacing.lg },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
    },
    chipText: { marginLeft: Spacing.md, flex: 1 },
    sectionTitle: { marginTop: Spacing.lg, marginBottom: Spacing.md },
    bullet: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
    bulletDot: { marginRight: Spacing.sm },
    bulletText: { flex: 1 },
    cta: { marginTop: Spacing.xl },
});
