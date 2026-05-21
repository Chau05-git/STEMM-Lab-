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
                }}
            />
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
