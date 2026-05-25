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
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';

export default function SignupScreen() {
    const router = useRouter();
    const { signUp } = useAuth();
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async () => {
        setError('');
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            await signUp(email, password);
            router.replace('/');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    <View style={[styles.logoBadge, { backgroundColor: colors.secondary }]}>
                        <Ionicons name="person-add" size={32} color={colors.onSecondary} />
                    </View>

                    <ThemedText variant="headlineLarge" style={styles.title}>Create account</ThemedText>
                    <ThemedText variant="bodyMedium" color="textSecondary" style={styles.subtitle}>
                        Register your team to start exploring
                    </ThemedText>

                    <View style={styles.form}>
                        <TextField
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="team@school.edu"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TextField
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="At least 6 characters"
                            secureTextEntry
                        />
                        <TextField
                            label="Confirm password"
                            value={confirm}
                            onChangeText={setConfirm}
                            placeholder="Re-enter password"
                            secureTextEntry
                            error={error}
                        />

                        <Button label="Create Account" onPress={handleSignup} loading={loading} />
                    </View>

                    <View style={styles.footer}>
                        <ThemedText variant="bodyMedium" color="textSecondary">
                            Already have an account?{' '}
                        </ThemedText>
                        <Pressable onPress={() => router.back()}>
                            <ThemedText variant="labelLarge" color="primary">Sign in</ThemedText>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    flex: { flex: 1 },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: Spacing.xl,
    },
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
    form: { marginBottom: Spacing.lg },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
});
