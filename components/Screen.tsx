import React from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

interface ScreenProps {
    children: React.ReactNode;
    /** Wrap content in a ScrollView (adds bottom padding to clear the tab bar). */
    scroll?: boolean;
    /** Apply the standard lg page padding. Default true. */
    padded?: boolean;
    contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Standard screen container — themed background + consistent page padding.
 * Use everywhere so spacing/colour never drift between screens.
 */
export function Screen({ children, scroll = false, padded = true, contentStyle }: ScreenProps) {
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];
    const pad = padded ? styles.padded : null;

    if (scroll) {
        return (
            <ScrollView
                style={{ backgroundColor: colors.background }}
                contentContainerStyle={[styles.scrollContent, pad, contentStyle]}
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>
        );
    }

    return (
        <View style={[styles.flex, { backgroundColor: colors.background }, pad, contentStyle]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    scrollContent: { paddingBottom: Spacing.xxxxl },
    padded: { padding: Spacing.lg },
});

export default Screen;
