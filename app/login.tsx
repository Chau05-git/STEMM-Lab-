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

export default function LoginScreen() {
    const router = useRouter();
    const { signIn } = useAuth();
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await signIn(email, password);
            router.replace('/');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not sign in. Please try again.');
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
                    <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
                        <Ionicons name="flask" size={36} color={colors.onPrimary} />
                    </View>

                    <ThemedText variant="headlineLarge" style={styles.title}>Welcome back</ThemedText>
                    <ThemedText variant="bodyMedium" color="textSecondary" style={styles.subtitle}>
                        Sign in to continue your STEMM challenges
                    </ThemedText>

                    <View style={styles.form}>
                        <TextField
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="team@school.edu"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                        <TextField
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            secureTextEntry
                            error={error}
                        />

                        <Button label="Sign In" onPress={handleLogin} loading={loading} />

                        <Pressable
                            onPress={() => {
                                setEmail('test@stemm-lab.edu');
                                setPassword('test123');
                            }}
                            style={styles.demoButton}
                        >
                            <ThemedText variant="labelMedium" color="primary">
                                Use Demo Account
                            </ThemedText>
                        </Pressable>
                    </View>

                    <View style={styles.footer}>
                        <ThemedText variant="bodyMedium" color="textSecondary">
                            New team?{' '}
                        </ThemedText>
                        <Pressable onPress={() => router.push('/signup')}>
                            <ThemedText variant="labelLarge" color="primary">Create an account</ThemedText>
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
    demoButton: { marginTop: Spacing.md, alignItems: 'center' },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
});
