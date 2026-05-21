import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Colors, IconSize, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

/**
 * Activity map. The real react-native-maps view + GPS-tagged attempt pins
 * are wired up in Phase 3/4. For now this is a styled placeholder so the
 * navigation and layout are complete.
 */
export default function MapScreen() {
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.placeholder, { backgroundColor: colors.surfaceVariant }]}>
                <Ionicons name="map-outline" size={IconSize.xxl} color={colors.primary} />
                <ThemedText variant="titleMedium" style={styles.title}>Activity Map</ThemedText>
                <ThemedText variant="bodySmall" color="textSecondary" style={styles.text}>
                    Your completed activities will appear here, tagged with the
                    location where your team recorded them.
                </ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: Spacing.lg },
    placeholder: {
        flex: 1,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    title: { marginTop: Spacing.lg, marginBottom: Spacing.sm },
    text: { textAlign: 'center', maxWidth: 280 },
});
