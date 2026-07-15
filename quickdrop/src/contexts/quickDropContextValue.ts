import { createContext } from 'react';
import type { QuickDropUser } from '@/services/authService';
import type { CreateQuickDropItem, QuickDropItem } from '@/types/quickdrop';

export type QuickDropContextValue = {
  user: QuickDropUser | null;
  items: QuickDropItem[];
  isAuthLoading: boolean;
  isDataLoading: boolean;
  message: string;
  setMessage: (message: string) => void;
  signIn: (email: string, password: string) => Promise<void>;
  createAccount: (email: string, password: string) => Promise<void>;
  signInGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  addItem: (input: CreateQuickDropItem) => Promise<QuickDropItem | null>;
  editItem: (itemId: string, input: Partial<CreateQuickDropItem>) => Promise<void>;
  removeItem: (itemId: string) => Promise<boolean>;
};

export const QuickDropContext = createContext<QuickDropContextValue | null>(null);
