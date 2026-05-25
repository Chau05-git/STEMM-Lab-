import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    signOut as fbSignOut,
    getAuth,
    initializeAuth,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    type Auth,
    type User,
} from 'firebase/auth';
// @ts-ignore — getReactNativePersistence ships in the RN bundle but isn't in the web type defs
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** True when real Firebase keys are present (else the app runs local-only). */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    try {
        auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
    } catch {
        // Already initialised (e.g. fast refresh) — reuse the existing instance.
        auth = getAuth(app);
    }
    db = getFirestore(app);
    storage = getStorage(app);
} else {
    console.warn('Firebase not configured — running in local/offline mode. Add keys to .env to enable cloud features.');
}

export { auth, db, storage };

// ─── Auth helpers ────────────────────────────────────────────────

export async function signUpWithEmail(email: string, password: string): Promise<User> {
    if (!auth) throw new Error('Firebase not configured');
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    return cred.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
    if (!auth) throw new Error('Firebase not configured');
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    return cred.user;
}

export async function signOutUser(): Promise<void> {
    if (auth) await fbSignOut(auth);
}

export async function sendPasswordReset(email: string): Promise<void> {
    if (!auth) throw new Error('Firebase not configured');
    await sendPasswordResetEmail(auth, email.trim());
}

/** Subscribe to auth-state changes. Returns the unsubscribe function. */
export function subscribeToAuth(callback: (user: User | null) => void): () => void {
    if (!auth) {
        callback(null);
        return () => {};
    }
    return onAuthStateChanged(auth, callback);
}

/** Map Firebase auth error codes to friendly student-facing messages. */
export function authErrorMessage(err: unknown): string {
    const code = (err as { code?: string })?.code ?? '';
    switch (code) {
        case 'auth/email-already-in-use':
            return 'A team is already registered with this email. Try logging in instead.';
        case 'auth/invalid-email':
            return 'That email address doesn\'t look right. Please check and try again.';
        case 'auth/weak-password':
            return 'Password is too weak. Use at least 6 characters.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Email or password is incorrect.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please wait a minute and try again.';
        case 'auth/network-request-failed':
            return 'Network error. Check your connection and try again.';
        default:
            return 'Something went wrong. Please try again.';
    }
}
