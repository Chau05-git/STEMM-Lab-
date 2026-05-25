import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
} from 'firebase/firestore';

import type { ActivityAttempt, Team } from '@/constants/types';
import { db, isFirebaseConfigured } from './firebase';

/**
 * Per-account cloud storage. Everything lives under `users/{uid}` so each
 * account only ever sees its own data (enforced by Firestore security rules).
 * All calls are best-effort: they no-op when Firebase isn't configured and
 * never throw to the caller — the app stays local-first/offline-friendly.
 */

/** Firestore rejects `undefined`; round-trip drops undefined keys cleanly. */
function clean<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

// ─── Team ────────────────────────────────────────────────────────

export async function saveTeamCloud(uid: string, team: Team): Promise<void> {
    if (!isFirebaseConfigured || !db) return;
    try {
        await setDoc(doc(db, 'users', uid), { team: clean(team) }, { merge: true });
    } catch (e) {
        console.warn('saveTeamCloud failed:', e);
    }
}

export async function getTeamCloud(uid: string): Promise<Team | null> {
    if (!isFirebaseConfigured || !db) return null;
    try {
        const snap = await getDoc(doc(db, 'users', uid));
        const data = snap.exists() ? snap.data() : null;
        return (data?.team as Team) ?? null;
    } catch (e) {
        console.warn('getTeamCloud failed:', e);
        return null;
    }
}

// ─── Attempts ────────────────────────────────────────────────────

export async function saveAttemptCloud(uid: string, attempt: ActivityAttempt): Promise<void> {
    if (!isFirebaseConfigured || !db) return;
    try {
        await setDoc(doc(db, 'users', uid, 'attempts', attempt.id), clean(attempt));
    } catch (e) {
        console.warn('saveAttemptCloud failed:', e);
    }
}

export async function getAttemptsCloud(uid: string): Promise<ActivityAttempt[]> {
    if (!isFirebaseConfigured || !db) return [];
    try {
        const snap = await getDocs(collection(db, 'users', uid, 'attempts'));
        return snap.docs.map((d) => d.data() as ActivityAttempt);
    } catch (e) {
        console.warn('getAttemptsCloud failed:', e);
        return [];
    }
}
