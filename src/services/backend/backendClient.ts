import { firebaseBackend } from './firebaseBackend';
import type { BackendClient, BackendMode } from './types';

const configuredMode = (import.meta.env.VITE_QUICKDROP_BACKEND ?? 'firebase') as BackendMode;

export const getBackendClient = (): BackendClient => {
  if (firebaseBackend.isReady()) {
    return firebaseBackend;
  }

  throw new Error('Sign in to use QuickDrop.');
};

export const getConfiguredBackendMode = (): BackendMode => configuredMode;
