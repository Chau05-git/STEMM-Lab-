import * as Battery from 'expo-battery';
import { useEffect, useState } from 'react';

export interface BatteryInfo {
    level: number | null;   // 0–1
    isCharging: boolean;
    isLoaded: boolean;
}

/** Live battery level + charging state via expo-battery. */
export function useBattery(): BatteryInfo {
    const [info, setInfo] = useState<BatteryInfo>({
        level: null,
        isCharging: false,
        isLoaded: false,
    });

    useEffect(() => {
        let mounted = true;

        Promise.all([Battery.getBatteryLevelAsync(), Battery.getBatteryStateAsync()])
            .then(([level, state]) => {
                if (!mounted) return;
                setInfo({
                    level,
                    isCharging:
                        state === Battery.BatteryState.CHARGING ||
                        state === Battery.BatteryState.FULL,
                    isLoaded: true,
                });
            })
            .catch(() => {
                if (mounted) setInfo({ level: null, isCharging: false, isLoaded: true });
            });

        const levelSub = Battery.addBatteryLevelListener(({ batteryLevel }) => {
            if (mounted) setInfo((prev) => ({ ...prev, level: batteryLevel }));
        });
        const stateSub = Battery.addBatteryStateListener(({ batteryState }) => {
            if (mounted) {
                setInfo((prev) => ({
                    ...prev,
                    isCharging:
                        batteryState === Battery.BatteryState.CHARGING ||
                        batteryState === Battery.BatteryState.FULL,
                }));
            }
        });

        return () => {
            mounted = false;
            levelSub.remove();
            stateSub.remove();
        };
    }, []);

    return info;
}

export function batteryIconName(
    level: number | null,
    isCharging: boolean,
): 'battery-charging' | 'battery-full' | 'battery-half' | 'battery-dead' {
    if (isCharging) return 'battery-charging';
    if (level === null) return 'battery-half';
    if (level > 0.75) return 'battery-full';
    if (level > 0.2) return 'battery-half';
    return 'battery-dead';
}

export function batteryColor(level: number | null): string {
    if (level === null) return '#94A3B8';
    if (level > 0.5) return '#10B981';
    if (level > 0.2) return '#F59E0B';
    return '#EF4444';
}
