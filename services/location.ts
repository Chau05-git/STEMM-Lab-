import * as Location from 'expo-location';

export interface GpsCoordinates {
    latitude: number;
    longitude: number;
}

const GPS_TIMEOUT_MS = 4000;

export async function requestLocationPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
}

/**
 * Best-effort current location. Races the GPS lock against a 4s timeout so a
 * slow fix never blocks saving an attempt — returns null instead.
 */
export async function getCurrentLocation(): Promise<GpsCoordinates | null> {
    try {
        if (!(await requestLocationPermission())) return null;

        const locationPromise = Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });
        const timeoutPromise = new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), GPS_TIMEOUT_MS),
        );

        const result = await Promise.race([locationPromise, timeoutPromise]);
        if (!result || !('coords' in result)) return null;

        return {
            latitude: result.coords.latitude,
            longitude: result.coords.longitude,
        };
    } catch (error) {
        console.warn('Failed to get location:', error);
        return null;
    }
}
