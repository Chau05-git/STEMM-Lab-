import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { ACTIVITIES } from '@/constants/activities';
import { BorderRadius, Colors, IconSize, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useTeam } from '@/context/TeamContext';

export default function ProfileScreen() {
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { team, activityProgress, clearTeam } = useTeam();
    const { signOut } = useAuth();
    const colors = Colors[resolvedTheme];

    const completedCount = ACTIVITIES.filter(
        (a) => activityProgress[a.id]?.status === 'completed',
    ).length;

    const handleSignOut = () => {
        Alert.alert('Sign out', 'This will clear your team on this device. Continue?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign out',
                style: 'destructive',
                onPress: async () => {
                    await clearTeam();
                    await signOut();
                    router.replace('/login');
                },
            },
        ]);
    };

    return (
        <ScrollView
            style={{ backgroundColor: colors.background }}
            contentContainerStyle={styles.content}
        >
            {/* Team header card */}
            <View style={[styles.headerCard, { backgroundColor: colors.primary }]}>
                <View style={[styles.avatar, { backgroundColor: colors.onPrimary + '22' }]}>
                    <Ionicons name="people" size={IconSize.xl} color={colors.onPrimary} />
                </View>
                <ThemedText variant="headlineSmall" color="onPrimary" style={styles.teamName}>
                    {team?.name ?? 'Team'}
                </ThemedText>
                <ThemedText variant="bodySmall" color="onPrimary" style={styles.discriminator}>
                    #{team?.discriminator ?? '----'} · {team?.gradeLevel ?? ''}
                </ThemedText>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <StatBox label="Members" value={String(team?.members.length ?? 0)} colors={colors} />
                <StatBox label="Completed" value={`${completedCount}/${ACTIVITIES.length}`} colors={colors} />
            </View>

            {/* Members list */}
            <ThemedText variant="titleMedium" style={styles.sectionTitle}>Team members</ThemedText>
            <View style={[styles.memberCard, { backgroundColor: colors.surface }]}>
                {team?.members.map((m, i) => (
                    <View
                        key={m.id}
                        style={[
                            styles.memberRow,
                            i < (team?.members.length ?? 0) - 1 && {
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                borderBottomColor: colors.border,
                            },
                        ]}
                    >
                        <View style={[styles.memberDot, { backgroundColor: colors.primaryMuted }]}>
                            <ThemedText variant="labelMedium" color="primary">
                                {m.firstName.charAt(0).toUpperCase()}
                            </ThemedText>
                        </View>
                        <ThemedText variant="bodyLarge">{m.firstName}</ThemedText>
                    </View>
                ))}
            </View>

            <Button
                label="Settings"
                variant="outline"
                onPress={() => router.push('/settings')}
                style={styles.actionBtn}
            />
            <Button
                label="Sign Out"
                variant="ghost"
                onPress={handleSignOut}
                style={styles.actionBtn}
            />
        </ScrollView>
    );
}

function StatBox({
    label,
    value,
    colors,
}: {
    label: string;
    value: string;
    colors: Record<string, string>;
}) {
    return (
        <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
            <ThemedText variant="headlineMedium" color="primary">{value}</ThemedText>
            <ThemedText variant="caption" color="textSecondary">{label}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    content: { padding: Spacing.lg, paddingBottom: Spacing.xxxxl },
    headerCard: {
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        padding: Spacing.xl,
        marginBottom: Spacing.lg,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    teamName: { marginBottom: Spacing.xxs },
    discriminator: { opacity: 0.85 },
    statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
    statBox: {
        flex: 1,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        paddingVertical: Spacing.lg,
    },
    sectionTitle: { marginBottom: Spacing.md },
    memberCard: {
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    memberDot: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    actionBtn: { marginBottom: Spacing.sm },
});
