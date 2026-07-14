import { firebaseBackend } from './firebaseBackend';
import { localBackend } from './localBackend';
import type { BackendClient, BackendMode } from './types';

const configuredMode = (import.meta.env.VITE_QUICKDROP_BACKEND ?? 'local') as BackendMode;

export const getBackendClient = (): BackendClient => {
  if (configuredMode === 'firebase' && firebaseBackend.isReady()) {
    return firebaseBackend;
  }

  return localBackend;
};

export const getConfiguredBackendMode = (): BackendMode => configuredMode;
