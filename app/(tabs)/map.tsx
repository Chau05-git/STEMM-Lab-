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
                // Only records that were GPS-tagged can be placed on the map.
                const tagged = all.filter((a) => a.gpsLatitude != null && a.gpsLongitude != null);
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

    const first = records[0];
    const region = {
        latitude: first.gpsLatitude!,
        longitude: first.gpsLongitude!,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <View style={styles.container}>
            <MapView style={StyleSheet.absoluteFillObject} provider={PROVIDER_DEFAULT} initialRegion={region}>
                {records.map((rec) => {
                    const activity = getActivityById(rec.activityId);
                    const pinColor = activity?.category === 'health' ? colors.health : colors.engineering;
                    return (
                        <Marker
                            key={rec.id}
                            coordinate={{ latitude: rec.gpsLatitude!, longitude: rec.gpsLongitude! }}
                            pinColor={pinColor}
                            title={`${activity?.icon ?? ''} ${activity?.name ?? rec.activityId}`}
                            description={`${rec.teamName ?? 'Team'} · ${formatDate(rec.completedAt ?? rec.startedAt)}`}
                        />
                    );
                })}
            </MapView>

            <View style={[styles.badge, { backgroundColor: colors.surface }]}>
                <Ionicons name="location" size={IconSize.sm} color={colors.primary} />
                <ThemedText variant="labelMedium">
                    {records.length} tagged {records.length === 1 ? 'activity' : 'activities'}
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
