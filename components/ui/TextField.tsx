import React, { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

interface TextFieldProps extends TextInputProps {
    label?: string;
    error?: string;
}

export function TextField({ label, error, style, ...rest }: TextFieldProps) {
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];
    const [focused, setFocused] = useState(false);

    const borderColor = error
        ? colors.error
        : focused
            ? colors.primary
            : colors.border;

    return (
        <View style={styles.wrapper}>
            {label ? (
                <ThemedText variant="labelMedium" color="textSecondary" style={styles.label}>
                    {label}
                </ThemedText>
            ) : null}
            <TextInput
                placeholderTextColor={colors.textTertiary}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={[
                    styles.input,
                    {
                        backgroundColor: colors.surfaceVariant,
                        borderColor,
                        color: colors.text,
                    },
                    style,
                ]}
                {...rest}
            />
            {error ? (
                <ThemedText variant="caption" color="error" style={styles.error}>
                    {error}
                </ThemedText>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: Spacing.lg,
    },
    label: {
        marginBottom: Spacing.xs,
        marginLeft: Spacing.xs,
    },
    input: {
        height: 52,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        paddingHorizontal: Spacing.lg,
        fontSize: Typography.bodyLarge.fontSize,
    },
    error: {
        marginTop: Spacing.xs,
        marginLeft: Spacing.xs,
    },
});

export default TextField;
