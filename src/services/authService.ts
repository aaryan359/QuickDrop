import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously as firebaseSignInAnonymously,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type Unsubscribe,
  type User,
} from 'firebase/auth/web-extension';
import type { QuickDropUser } from '../types';
import { getFirebaseServices, waitForAuthPersistence } from './firebase';

type ChromeIdentityApi = {
  identity?: {
    getRedirectURL: () => string;
    launchWebAuthFlow: (
      options: { url: string; interactive: boolean },
      callback: (responseUrl?: string) => void
    ) => void;
  };
  runtime?: {
    lastError?: { message?: string };
  };
};

declare const chrome: ChromeIdentityApi | undefined;

export const mapFirebaseUser = (user: User): QuickDropUser => ({
  id: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  isAnonymous: user.isAnonymous,
});

export const getCurrentUser = (): QuickDropUser | null => {
  const { auth } = getFirebaseServices();
  return auth.currentUser ? mapFirebaseUser(auth.currentUser) : null;
};

export const onAuthUserChanged = (
  callback: (user: QuickDropUser | null) => void
): Unsubscribe => {
  const { auth } = getFirebaseServices();
  return onAuthStateChanged(auth, (user) => {
    waitForAuthPersistence().then(() => {
      callback(user ? mapFirebaseUser(user) : null);
    });
  });
};

export const getGoogleRedirectUri = (): string | null => {
  if (typeof chrome !== 'undefined' && chrome.identity) {
    return chrome.identity.getRedirectURL();
  }

  return null;
};

export const getAuthErrorMessage = (error: unknown): string => {
  const code = typeof error === 'object' && error && 'code' in error
    ? String((error as { code?: string }).code)
    : '';
  const message = error instanceof Error ? error.message : '';

  if (message.includes('redirect_uri_mismatch')) {
    return 'Google login redirect is not allowed yet. Add the Chrome extension redirect URL to your Google OAuth client.';
  }

  if (message.includes('Google web client ID is missing')) {
    return 'Google login needs VITE_FIREBASE_WEB_CLIENT_ID in .env, then rebuild the extension.';
  }

  if (message.includes('Authorization page could not be loaded')) {
    return 'Google login is blocked by OAuth setup. Check the Chrome extension redirect URL in Google Cloud.';
  }

  switch (code) {
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'No matching account was found, or the password is incorrect.';
    case 'auth/wrong-password':
      return 'The password is incorrect.';
    case 'auth/email-already-in-use':
      return 'This email already has an account. Sign in instead.';
    case 'auth/weak-password':
      return 'Use a stronger password with at least 6 characters.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is disabled in Firebase Auth.';
    case 'auth/network-request-failed':
      return 'Network error while contacting Firebase. Check your connection.';
    case 'auth/popup-closed-by-user':
      return 'Google login was closed before it finished.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Authentication settings.';
    default:
      return message || 'Authentication failed. Please try again.';
  }
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<QuickDropUser> => {
  const { auth } = getFirebaseServices();
  const result = await signInWithEmailAndPassword(auth, email, password);
  return mapFirebaseUser(result.user);
};

export const createAccountWithEmail = async (
  email: string,
  password: string
): Promise<QuickDropUser> => {
  const { auth } = getFirebaseServices();
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return mapFirebaseUser(result.user);
};

export const signInAnonymously = async (): Promise<QuickDropUser> => {
  const { auth } = getFirebaseServices();
  const result = await firebaseSignInAnonymously(auth);
  return mapFirebaseUser(result.user);
};

export const signOut = async (): Promise<void> => {
  const { auth } = getFirebaseServices();
  await firebaseSignOut(auth);
};
