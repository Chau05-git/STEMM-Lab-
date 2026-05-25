import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { activityHeaderOptions } from '@/constants/screenOptions';
import { getActivityById } from '@/constants/activities';
import { Colors, IconSize, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import { saveAttempt } from '@/services/database';
import { decodeAttempt } from '@/services/qr';

export default function ScanScreen() {
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    const [permission, requestPermission] = useCameraPermissions();
    const [busy, setBusy] = useState(false);
    const handledRef = useRef(false);

    const onScanned = async ({ data }: { data: string }) => {
        if (handledRef.current || busy) return;

        const attempt = decodeAttempt(data);
        if (!attempt) {
            // Not one of our record QRs — ignore and keep scanning.
            return;
        }
        handledRef.current = true;
        setBusy(true);

        try {
            await saveAttempt(attempt);
            const activity = getActivityById(attempt.activityId);
            Alert.alert(
                'Record imported',
                `${activity?.name ?? attempt.activityId} from ${attempt.teamName ?? 'another team'} was added to your records.`,
                [{ text: 'OK', onPress: () => router.back() }],
            );
        } catch {
            Alert.alert('Import failed', 'Could not save that record. Please try again.', [
                { text: 'OK', onPress: () => { handledRef.current = false; setBusy(false); } },
            ]);
        }
    };

    // ── Permission states ──
    if (!permission) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Stack.Screen options={activityHeaderOptions(colors, 'Scan record')} />
                <ThemedText variant="bodyMedium" color="textSecondary">Checking camera…</ThemedText>
            </View>
        );
    }
    if (!permission.granted) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Stack.Screen options={activityHeaderOptions(colors, 'Scan record')} />
                <Ionicons name="camera-outline" size={IconSize.xxl} color={colors.textTertiary} />
                <ThemedText variant="bodyMedium" color="textSecondary" style={styles.permText}>
                    Camera permission is needed to scan a record QR code.
                </ThemedText>
                <Button label="Grant camera permission" onPress={requestPermission} style={styles.permBtn} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ ...activityHeaderOptions(colors, 'Scan record'), headerShown: true }} />
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={onScanned}
            />
            {/* Alignment frame */}
            <View style={styles.overlay}>
                <View style={[styles.frame, { borderColor: colors.primary }]} />
                <ThemedText variant="bodyMedium" style={styles.hint}>
                    {busy ? 'Importing…' : 'Point at another device’s record QR'}
                </ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
    permText: { textAlign: 'center', marginTop: Spacing.lg, maxWidth: 280 },
    permBtn: { marginTop: Spacing.xl },
    overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
    frame: {
        width: 240,
        height: 240,
        borderWidth: 3,
        borderRadius: 24,
    },
    hint: {
        color: '#FFFFFF',
        marginTop: Spacing.xl,
        textShadowColor: '#000000',
        textShadowRadius: 6,
    },
});
