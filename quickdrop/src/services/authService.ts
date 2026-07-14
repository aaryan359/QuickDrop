import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { getFirebaseServices } from './firebase';

export type QuickDropUser = {
  id: string;
  email: string | null;
  name: string;
  photoUrl: string | null;
  isAnonymous: boolean;
};

const mapUser = (user: User): QuickDropUser => ({
  id: user.uid,
  email: user.email,
  name: user.displayName ?? user.email?.split('@')[0] ?? 'Guest',
  photoUrl: user.photoURL,
  isAnonymous: user.isAnonymous,
});

export const watchAuthUser = (callback: (user: QuickDropUser | null) => void) => {
  const { auth } = getFirebaseServices();
  return onAuthStateChanged(auth, (user) => callback(user ? mapUser(user) : null));
};

export const signInWithEmail = async (email: string, password: string) => {
  const { auth } = getFirebaseServices();
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return mapUser(credential.user);
};

export const createAccountWithEmail = async (email: string, password: string) => {
  const { auth } = getFirebaseServices();
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  return mapUser(credential.user);
};

export const continueAsGuest = async () => {
  const { auth } = getFirebaseServices();
  const credential = await signInAnonymously(auth);
  return mapUser(credential.user);
};

export const logOut = async () => {
  const { auth } = getFirebaseServices();
  await signOut(auth);
};
