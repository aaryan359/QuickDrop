import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore';
import type { QuickDropItem } from '../types';
import { getCurrentUser } from './authService';
import { getFirebaseServices } from './firebase';

type CreateItemInput = Omit<QuickDropItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
type UpdateItemInput = Partial<Omit<QuickDropItem, 'id' | 'userId' | 'createdAt'>>;

const removeUndefined = <T extends Record<string, unknown>>(value: T): T => {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)
  ) as T;
};

const getUserId = (): string => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Sign in before syncing QuickDrop items.');
  }
  return user.id;
};

const itemsCollection = (userId: string) => {
  const { db } = getFirebaseServices();
  return collection(db, 'users', userId, 'items');
};

const normalizeItemType = (type: unknown): QuickDropItem['type'] => {
  if (type === 'link') return 'url';
  if (type === 'document') return 'file';
  if (type === 'url' || type === 'text' || type === 'note' || type === 'image' || type === 'pdf' || type === 'file' || type === 'task') {
    return type;
  }
  return 'text';
};

const mapItem = (id: string, data: DocumentData): QuickDropItem => ({
  id,
  userId: String(data.userId),
  type: normalizeItemType(data.type),
  title: String(data.title),
  url: data.url,
  fileUrl: data.fileUrl,
  content: data.content,
  note: data.note,
  groupId: data.groupId,
  subgroupId: data.subgroupId,
  tags: Array.isArray(data.tags) ? data.tags : [],
  isStarred: Boolean(data.isStarred),
  isArchived: Boolean(data.isArchived),
  reminderAt: data.reminderAt,
  createdAt: String(data.createdAt),
  updatedAt: String(data.updatedAt),
});

export const getItems = async (): Promise<QuickDropItem[]> => {
  const userId = getUserId();
  const snapshot = await getDocs(query(itemsCollection(userId), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((itemDoc) => mapItem(itemDoc.id, itemDoc.data()));
};

export const createItem = async (input: CreateItemInput): Promise<QuickDropItem> => {
  const userId = getUserId();
  const now = new Date().toISOString();
  const payload = removeUndefined({
    ...input,
    userId,
    createdAt: now,
    updatedAt: now,
  });
  const itemDoc = await addDoc(itemsCollection(userId), payload);
  return { ...payload, id: itemDoc.id };
};

export const updateItem = async (
  itemId: string,
  input: UpdateItemInput
): Promise<void> => {
  const userId = getUserId();
  const { db } = getFirebaseServices();
  await updateDoc(doc(db, 'users', userId, 'items', itemId), removeUndefined({
    ...input,
    updatedAt: new Date().toISOString(),
  }));
};

export const archiveItem = async (itemId: string): Promise<void> => {
  await updateItem(itemId, { isArchived: true });
};

export const deleteItem = async (itemId: string): Promise<void> => {
  const userId = getUserId();
  const { db } = getFirebaseServices();
  await deleteDoc(doc(db, 'users', userId, 'items', itemId));
};
