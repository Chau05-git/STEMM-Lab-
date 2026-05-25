import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { AuthProvider } from '@/context/AuthContext';
import { ActivityProvider } from '@/context/ActivityContext';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { TeamProvider } from '@/context/TeamContext';
import { registerBackgroundSync, syncPendingAttempts } from '@/services/backgroundTask';
import { registerForNotifications } from '@/services/notifications';

function RootStack() {
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    useEffect(() => {
        // One-time setup: notifications, background sync task, and an
        // immediate push of anything saved while offline.
        registerForNotifications().catch(console.warn);
        registerBackgroundSync().catch(console.warn);
        syncPendingAttempts().catch(console.warn);
    }, []);

    return (
        <>
            <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    contentStyle: { backgroundColor: colors.background },
                    headerStyle: { backgroundColor: colors.surface },
                    headerTintColor: colors.text,
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="login" options={{ gestureEnabled: false }} />
                <Stack.Screen name="signup" />
                <Stack.Screen name="register" options={{ gestureEnabled: false }} />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                    name="settings"
                    options={{ headerShown: true, title: 'Settings', presentation: 'modal' }}
                />
                <Stack.Screen
                    name="help"
                    options={{ headerShown: true, title: 'Help & Curriculum', presentation: 'modal' }}
                />
                <Stack.Screen name="activity/[id]/index" />
                <Stack.Screen name="activity/[id]/instructions" />
                <Stack.Screen name="activity/[id]/record" />
                <Stack.Screen name="activity/[id]/results" />
                <Stack.Screen
                    name="activity/[id]/camera"
                    options={{ presentation: 'fullScreenModal' }}
                />
                <Stack.Screen name="record/[id]" />
                <Stack.Screen name="location" options={{ headerShown: true, title: 'Location' }} />
                <Stack.Screen name="scan" options={{ headerShown: true, title: 'Scan record' }} />
            </Stack>
        </>
    );
}

export default function RootLayout() {
    return (
        <SettingsProvider>
            <AuthProvider>
                <TeamProvider>
                    <ActivityProvider>
                        <RootStack />
                    </ActivityProvider>
                </TeamProvider>
            </AuthProvider>
        </SettingsProvider>
    );
}
