import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import { ThemedText } from '@/components/ThemedText';
import { activityHeaderOptions } from '@/constants/screenOptions';
import { Colors } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

/** Single-pin map for one record's location, opened from the record detail. */
export default function LocationScreen() {
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];
    const { lat, lon, title, subtitle } = useLocalSearchParams<{
        lat: string; lon: string; title?: string; subtitle?: string;
    }>();

    const latitude = parseFloat(lat ?? '');
    const longitude = parseFloat(lon ?? '');

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return (
            <>
                <Stack.Screen options={activityHeaderOptions(colors, 'Location')} />
                <View style={[styles.center, { backgroundColor: colors.background }]}>
                    <ThemedText variant="titleMedium">No location for this record</ThemedText>
                </View>
            </>
        );
    }

    return (
        <>
            <Stack.Screen options={activityHeaderOptions(colors, 'Location')} />
            <MapView
                style={StyleSheet.absoluteFillObject}
                provider={PROVIDER_DEFAULT}
                initialRegion={{ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
            >
                <Marker
                    coordinate={{ latitude, longitude }}
                    pinColor={colors.primary}
                    title={title ?? 'Recorded here'}
                    description={subtitle}
                />
            </MapView>
        </>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
