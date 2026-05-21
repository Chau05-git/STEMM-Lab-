import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Web fallback — avoids hydration mismatch by waiting until mounted
 * before trusting the system colour scheme.
 */
export function useColorScheme(): 'light' | 'dark' {
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => setHydrated(true), []);

    const scheme = useRNColorScheme();
    if (!hydrated) return 'light';
    return scheme === 'dark' ? 'dark' : 'light';
}
