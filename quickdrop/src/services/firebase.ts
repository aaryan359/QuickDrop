import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyDD4Gqp1ikTRj8Lb1aW_rMZx8j9ScsCMz0',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'quickdrop-adca5.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'quickdrop-adca5',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'quickdrop-adca5.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '275062412143',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:275062412143:web:81ead27cff268885628e9a',
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export const getFirebaseServices = () => {
  if (!app) {
    app = getApps()[0] ?? initializeApp(firebaseConfig);
  }

  if (!auth) {
    auth = getAuth(app);
  }

  if (!db) {
    db = getFirestore(app);
  }

  return { app, auth, db };
};
