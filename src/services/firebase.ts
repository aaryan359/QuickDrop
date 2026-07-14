import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  indexedDBLocalPersistence,
  setPersistence,
  type Auth,
} from 'firebase/auth/web-extension';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging';

type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let services: FirebaseServices | null = null;
let messagingPromise: Promise<Messaging | null> | null = null;
let authPersistenceReady: Promise<void> | null = null;

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
};

export const getFirebaseServices = (): FirebaseServices => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase env values are missing. Check .env.example.');
  }

  if (!services) {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    authPersistenceReady = setPersistence(auth, indexedDBLocalPersistence);
    services = {
      app,
      auth,
      db: getFirestore(app),
    };
  }

  return services;
};

export const waitForAuthPersistence = async (): Promise<void> => {
  await authPersistenceReady;
};

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (!isFirebaseConfigured()) {
    return null;
  }

  if (!messagingPromise) {
    messagingPromise = isSupported().then((supported) => {
      return supported ? getMessaging(getFirebaseServices().app) : null;
    });
  }

  return messagingPromise;
};
