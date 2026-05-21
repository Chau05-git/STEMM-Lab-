import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { getActivityById } from '@/constants/activities';
import { BorderRadius, Colors, IconSize, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

const SENSOR_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
    camera: 'videocam',
    accelerometer: 'pulse',
    gyroscope: 'sync',
    microphone: 'mic',
    touchscreen: 'finger-print',
    timer: 'timer',
};

export default function RecordScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    const activity = getActivityById(id);
    if (!activity) return null;

    const accent = activity.category === 'engineering' ? colors.engineering : colors.health;
    const icon = SENSOR_ICON[activity.sensorType] ?? 'hardware-chip';

    return (
        <>
            <Stack.Screen options={{ headerShown: true, title: 'Record', headerStyle: { backgroundColor: colors.background }, headerShadowVisible: false, headerTintColor: colors.text, headerTitleStyle: { fontWeight: '700' } }} />
            <ScrollView
                style={{ backgroundColor: colors.background }}
                contentContainerStyle={styles.content}
            >
                {/* Live sensor panel placeholder (real readout in Phase 3) */}
                <View style={[styles.sensorPanel, { backgroundColor: colors.surface, borderColor: accent }]}>
                    <View style={[styles.sensorIcon, { backgroundColor: accent + '1A' }]}>
                        <Ionicons name={icon} size={IconSize.xxl} color={accent} />
                    </View>
                    <ThemedText variant="displayMedium" style={styles.reading}>--</ThemedText>
                    <ThemedText variant="bodySmall" color="textTertiary">{activity.keyMeasurement}</ThemedText>
                </View>

                <ThemedText variant="bodySmall" color="textSecondary" style={styles.hint}>
                    Tap below to activate the {activity.sensorLabel.toLowerCase()}.
                </ThemedText>

                <Button
                    label={`Activate ${activity.sensorType === 'camera' ? 'Camera' : 'Sensor'}`}
                    variant="secondary"
                    onPress={() => {
                        if (activity.sensorType === 'camera') {
                            router.push(`/activity/${activity.id}/camera`);
                        }
                        // other sensors handled in Phase 3
                    }}
                    style={styles.activateBtn}
                />

                <Button
                    label="View Results"
                    onPress={() => router.push(`/activity/${activity.id}/results`)}
                    style={styles.finishBtn}
                />
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    content: { padding: Spacing.lg, paddingBottom: Spacing.xxxxl },
    sensorPanel: {
        borderRadius: BorderRadius.xxl,
        borderWidth: 2,
        alignItems: 'center',
        paddingVertical: Spacing.xxxl,
        marginBottom: Spacing.lg,
    },
    sensorIcon: {
        width: 96,
        height: 96,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    reading: { marginBottom: Spacing.xxs },
    hint: { textAlign: 'center', marginBottom: Spacing.lg },
    activateBtn: { marginBottom: Spacing.sm },
    finishBtn: {},
});
