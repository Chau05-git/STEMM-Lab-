import '@/types/global.css';
import { Platform } from 'react-native';

// ─── Colour Palettes ─────────────────────────────────────────────
// STEMM Lab identity: Indigo + Amber — "modern science lab"
// Hoàn toàn khác STEMM-Labs (green #1A9B7B)

export const Colors = {
    light: {
        // Brand
        primary: '#4F46E5',           // indigo-600
        primaryVariant: '#6366F1',    // indigo-500
        primaryMuted: '#EEF2FF',      // indigo-50
        secondary: '#F59E0B',         // amber-500
        secondaryVariant: '#D97706',  // amber-600
        secondaryMuted: '#FFFBEB',    // amber-50

        // Surfaces
        background: '#F8FAFF',
        surface: '#FFFFFF',
        surfaceVariant: '#F1F5F9',
        surfaceElevated: '#FFFFFF',

        // Text
        text: '#0F172A',              // slate-900
        textSecondary: '#475569',     // slate-600
        textTertiary: '#94A3B8',      // slate-400
        onPrimary: '#FFFFFF',
        onSecondary: '#0F172A',

        // Borders & dividers
        border: '#E2E8F0',            // slate-200
        borderStrong: '#CBD5E1',      // slate-300
        divider: '#F1F5F9',

        // Feedback
        error: '#EF4444',
        errorMuted: '#FEF2F2',
        success: '#10B981',
        successMuted: '#ECFDF5',
        warning: '#F59E0B',
        warningMuted: '#FFFBEB',
        info: '#3B82F6',
        infoMuted: '#EFF6FF',

        // Misc
        backgroundSelected: '#EEF2FF',
        overlay: 'rgba(15, 23, 42, 0.4)',

        // Category accents
        engineering: '#4F46E5',       // indigo
        health: '#EC4899',            // pink

        // Status badges
        statusNotStarted: '#94A3B8',  // slate-400
        statusInProgress: '#F59E0B',  // amber
        statusCompleted: '#10B981',   // emerald
    } as Record<string, string>,

    dark: {
        // Brand
        primary: '#818CF8',           // indigo-400
        primaryVariant: '#6366F1',    // indigo-500
        primaryMuted: '#1E1B4B',      // indigo-950
        secondary: '#FCD34D',         // amber-300
        secondaryVariant: '#F59E0B',  // amber-500
        secondaryMuted: '#1C1700',

        // Surfaces
        background: '#0F172A',        // slate-900
        surface: '#1E293B',           // slate-800
        surfaceVariant: '#293548',
        surfaceElevated: '#334155',   // slate-700

        // Text
        text: '#F8FAFC',              // slate-50
        textSecondary: '#94A3B8',     // slate-400
        textTertiary: '#64748B',      // slate-500
        onPrimary: '#FFFFFF',
        onSecondary: '#0F172A',

        // Borders & dividers
        border: '#334155',            // slate-700
        borderStrong: '#475569',      // slate-600
        divider: '#1E293B',

        // Feedback
        error: '#F87171',
        errorMuted: '#2D1515',
        success: '#34D399',
        successMuted: '#052E16',
        warning: '#FCD34D',
        warningMuted: '#1C1700',
        info: '#60A5FA',
        infoMuted: '#0C1A2E',

        // Misc
        backgroundSelected: '#1E1B4B',
        overlay: 'rgba(0, 0, 0, 0.6)',

        // Category accents
        engineering: '#818CF8',       // indigo-400
        health: '#F472B6',            // pink-400

        // Status badges
        statusNotStarted: '#64748B',
        statusInProgress: '#FCD34D',
        statusCompleted: '#34D399',
    } as Record<string, string>,
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = Record<string, string>;

// ─── Typography ──────────────────────────────────────────────────
// Bold, impactful — khác STEMM-Labs (dùng MD3 scale nhẹ hơn)
export const Typography = {
    displayLarge:  { fontSize: 52, fontWeight: '800' as const, lineHeight: 60, letterSpacing: -1.5 },
    displayMedium: { fontSize: 40, fontWeight: '800' as const, lineHeight: 48, letterSpacing: -1 },
    headlineLarge: { fontSize: 32, fontWeight: '800' as const, lineHeight: 40, letterSpacing: -0.5 },
    headlineMedium:{ fontSize: 26, fontWeight: '700' as const, lineHeight: 34, letterSpacing: -0.3 },
    headlineSmall: { fontSize: 22, fontWeight: '700' as const, lineHeight: 30 },
    titleLarge:    { fontSize: 20, fontWeight: '700' as const, lineHeight: 28 },
    titleMedium:   { fontSize: 17, fontWeight: '600' as const, lineHeight: 24 },
    titleSmall:    { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
    bodyLarge:     { fontSize: 16, fontWeight: '400' as const, lineHeight: 26 },
    bodyMedium:    { fontSize: 14, fontWeight: '400' as const, lineHeight: 22 },
    bodySmall:     { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },
    labelLarge:    { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
    labelMedium:   { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
    labelSmall:    { fontSize: 11, fontWeight: '500' as const, lineHeight: 14, letterSpacing: 0.4 },
    caption:       { fontSize: 11, fontWeight: '400' as const, lineHeight: 14, letterSpacing: 0.2 },
} as const;

// ─── Fonts ───────────────────────────────────────────────────────
export const Fonts = Platform.select({
    ios:     { sans: 'System',  mono: 'Menlo' },
    android: { sans: 'Roboto',  mono: 'monospace' },
    web:     { sans: "'Inter', system-ui, sans-serif", mono: "'Fira Code', monospace" },
    default: { sans: 'System',  mono: 'monospace' },
});

// ─── Spacing ─────────────────────────────────────────────────────
export const Spacing = {
    xxs:  2,
    xs:   4,
    sm:   8,
    md:  12,
    lg:  16,
    xl:  24,
    xxl: 32,
    xxxl:48,
    xxxxl:64,
} as const;

// ─── Border Radius ───────────────────────────────────────────────
// Rounder corners 
export const BorderRadius = {
    xs:   4,
    sm:   8,
    md:  12,
    lg:  16,
    xl:  20,
    xxl: 28,
    full: 9999,
} as const;

// ─── Shadows ─────────────────────────────────────────────────────
export const Shadows = {
    xs: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    sm: {
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    md: {
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
    },
    lg: {
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 20,
        elevation: 8,
    },
} as const;

// ─── Layout ──────────────────────────────────────────────────────
export const Layout = {
    maxContentWidth: 800,
    tabBarHeight: Platform.select({ ios: 88, android: 72 }) ?? 72,
    headerHeight: Platform.select({ ios: 100, android: 64 }) ?? 64,
    gridColumns: 2,
    cardAspectRatio: 1.1, // home grid cards
} as const;

// ─── Icon Sizes ──────────────────────────────────────────────────
export const IconSize = {
    xs:  12,
    sm:  16,
    md:  20,
    lg:  24,
    xl:  32,
    xxl: 48,
} as const;

// ─── Z-Index ─────────────────────────────────────────────────────
export const ZIndex = {
    base:    0,
    card:    10,
    header:  100,
    modal:   200,
    overlay: 300,
    toast:   400,
} as const;
