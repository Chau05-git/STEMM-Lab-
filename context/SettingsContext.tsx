import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import type { AppSettings, ColorScheme, ResolvedTheme } from '@/constants/types';
import { DEFAULT_SETTINGS, getSettings, saveSettings } from '@/services/storage';

interface SettingsContextValue {
    settings: AppSettings;
    resolvedTheme: ResolvedTheme;
    isLoading: boolean;
    setTheme: (theme: ColorScheme) => void;
    updateSettings: (partial: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
    settings: DEFAULT_SETTINGS,
    resolvedTheme: 'light',
    isLoading: true,
    setTheme: () => {},
    updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme();
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    // Load persisted settings on mount
    useEffect(() => {
        getSettings().then((s) => {
            setSettings(s);
            setIsLoading(false);
        });
    }, []);

    // 'system' → follow OS; otherwise use chosen theme
    const resolvedTheme: ResolvedTheme =
        settings.theme === 'system'
            ? systemScheme === 'dark' ? 'dark' : 'light'
            : settings.theme;

    const updateSettings = (partial: Partial<AppSettings>) => {
        const next = { ...settings, ...partial };
        setSettings(next);
        void saveSettings(next);
    };

    return (
        <SettingsContext.Provider
            value={{
                settings,
                resolvedTheme,
                isLoading,
                setTheme: (theme) => updateSettings({ theme }),
                updateSettings,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(SettingsContext);
}
