import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { BreathingRecorder } from '@/components/sensors/BreathingRecorder';
import { EarthquakeRecorder } from '@/components/sensors/EarthquakeRecorder';
import { HandFanRecorder } from '@/components/sensors/HandFanRecorder';
import { HumanPerformanceRecorder } from '@/components/sensors/HumanPerformanceRecorder';
import { ParachuteRecorder } from '@/components/sensors/ParachuteRecorder';
import { ReactionRecorder } from '@/components/sensors/ReactionRecorder';
import { SoundRecorder } from '@/components/sensors/SoundRecorder';
import { getActivityById } from '@/constants/activities';
import { activityHeaderOptions } from '@/constants/screenOptions';
import { BorderRadius, Colors, IconSize, Spacing } from '@/constants/theme';
import { useActivity } from '@/context/ActivityContext';
import { useSettings } from '@/context/SettingsContext';
import { useTeam } from '@/context/TeamContext';
import { useBattery } from '@/hooks/useBattery';
import { notifyLowBattery } from '@/services/notifications';

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
    const { team } = useTeam();
    const { activeAttempt, startAttempt } = useActivity();
    const battery = useBattery();
    const colors = Colors[resolvedTheme];

    const activity = getActivityById(id);

    // Begin a fresh attempt when this screen opens (if none in progress).
    useEffect(() => {
        if (activity && team && !activeAttempt) {
            startAttempt(activity.id, team.id);
        }
    }, [activity, team, activeAttempt, startAttempt]);

    // Warn once if the battery is low before a sensor-heavy recording.
    useEffect(() => {
        if (battery.isLoaded && battery.level !== null && battery.level < 0.2 && !battery.isCharging) {
            void notifyLowBattery(battery.level);
        }
    }, [battery.isLoaded, battery.level, battery.isCharging]);

    if (!activity) return null;

    const accent = activity.category === 'engineering' ? colors.engineering : colors.health;
    const icon = SENSOR_ICON[activity.sensorType] ?? 'hardware-chip';

    return (
        <>
            <Stack.Screen options={activityHeaderOptions(colors, 'Record')} />
            <Screen scroll>
                {activity.id === 'parachute-drop' ? (
                    <ParachuteRecorder activity={activity} accent={accent} />
                ) : activity.id === 'sound-pollution' ? (
                    <SoundRecorder activity={activity} accent={accent} />
                ) : activity.id === 'hand-fan' ? (
                    <HandFanRecorder activity={activity} accent={accent} />
                ) : activity.id === 'earthquake-structure' ? (
                    <EarthquakeRecorder activity={activity} accent={accent} />
                ) : activity.id === 'human-performance' ? (
                    <HumanPerformanceRecorder activity={activity} accent={accent} />
                ) : activity.id === 'reaction-board' ? (
                    <ReactionRecorder activity={activity} accent={accent} />
                ) : activity.id === 'breathing-pace' ? (
                    <BreathingRecorder activity={activity} accent={accent} />
                ) : (
                    /* Other activities get their recorders in later phases */
                    <View>
                        <View style={[styles.sensorPanel, { backgroundColor: colors.surface, borderColor: accent }]}>
                            <View style={[styles.sensorIcon, { backgroundColor: accent + '1A' }]}>
                                <Ionicons name={icon} size={IconSize.xxl} color={accent} />
                            </View>
                            <ThemedText variant="displayMedium" style={styles.reading}>--</ThemedText>
                            <ThemedText variant="bodySmall" color="textTertiary">{activity.keyMeasurement}</ThemedText>
                        </View>
                        <ThemedText variant="bodySmall" color="textSecondary" style={styles.hint}>
                            Sensor for this activity is coming in a later phase.
                        </ThemedText>
                        <Button
                            label="View Results"
                            onPress={() => router.push(`/activity/${activity.id}/results`)}
                        />
                    </View>
                )}
            </Screen>
        </>
    );
}

const styles = StyleSheet.create({
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
});
