import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously as firebaseSignInAnonymously,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type Unsubscribe,
  type User,
} from 'firebase/auth';
import type { QuickDropUser } from '../types';
import { getFirebaseServices } from './firebase';

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
    callback(user ? mapFirebaseUser(user) : null);
  });
};

export const signInWithGoogle = async (): Promise<QuickDropUser> => {
  const { auth } = getFirebaseServices();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return mapFirebaseUser(result.user);
};

export const signInWithGoogleIdToken = async (idToken: string): Promise<QuickDropUser> => {
  const { auth } = getFirebaseServices();
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return mapFirebaseUser(result.user);
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
