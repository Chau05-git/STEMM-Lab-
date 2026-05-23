import type { ThemeColors } from './theme';

/**
 * Shared header options so every activity sub-screen looks identical:
 * flat (no shadow), background-coloured bar, bold title.
 */
export function activityHeaderOptions(colors: ThemeColors, title: string) {
    return {
        headerShown: true,
        title,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' as const },
    };
}
