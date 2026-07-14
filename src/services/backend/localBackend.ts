import { loadData, saveData } from '../storage';
import type { AppData, BackendClient } from './types';

export const localBackend: BackendClient = {
  mode: 'local',
  isReady: () => true,
  loadAllData: loadData,
  syncData: (data: AppData) => saveData(data.files, data.tasks, data.notes),
  deleteItem: async () => undefined,
};
