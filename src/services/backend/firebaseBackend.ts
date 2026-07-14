import type { FileItem, NoteItem, QuickDropItem, Task } from '../../types';
import { getCurrentUser } from '../authService';
import { isFirebaseConfigured } from '../firebase';
import { createItem, deleteItem, getItems } from '../itemService';
import { uploadFile } from '../storageService';
import type { AppData, BackendClient } from './types';

const toFileType = (type: QuickDropItem['type']): FileItem['type'] => {
  if (type === 'link') return 'url';
  if (type === 'document') return 'file';
  if (type === 'note') return 'text';
  return type;
};

const toItemType = (type: FileItem['type']): QuickDropItem['type'] => {
  if (type === 'url') return 'link';
  if (type === 'file') return 'document';
  return type;
};

const mapToFileItem = (item: QuickDropItem): FileItem => ({
  id: item.id,
  name: item.title,
  type: toFileType(item.type),
  content: item.content ?? item.fileUrl,
  url: item.url,
  description: item.note,
  timestamp: new Date(item.createdAt).getTime(),
  status: item.isArchived ? 'archived' : 'review',
  reminderDate: item.reminderAt,
  groupId: item.groupId,
  subgroupId: item.subgroupId,
});

const mapToNoteItem = (item: QuickDropItem): NoteItem => ({
  id: item.id,
  title: item.title,
  content: item.content ?? item.note ?? '',
  timestamp: new Date(item.createdAt).getTime(),
  status: item.isArchived ? 'archived' : 'review',
  reminderDate: item.reminderAt,
  groupId: item.groupId,
  subgroupId: item.subgroupId,
});

export const isFirebaseBackendReady = (): boolean => {
  return isFirebaseConfigured() && getCurrentUser() !== null;
};

export const createCloudFile = async (
  file: File,
  fileContent: string,
  fileItem: FileItem
): Promise<FileItem> => {
  const upload = await uploadFile(file);
  const saved = await createItem({
    type: toItemType(fileItem.type),
    title: fileItem.name,
    fileUrl: upload.fileUrl,
    content: upload.provider === 'local' ? fileContent : undefined,
    groupId: fileItem.groupId,
    subgroupId: fileItem.subgroupId,
    tags: [],
    isStarred: false,
    isArchived: false,
  });
  return { ...fileItem, id: saved.id, content: saved.content ?? saved.fileUrl };
};

export const createCloudUrl = async (fileItem: FileItem): Promise<FileItem> => {
  const saved = await createItem({
    type: 'link',
    title: fileItem.name,
    url: fileItem.url,
    note: fileItem.description,
    groupId: fileItem.groupId,
    subgroupId: fileItem.subgroupId,
    tags: [],
    isStarred: false,
    isArchived: fileItem.status === 'archived',
    reminderAt: fileItem.reminderDate,
  });
  return { ...fileItem, id: saved.id };
};

export const createCloudNote = async (noteItem: NoteItem): Promise<NoteItem> => {
  const saved = await createItem({
    type: 'note',
    title: noteItem.title,
    content: noteItem.content,
    groupId: noteItem.groupId,
    subgroupId: noteItem.subgroupId,
    tags: [],
    isStarred: false,
    isArchived: noteItem.status === 'archived',
    reminderAt: noteItem.reminderDate,
  });
  return { ...noteItem, id: saved.id };
};

export const firebaseBackend: BackendClient = {
  mode: 'firebase',
  isReady: isFirebaseBackendReady,
  loadAllData: async (): Promise<AppData> => {
    const items = await getItems();
    const notes = items.filter((item) => item.type === 'note').map(mapToNoteItem);
    const files = items.filter((item) => item.type !== 'note').map(mapToFileItem);
    const tasks: Task[] = [];
    return { files, tasks, notes };
  },
  syncData: async () => undefined,
  deleteItem,
};
