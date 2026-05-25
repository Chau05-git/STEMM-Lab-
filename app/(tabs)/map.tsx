import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import { ThemedText } from '@/components/ThemedText';
import { getActivityById } from '@/constants/activities';
import { BorderRadius, Colors, IconSize, Spacing } from '@/constants/theme';
import type { ActivityAttempt } from '@/constants/types';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { getAllAttempts } from '@/services/database';
import { getAttemptsCloud } from '@/services/firestore';

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export default function MapScreen() {
    const { resolvedTheme } = useSettings();
    const { user, isCloud } = useAuth();
    const colors = Colors[resolvedTheme];
    const [records, setRecords] = useState<ActivityAttempt[]>([]);

    useFocusEffect(
        useCallback(() => {
            let active = true;
            (async () => {
                const all = isCloud && user ? await getAttemptsCloud(user.uid) : await getAllAttempts();
                // Only GPS-tagged records can be placed on the map; newest first.
                const tagged = all
                    .filter((a) => a.gpsLatitude != null && a.gpsLongitude != null)
                    .sort((a, b) => (b.completedAt ?? b.startedAt) - (a.completedAt ?? a.startedAt));
                if (active) setRecords(tagged);
            })();
            return () => { active = false; };
        }, [isCloud, user]),
    );

    if (records.length === 0) {
        return (
            <View style={[styles.container, styles.padded, { backgroundColor: colors.background }]}>
                <View style={[styles.placeholder, { backgroundColor: colors.surfaceVariant }]}>
                    <Ionicons name="map-outline" size={IconSize.xxl} color={colors.primary} />
                    <ThemedText variant="titleMedium" style={styles.title}>No tagged activities yet</ThemedText>
                    <ThemedText variant="bodySmall" color="textSecondary" style={styles.text}>
                        Complete an activity with location enabled and it will appear here,
                        pinned to where your team recorded it.
                    </ThemedText>
                </View>
            </View>
        );
    }

    // Show ONLY the most recently completed challenge — a single pin, single
    // tag. (Per-record locations are viewed from the record detail screen.)
    const latest = records[0];
    const activity = getActivityById(latest.activityId);
    const pinColor = activity?.category === 'health' ? colors.health : colors.engineering;
    const region = {
        latitude: latest.gpsLatitude!,
        longitude: latest.gpsLongitude!,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };

    // Remount (re-centre) when the latest record changes.
    return (
        <View style={styles.container}>
            <MapView
                key={latest.id}
                style={StyleSheet.absoluteFillObject}
                provider={PROVIDER_DEFAULT}
                initialRegion={region}
            >
                <Marker
                    coordinate={{ latitude: latest.gpsLatitude!, longitude: latest.gpsLongitude! }}
                    pinColor={pinColor}
                    title={`${activity?.icon ?? ''} ${activity?.name ?? latest.activityId}`}
                    description={`${latest.teamName ?? 'Team'} · ${formatDate(latest.completedAt ?? latest.startedAt)}`}
                />
            </MapView>

            <View style={[styles.badge, { backgroundColor: colors.surface }]}>
                <Ionicons name="location" size={IconSize.sm} color={colors.primary} />
                <ThemedText variant="labelMedium">
                    Latest: {activity?.name ?? latest.activityId}
                </ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    padded: { padding: Spacing.lg },
    placeholder: {
        flex: 1,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    title: { marginTop: Spacing.lg, marginBottom: Spacing.sm },
    text: { textAlign: 'center', maxWidth: 280 },
    badge: {
        position: 'absolute',
        top: Spacing.lg,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
    },
});
