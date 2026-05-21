import React from 'react';
import { Text, type TextProps } from 'react-native';

import { Colors, Typography } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

type Variant = keyof typeof Typography;
type ColorKey =
    | 'text' | 'textSecondary' | 'textTertiary'
    | 'primary' | 'secondary' | 'error' | 'onPrimary';

interface ThemedTextProps extends TextProps {
    variant?: Variant;
    color?: ColorKey;
}

/**
 * Text that pulls its size/weight from the Typography scale and its colour
 * from the active theme. Keeps every screen visually consistent.
 */
export function ThemedText({
    variant = 'bodyMedium',
    color = 'text',
    style,
    ...rest
}: ThemedTextProps) {
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    return (
        <Text
            style={[Typography[variant] as object, { color: colors[color] }, style]}
            {...rest}
        />
    );
}

export default ThemedText;
