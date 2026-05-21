import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { getActivityById } from '@/constants/activities';
import { BorderRadius, Colors, IconSize, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

export default function InstructionsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    const activity = getActivityById(id);
    if (!activity) return null;

    const accent = activity.category === 'engineering' ? colors.engineering : colors.health;

    return (
        <>
            <Stack.Screen options={{ headerShown: true, title: 'Instructions', headerStyle: { backgroundColor: colors.background }, headerShadowVisible: false, headerTintColor: colors.text, headerTitleStyle: { fontWeight: '700' } }} />
            <ScrollView
                style={{ backgroundColor: colors.background }}
                contentContainerStyle={styles.content}
            >
                <ThemedText variant="headlineSmall" style={styles.title}>{activity.name}</ThemedText>

                {activity.hasTimer ? (
                    <View style={[styles.timerBanner, { backgroundColor: colors.warningMuted }]}>
                        <Ionicons name="timer-outline" size={IconSize.md} color={colors.warning} />
                        <ThemedText variant="labelMedium" style={[styles.timerText, { color: colors.warning }]}>
                            Time limit: {activity.timerMinutes} minutes
                        </ThemedText>
                    </View>
                ) : null}

                {activity.instructions.map((ins) => (
                    <View key={ins.step} style={[styles.stepRow, { backgroundColor: colors.surface }]}>
                        <View style={[styles.stepNumber, { backgroundColor: accent }]}>
                            <ThemedText variant="labelLarge" color="onPrimary">{ins.step}</ThemedText>
                        </View>
                        <View style={styles.stepBody}>
                            <ThemedText variant="bodyMedium">{ins.text}</ThemedText>
                            {ins.requiresSensor ? (
                                <View style={styles.sensorTag}>
                                    <Ionicons name="hardware-chip" size={12} color={accent} />
                                    <ThemedText variant="caption" style={{ color: accent, marginLeft: 4 }}>
                                        {ins.sensorLabel}
                                    </ThemedText>
                                </View>
                            ) : null}
                        </View>
                    </View>
                ))}

                <Button
                    label="Start Activity"
                    onPress={() => router.push(`/activity/${activity.id}/record`)}
                    style={styles.cta}
                />
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    content: { padding: Spacing.lg, paddingBottom: Spacing.xxxxl },
    title: { marginBottom: Spacing.lg },
    timerBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.lg,
    },
    timerText: { marginLeft: Spacing.sm },
    stepRow: {
        flexDirection: 'row',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    stepBody: { flex: 1, paddingTop: Spacing.xxs },
    sensorTag: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs },
    cta: { marginTop: Spacing.xl },
});
