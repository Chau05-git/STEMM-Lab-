import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { BorderRadius, Colors, IconSize, Spacing } from '@/constants/theme';
import type { Team, TeamMember } from '@/constants/types';
import { useSettings } from '@/context/SettingsContext';
import { useTeam } from '@/context/TeamContext';

function makeDiscriminator(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function makeId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function RegisterScreen() {
    const router = useRouter();
    const { registerTeam } = useTeam();
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    const [teamName, setTeamName] = useState('');
    const [gradeLevel, setGradeLevel] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [members, setMembers] = useState<string[]>(['']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const updateMember = (index: number, value: string) => {
        setMembers((prev) => prev.map((m, i) => (i === index ? value : m)));
    };

    const addMember = () => setMembers((prev) => [...prev, '']);

    const removeMember = (index: number) =>
        setMembers((prev) => prev.filter((_, i) => i !== index));

    const handleRegister = async () => {
        setError('');
        const filledMembers = members.map((m) => m.trim()).filter(Boolean);

        if (!teamName.trim()) return setError('Please enter a team name.');
        if (!gradeLevel.trim()) return setError('Please enter your grade / year level.');
        if (filledMembers.length === 0) return setError('Add at least one team member.');

        setLoading(true);
        const teamMembers: TeamMember[] = filledMembers.map((firstName) => ({
            id: makeId(),
            firstName,
        }));

        const team: Team = {
            id: makeId(),
            name: teamName.trim(),
            discriminator: makeDiscriminator(),
            gradeLevel: gradeLevel.trim(),
            schoolName: schoolName.trim() || undefined,
            members: teamMembers,
            createdAt: Date.now(),
        };

        await registerTeam(team);
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
                        <Ionicons name="people" size={32} color={colors.onPrimary} />
                    </View>

                    <ThemedText variant="headlineLarge" style={styles.title}>Set up your team</ThemedText>
                    <ThemedText variant="bodyMedium" color="textSecondary" style={styles.subtitle}>
                        Tell us who is on your science squad
                    </ThemedText>

                    <View style={styles.form}>
                        <TextField
                            label="Team name"
                            value={teamName}
                            onChangeText={setTeamName}
                            placeholder="The Gravity Crew"
                        />
                        <TextField
                            label="Grade / Year level"
                            value={gradeLevel}
                            onChangeText={setGradeLevel}
                            placeholder="e.g. Year 6"
                        />
                        <TextField
                            label="School (optional)"
                            value={schoolName}
                            onChangeText={setSchoolName}
                            placeholder="Riverside Primary"
                        />

                        <ThemedText variant="labelMedium" color="textSecondary" style={styles.membersLabel}>
                            Team members
                        </ThemedText>
                        {members.map((member, index) => (
                            <View key={index} style={styles.memberRow}>
                                <View style={styles.memberInput}>
                                    <TextField
                                        value={member}
                                        onChangeText={(v) => updateMember(index, v)}
                                        placeholder={`Member ${index + 1} first name`}
                                        style={styles.noMargin}
                                    />
                                </View>
                                {members.length > 1 ? (
                                    <Pressable
                                        onPress={() => removeMember(index)}
                                        style={[styles.removeBtn, { backgroundColor: colors.errorMuted }]}
                                        accessibilityLabel={`Remove member ${index + 1}`}
                                    >
                                        <Ionicons name="close" size={IconSize.md} color={colors.error} />
                                    </Pressable>
                                ) : null}
                            </View>
                        ))}

                        <Pressable onPress={addMember} style={styles.addMember}>
                            <Ionicons name="add-circle-outline" size={IconSize.md} color={colors.primary} />
                            <ThemedText variant="labelLarge" color="primary" style={styles.addMemberText}>
                                Add another member
                            </ThemedText>
                        </Pressable>

                        {error ? (
                            <ThemedText variant="bodySmall" color="error" style={styles.error}>
                                {error}
                            </ThemedText>
                        ) : null}

                        <Button label="Start Exploring" onPress={handleRegister} loading={loading} style={styles.submit} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    flex: { flex: 1 },
    scroll: { padding: Spacing.xl, paddingTop: Spacing.xxl },
    logoBadge: {
        width: 72,
        height: 72,
        borderRadius: BorderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    title: { marginBottom: Spacing.xs },
    subtitle: { marginBottom: Spacing.xxl },
    form: {},
    membersLabel: { marginBottom: Spacing.sm, marginLeft: Spacing.xs },
    memberRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md },
    memberInput: { flex: 1 },
    noMargin: { marginBottom: 0 },
    removeBtn: {
        width: 52,
        height: 52,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Spacing.sm,
    },
    addMember: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    addMemberText: { marginLeft: Spacing.xs },
    error: { marginBottom: Spacing.md },
    submit: { marginTop: Spacing.sm },
});
