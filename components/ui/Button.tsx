import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface ButtonProps {
    label: string;
    onPress: () => void;
    variant?: ButtonVariant;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
}

export function Button({
    label,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    fullWidth = true,
    style,
}: ButtonProps) {
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    const bg = {
        primary: colors.primary,
        secondary: colors.secondary,
        outline: 'transparent',
        ghost: 'transparent',
    }[variant];

    const textColor =
        variant === 'primary' ? 'onPrimary'
        : variant === 'secondary' ? 'onSecondary'
        : 'primary';

    const borderColor = variant === 'outline' ? colors.primary : 'transparent';

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={({ pressed }) => [
                styles.base,
                {
                    backgroundColor: bg,
                    borderColor,
                    borderWidth: variant === 'outline' ? 1.5 : 0,
                    opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    width: fullWidth ? '100%' : undefined,
                },
                variant === 'primary' || variant === 'secondary' ? Shadows.sm : undefined,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? colors.onPrimary : colors.primary} />
            ) : (
                <ThemedText
                    variant="labelLarge"
                    color={textColor as 'onPrimary' | 'primary'}
                    style={styles.label}
                >
                    {label}
                </ThemedText>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        height: 52,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    label: {
        textAlign: 'center',
    },
});

export default Button;
