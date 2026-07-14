import type { FileItem, NoteItem, Task } from '../../types';

export type AppData = {
  files: FileItem[];
  tasks: Task[];
  notes: NoteItem[];
};

export type BackendMode = 'local' | 'firebase' | 'custom';

export interface BackendClient {
  mode: BackendMode;
  isReady: () => boolean;
  loadAllData: () => Promise<AppData>;
  syncData: (data: AppData) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
}
