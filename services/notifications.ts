import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Set the handler ALWAYS — on iOS this is what makes a notification appear as a
// banner while the app is in the foreground (works in Expo Go on iPhone too).
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/** Ask for notification permission + set up the Android channel. */
export async function registerForNotifications(): Promise<void> {
    if (isExpoGo && Platform.OS === 'android') {
        console.log('[notifications] Skipping setup in Expo Go on Android.');
        return;
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('stemm-alerts', {
            name: 'STEMM Lab Alerts',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#4F46E5',
            sound: 'default',
        });
    }
}

export async function notifyActivityComplete(activityName: string): Promise<void> {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Activity complete! 🎉',
                body: `Great work — you finished "${activityName}". Check your results.`,
                sound: true,
                data: { type: 'activity_complete', activityName },
            },
            trigger: null, // fire immediately
        });
    } catch (e) {
        // expo-notifications is unavailable in Expo Go (Android) — needs a dev build.
        console.warn('notifyActivityComplete failed (likely Expo Go):', e);
    }
}

export async function notifyActivityReminder(activityName: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Activity in progress',
            body: `Don't forget to finish "${activityName}" and save your results!`,
            sound: true,
            data: { type: 'activity_reminder', activityName },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 60 },
    });
}

export async function notifyLowBattery(level: number): Promise<void> {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Battery low 🔋',
            body: `Battery at ${Math.round(level * 100)}%. Plug in before running long sensor activities.`,
            sound: true,
            data: { type: 'low_battery' },
        },
        trigger: null, // immediately
    });
}

export async function cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}
