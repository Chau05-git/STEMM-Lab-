import * as BackgroundFetch from 'expo-background-fetch';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as TaskManager from 'expo-task-manager';

import { getUnsyncedAttempts, markSynced } from './database';
import { auth } from './firebase';
import { saveAttemptCloud } from './firestore';
import { notifyActivityReminder } from './notifications';
import { getProgress } from './storage';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const BACKGROUND_SYNC_TASK = 'STEMM_BACKGROUND_SYNC';

/**
 * Push any locally-saved-but-not-yet-synced attempts up to the signed-in
 * account's cloud. Runs on launch and periodically in the background — this is
 * the offline-first sync that makes the app resilient to no network.
 */
export async function syncPendingAttempts(): Promise<{ pushed: number; failed: number }> {
    let pushed = 0;
    let failed = 0;

    const uid = auth?.currentUser?.uid;
    if (!uid) return { pushed, failed };

    try {
        const pending = await getUnsyncedAttempts();
        if (pending.length === 0) return { pushed, failed };

        // Push in parallel (parallel programming).
        await Promise.all(
            pending.map(async (attempt) => {
                const ok = await saveAttemptCloud(uid, attempt);
                if (ok) {
                    await markSynced(attempt.id);
                    pushed++;
                } else {
                    failed++;
                }
            }),
        );
    } catch (err) {
        console.warn('[backgroundTask] syncPendingAttempts failed:', err);
    }

    if (pushed > 0) console.log(`[backgroundTask] Synced ${pushed} attempts to cloud`);
    return { pushed, failed };
}

// ─── Background task definition ──────────────────────────────────

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
    try {
        const result = await syncPendingAttempts();

        // Remind about any activity left in progress.
        const progress = await getProgress();
        const inProgress = Object.entries(progress)
            .filter(([, p]) => p.status === 'in_progress')
            .map(([id]) => id);

        if (inProgress.length > 0) {
            const label = inProgress[0]
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
            await notifyActivityReminder(label);
        }

        return result.pushed > 0
            ? BackgroundFetch.BackgroundFetchResult.NewData
            : BackgroundFetch.BackgroundFetchResult.NoData;
    } catch {
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

// ─── Registration ────────────────────────────────────────────────

export async function registerBackgroundSync(): Promise<void> {
    if (isExpoGo) {
        console.log('[backgroundTask] Skipping background registration in Expo Go.');
        return;
    }
    const status = await BackgroundFetch.getStatusAsync();
    if (
        status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
        status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
        console.warn('[backgroundTask] Background fetch unavailable on this device.');
        return;
    }

    const registered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (!registered) {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
            minimumInterval: 15 * 60, // 15 minutes
            stopOnTerminate: false,
            startOnBoot: true,
        });
    }
}
