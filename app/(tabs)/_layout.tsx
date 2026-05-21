import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

export default function TabLayout() {
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];
    const router = useRouter();

    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textTertiary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    height: Platform.select({ ios: 88, android: 72 }),
                    paddingTop: Spacing.sm,
                },
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                headerTitleStyle: { fontWeight: '800', fontSize: 20 },
                headerShadowVisible: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerTitle: 'STEMM Lab',
                    tabBarIcon: ({ size, color }) => <Ionicons name="grid" size={size} color={color} />,
                    headerRight: () => (
                        <Pressable
                            onPress={() => router.push('/settings')}
                            style={styles.headerBtn}
                            accessibilityLabel="Open settings"
                            accessibilityRole="button"
                        >
                            <Ionicons name="settings-outline" size={24} color={colors.text} />
                        </Pressable>
                    ),
                }}
            />
            <Tabs.Screen
                name="leaderboard"
                options={{
                    title: 'Ranks',
                    headerTitle: 'Leaderboard',
                    tabBarIcon: ({ size, color }) => <Ionicons name="trophy" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Map',
                    headerTitle: 'Activity Map',
                    tabBarIcon: ({ size, color }) => <Ionicons name="location" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Team',
                    headerTitle: 'Team Profile',
                    tabBarIcon: ({ size, color }) => <Ionicons name="people" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    headerBtn: { marginRight: Spacing.lg, padding: Spacing.xs },
});
