import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useTeam } from '@/context/TeamContext';

/**
 * Splash + router gate.
 *   not signed in        → /login
 *   signed in, no team   → /register
 *   signed in, has team  → /(tabs)
 */
export default function SplashScreen() {
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { user, isLoading: authLoading } = useAuth();
    const { team, isLoading: teamLoading } = useTeam();
    const colors = Colors[resolvedTheme];

    useEffect(() => {
        if (authLoading || teamLoading) return;

        const timer = setTimeout(() => {
            if (!user) router.replace('/login');
            else if (!team) router.replace('/register');
            else router.replace('/(tabs)');
        }, 700);

        return () => clearTimeout(timer);
    }, [authLoading, teamLoading, user, team, router]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="flask" size={52} color={colors.onPrimary} />
            </View>
            <ThemedText variant="displayMedium" style={styles.title}>STEMM Lab</ThemedText>
            <ThemedText variant="bodyLarge" color="textSecondary" style={styles.subtitle}>
                Real-World STEMM Games
            </ThemedText>
            <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    logoBadge: {
        width: 104,
        height: 104,
        borderRadius: BorderRadius.xxl,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        marginBottom: Spacing.xs,
    },
    subtitle: {
        marginBottom: Spacing.xxxl,
    },
    spinner: {
        marginTop: Spacing.lg,
    },
});
