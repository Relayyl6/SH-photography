import { initializeApp, getApps, cert, applicationDefault, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

function getAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      return initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } catch (e) {
      console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', e);
    }
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'sh-photography-demo',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'sh-photography-demo.appspot.com',
  });
}

export const adminApp: App = getAdminApp();
export const adminDb: Firestore = getFirestore(adminApp);
export const adminAuth: Auth = getAuth(adminApp);
export const adminStorage: Storage = getStorage(adminApp);
