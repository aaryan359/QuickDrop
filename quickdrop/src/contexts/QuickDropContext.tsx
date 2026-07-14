import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  continueAsGuest,
  createAccountWithEmail,
  logOut,
  signInWithEmail,
  watchAuthUser,
  type QuickDropUser,
} from '@/services/authService';
import {
  createItem,
  deleteItem,
  updateItem,
  watchItems,
} from '@/services/itemService';
import type { QuickDropItem } from '@/types/quickdrop';
import { QuickDropContext, type QuickDropContextValue } from './quickDropContextValue';

const authErrorMessage = (error: unknown): string => {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';

  if (code.includes('invalid-credential')) return 'Email or password is not correct.';
  if (code.includes('user-not-found')) return 'No account found with this email.';
  if (code.includes('wrong-password')) return 'Password is not correct.';
  if (code.includes('email-already-in-use')) return 'This email already has an account.';
  if (code.includes('weak-password')) return 'Password must be at least 6 characters.';
  if (code.includes('invalid-email')) return 'Please enter a valid email address.';
  if (code.includes('permission-denied')) return 'Firestore rules are blocking this account.';

  return error instanceof Error ? error.message : 'Something went wrong.';
};

export function QuickDropProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<QuickDropUser | null>(null);
  const [items, setItems] = useState<QuickDropItem[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    return watchAuthUser((nextUser) => {
      setUser(nextUser);
      setItems([]);
      setIsAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setIsDataLoading(false);
      return;
    }

    setIsDataLoading(true);
    const unsubscribe = watchItems(
      user.id,
      (nextItems) => {
        setItems(nextItems);
        setIsDataLoading(false);
      },
      (errorMessage) => {
        setMessage(errorMessage);
        setIsDataLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const value = useMemo<QuickDropContextValue>(() => ({
    user,
    items,
    isAuthLoading,
    isDataLoading,
    message,
    setMessage,
    signIn: async (email, password) => {
      try {
        await signInWithEmail(email, password);
        setMessage('Signed in.');
      } catch (error) {
        setMessage(authErrorMessage(error));
      }
    },
    createAccount: async (email, password) => {
      try {
        await createAccountWithEmail(email, password);
        setMessage('Account created.');
      } catch (error) {
        setMessage(authErrorMessage(error));
      }
    },
    signInGuest: async () => {
      try {
        await continueAsGuest();
        setMessage('Guest session started.');
      } catch (error) {
        setMessage(authErrorMessage(error));
      }
    },
    signOut: async () => {
      await logOut();
      setMessage('Signed out.');
    },
    addItem: async (input) => {
      if (!user) {
        setMessage('Please sign in first.');
        return;
      }

      try {
        await createItem(user.id, input);
        setMessage('Saved to QuickDrop.');
      } catch (error) {
        setMessage(authErrorMessage(error));
      }
    },
    editItem: async (itemId, input) => {
      if (!user) return;
      try {
        await updateItem(user.id, itemId, input);
        setMessage('Updated.');
      } catch (error) {
        setMessage(authErrorMessage(error));
      }
    },
    removeItem: async (itemId) => {
      if (!user) return;
      try {
        await deleteItem(user.id, itemId);
        setMessage('Deleted.');
      } catch (error) {
        setMessage(authErrorMessage(error));
      }
    },
  }), [isAuthLoading, isDataLoading, items, message, user]);

  return (
    <QuickDropContext.Provider value={value}>
      {children}
    </QuickDropContext.Provider>
  );
}
