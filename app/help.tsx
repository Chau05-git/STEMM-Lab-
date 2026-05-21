import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ACTIVITIES } from '@/constants/activities';
import { BorderRadius, Colors, IconSize, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

export default function HelpScreen() {
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    return (
        <ScrollView
            style={{ backgroundColor: colors.background }}
            contentContainerStyle={styles.content}
        >
            <View style={styles.intro}>
                <Ionicons name="school-outline" size={IconSize.xl} color={colors.primary} />
                <ThemedText variant="bodyMedium" color="textSecondary" style={styles.introText}>
                    STEMM Lab turns real-world activities into game-based science learning.
                    Below are the Australian Curriculum links for each challenge.
                </ThemedText>
            </View>

            {ACTIVITIES.map((activity) => (
                <View key={activity.id} style={[styles.card, { backgroundColor: colors.surface }]}>
                    <View style={styles.cardHeader}>
                        <ThemedText style={styles.icon}>{activity.icon}</ThemedText>
                        <ThemedText variant="titleSmall" style={styles.cardTitle}>{activity.name}</ThemedText>
                    </View>
                    {activity.curriculumLinks.map((link) => (
                        <View key={link.code} style={styles.linkRow}>
                            <ThemedText variant="labelSmall" color="primary" style={styles.code}>
                                {link.code}
                            </ThemedText>
                            <ThemedText variant="caption" color="textSecondary" style={styles.linkDesc}>
                                {link.subject} — {link.description}
                            </ThemedText>
                        </View>
                    ))}
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: { padding: Spacing.lg, paddingBottom: Spacing.xxxxl },
    intro: { alignItems: 'center', marginBottom: Spacing.xl },
    introText: { textAlign: 'center', marginTop: Spacing.md, maxWidth: 320 },
    card: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
    icon: { fontSize: 24, marginRight: Spacing.sm },
    cardTitle: { flex: 1 },
    linkRow: { marginBottom: Spacing.xs },
    code: { marginBottom: 2 },
    linkDesc: {},
});
