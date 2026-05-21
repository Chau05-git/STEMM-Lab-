import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';
import { AuthProvider } from '@/context/AuthContext';
import { ActivityProvider } from '@/context/ActivityContext';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { TeamProvider } from '@/context/TeamContext';

function RootStack() {
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

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
