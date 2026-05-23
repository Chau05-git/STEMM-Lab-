import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Colors, IconSize, Spacing } from '@/constants/theme';
import type { ColorScheme } from '@/constants/types';
import { useSettings } from '@/context/SettingsContext';

const THEME_OPTIONS: { value: ColorScheme; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
    { value: 'light', label: 'Light', icon: 'sunny-outline' },
    { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function SettingsScreen() {
    const router = useRouter();
    const { settings, resolvedTheme, setTheme, updateSettings } = useSettings();
    const colors = Colors[resolvedTheme];

    return (
        <Screen scroll>
            {/* Appearance */}
            <ThemedText variant="labelMedium" color="textTertiary" style={styles.groupLabel}>
                APPEARANCE
            </ThemedText>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <ThemedText variant="bodyMedium" color="textSecondary" style={styles.themeHint}>
                    Theme
                </ThemedText>
                <View style={styles.themeRow}>
                    {THEME_OPTIONS.map((opt) => {
                        const active = settings.theme === opt.value;
                        return (
                            <View
                                key={opt.value}
                                style={[
                                    styles.themeOption,
                                    {
                                        backgroundColor: active ? colors.primary : colors.surfaceVariant,
                                    },
                                ]}
                                onTouchEnd={() => setTheme(opt.value)}
                            >
                                <Ionicons
                                    name={opt.icon}
                                    size={IconSize.lg}
                                    color={active ? colors.onPrimary : colors.textSecondary}
                                />
                                <ThemedText
                                    variant="labelSmall"
                                    style={{ color: active ? colors.onPrimary : colors.textSecondary, marginTop: 4 }}
                                >
                                    {opt.label}
                                </ThemedText>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Preferences */}
            <ThemedText variant="labelMedium" color="textTertiary" style={styles.groupLabel}>
                PREFERENCES
            </ThemedText>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <ToggleRow
                    label="Notifications"
                    value={settings.notificationsEnabled}
                    onChange={(v) => updateSettings({ notificationsEnabled: v })}
                    colors={colors}
                />
                <ToggleRow
                    label="Sound"
                    value={settings.soundEnabled}
                    onChange={(v) => updateSettings({ soundEnabled: v })}
                    colors={colors}
                />
                <ToggleRow
                    label="Haptics"
                    value={settings.hapticsEnabled}
                    onChange={(v) => updateSettings({ hapticsEnabled: v })}
                    colors={colors}
                    last
                />
            </View>

            {/* About */}
            <ThemedText variant="labelMedium" color="textTertiary" style={styles.groupLabel}>
                ABOUT
            </ThemedText>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={styles.linkRow} onTouchEnd={() => router.push('/help')}>
                    <Ionicons name="help-buoy-outline" size={IconSize.md} color={colors.primary} />
                    <ThemedText variant="bodyMedium" style={styles.linkText}>Help & Curriculum</ThemedText>
                    <Ionicons name="chevron-forward" size={IconSize.md} color={colors.textTertiary} />
                </View>
            </View>

            <ThemedText variant="caption" color="textTertiary" style={styles.version}>
                STEMM Lab v1.0.0
            </ThemedText>
        </Screen>
    );
}

function ToggleRow({
    label,
    value,
    onChange,
    colors,
    last,
}: {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
    colors: Record<string, string>;
    last?: boolean;
}) {
    return (
        <View
            style={[
                styles.toggleRow,
                !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
        >
            <ThemedText variant="bodyMedium">{label}</ThemedText>
            <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ true: colors.primary, false: colors.borderStrong }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    groupLabel: { marginTop: Spacing.lg, marginBottom: Spacing.sm, marginLeft: Spacing.xs, letterSpacing: 1 },
    card: { borderRadius: BorderRadius.lg, padding: Spacing.md },
    themeHint: { marginBottom: Spacing.sm },
    themeRow: { flexDirection: 'row', gap: Spacing.sm },
    themeOption: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
    },
    linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
    linkText: { flex: 1, marginLeft: Spacing.md },
    version: { textAlign: 'center', marginTop: Spacing.xl },
});
