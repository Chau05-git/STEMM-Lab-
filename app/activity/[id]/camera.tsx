import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Colors, IconSize, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

/**
 * Full-screen camera modal. The real expo-camera / video recording is wired
 * up in Phase 3. For now it is a dark placeholder with a close control so the
 * navigation flow is testable.
 */
export default function CameraScreen() {
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    return (
        <View style={styles.container}>
            <Pressable
                onPress={() => router.back()}
                style={styles.closeBtn}
                accessibilityLabel="Close camera"
                accessibilityRole="button"
            >
                <Ionicons name="close" size={IconSize.xl} color="#FFFFFF" />
            </Pressable>

            <View style={styles.center}>
                <Ionicons name="videocam-outline" size={IconSize.xxl} color="#FFFFFF" />
                <ThemedText variant="bodyMedium" style={styles.text}>
                    Camera preview (slow-motion recording) coming in Phase 3.
                </ThemedText>
            </View>

            <View style={styles.controls}>
                <View style={[styles.recordOuter, { borderColor: '#FFFFFF' }]}>
                    <Pressable
                        style={[styles.recordInner, { backgroundColor: colors.error }]}
                        onPress={() => router.back()}
                        accessibilityLabel="Record"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    closeBtn: { position: 'absolute', top: 52, left: Spacing.lg, zIndex: 10, padding: Spacing.sm },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
    text: { color: '#FFFFFF', textAlign: 'center', marginTop: Spacing.lg, maxWidth: 260 },
    controls: { alignItems: 'center', paddingBottom: Spacing.xxxl },
    recordOuter: {
        width: 76,
        height: 76,
        borderRadius: 38,
        borderWidth: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordInner: { width: 58, height: 58, borderRadius: 29 },
});
