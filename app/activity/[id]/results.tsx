import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { getActivityById } from '@/constants/activities';
import { BorderRadius, Colors, IconSize, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

export default function ResultsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const activity = getActivityById(id);
    if (!activity) return null;

    const accent = activity.category === 'engineering' ? colors.engineering : colors.health;

    return (
        <>
            <Stack.Screen options={{ headerShown: true, title: 'Results', headerStyle: { backgroundColor: colors.background }, headerShadowVisible: false, headerTintColor: colors.text, headerTitleStyle: { fontWeight: '700' } }} />
            <ScrollView
                style={{ backgroundColor: colors.background }}
                contentContainerStyle={styles.content}
            >
                {/* Formulas (shown by student level — full list for now) */}
                {activity.formulas.length > 0 ? (
                    <>
                        <ThemedText variant="titleMedium" style={styles.sectionTitle}>Calculations</ThemedText>
                        {activity.formulas.map((f) => (
                            <View key={f.name} style={[styles.formulaCard, { backgroundColor: colors.surface }]}>
                                <ThemedText variant="labelLarge" style={{ color: accent }}>{f.name}</ThemedText>
                                <ThemedText variant="bodyMedium" style={styles.formula}>{f.formula}</ThemedText>
                                {f.example ? (
                                    <ThemedText variant="caption" color="textTertiary">e.g. {f.example}</ThemedText>
                                ) : null}
                            </View>
                        ))}
                    </>
                ) : null}

                {/* Reflection prompts */}
                <ThemedText variant="titleMedium" style={styles.sectionTitle}>Reflection</ThemedText>
                {activity.writeUp.prompts.map((p, i) => (
                    <View key={i} style={styles.bullet}>
                        <Ionicons name="help-circle-outline" size={IconSize.md} color={accent} />
                        <ThemedText variant="bodyMedium" style={styles.bulletText}>{p}</ThemedText>
                    </View>
                ))}

                {/* Rating */}
                <ThemedText variant="titleMedium" style={styles.sectionTitle}>Rate this activity</ThemedText>
                <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <Pressable key={n} onPress={() => setRating(n)} accessibilityLabel={`${n} stars`}>
                            <Ionicons
                                name={n <= rating ? 'star' : 'star-outline'}
                                size={36}
                                color={n <= rating ? colors.secondary : colors.textTertiary}
                                style={styles.star}
                            />
                        </Pressable>
                    ))}
                </View>

                {/* Comment */}
                <TextField
                    label="Team comment"
                    value={comment}
                    onChangeText={setComment}
                    placeholder="What did your team discover?"
                    multiline
                    numberOfLines={3}
                    style={styles.commentBox}
                />

                <Button
                    label="Save & Finish"
                    onPress={() => router.dismissAll()}
                    style={styles.cta}
                />
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    content: { padding: Spacing.lg, paddingBottom: Spacing.xxxxl },
    sectionTitle: { marginTop: Spacing.lg, marginBottom: Spacing.md },
    formulaCard: {
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
    },
    formula: { marginVertical: Spacing.xxs, fontFamily: 'monospace' },
    bullet: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
    bulletText: { flex: 1, marginLeft: Spacing.sm },
    stars: { flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.lg },
    star: { marginHorizontal: Spacing.xs },
    commentBox: { height: 90, paddingTop: Spacing.md, textAlignVertical: 'top' },
    cta: { marginTop: Spacing.lg },
});
