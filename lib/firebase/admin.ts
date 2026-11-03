import { initializeApp, getApps, cert, applicationDefault, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

let _adminApp: App | null = null;
let _adminDb: Firestore | null = null;
let _adminAuth: Auth | null = null;
let _adminStorage: Storage | null = null;

export function getAdminApp(): App | null {
  if (_adminApp) return _adminApp;
  const existingApps = getApps();
  if (existingApps.length > 0) {
    _adminApp = existingApps[0]!;
    return _adminApp;
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      _adminApp = initializeApp({
        credential: cert(serviceAccount),
        storageBucket,
        projectId,
      });
      return _adminApp;
    } catch (e) {
      console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', e);
    }
  }

  try {
    _adminApp = initializeApp({
      credential: applicationDefault(),
      projectId,
      storageBucket,
    });
    return _adminApp;
  } catch (e) {
    // Graceful fallback when no server credentials are set in environment
    return null;
  }
}

export function getAdminDb(): Firestore | null {
  if (_adminDb) return _adminDb;
  const app = getAdminApp();
  if (!app) return null;
  try {
    _adminDb = getFirestore(app);
    return _adminDb;
  } catch {
    return null;
  }
}

export function getAdminAuth(): Auth | null {
  if (_adminAuth) return _adminAuth;
  const app = getAdminApp();
  if (!app) return null;
  try {
    _adminAuth = getAuth(app);
    return _adminAuth;
  } catch {
    return null;
  }
}

export function getAdminStorage(): Storage | null {
  if (_adminStorage) return _adminStorage;
  const app = getAdminApp();
  if (!app) return null;
  try {
    _adminStorage = getStorage(app);
    return _adminStorage;
  } catch {
    return null;
  }
}

// Proxies for backwards compatibility with modules importing adminDb / adminAuth directly
export const adminDb = new Proxy({} as Firestore, {
  get(target, prop, receiver) {
    const db = getAdminDb();
    if (!db) {
      throw new Error("Firebase Admin Firestore is not initialized. Please set FIREBASE_SERVICE_ACCOUNT.");
    }
    const val = (db as any)[prop];
    return typeof val === "function" ? val.bind(db) : val;
  },
});

export const adminAuth = new Proxy({} as Auth, {
  get(target, prop, receiver) {
    const auth = getAdminAuth();
    if (!auth) {
      throw new Error("Firebase Admin Auth is not initialized. Please set FIREBASE_SERVICE_ACCOUNT.");
    }
    const val = (auth as any)[prop];
    return typeof val === "function" ? val.bind(auth) : val;
  },
});

export const adminStorage = new Proxy({} as Storage, {
  get(target, prop, receiver) {
    const storage = getAdminStorage();
    if (!storage) {
      throw new Error("Firebase Admin Storage is not initialized. Please set FIREBASE_SERVICE_ACCOUNT.");
    }
    const val = (storage as any)[prop];
    return typeof val === "function" ? val.bind(storage) : val;
  },
});
