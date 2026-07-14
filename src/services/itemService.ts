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

const mapItem = (id: string, data: DocumentData): QuickDropItem => ({
  id,
  userId: String(data.userId),
  type: data.type,
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
  const payload = {
    ...input,
    userId,
    createdAt: now,
    updatedAt: now,
  };
  const itemDoc = await addDoc(itemsCollection(userId), payload);
  return { ...payload, id: itemDoc.id };
};

export const updateItem = async (
  itemId: string,
  input: UpdateItemInput
): Promise<void> => {
  const userId = getUserId();
  const { db } = getFirebaseServices();
  await updateDoc(doc(db, 'users', userId, 'items', itemId), {
    ...input,
    updatedAt: new Date().toISOString(),
  });
};

export const archiveItem = async (itemId: string): Promise<void> => {
  await updateItem(itemId, { isArchived: true });
};

export const deleteItem = async (itemId: string): Promise<void> => {
  const userId = getUserId();
  const { db } = getFirebaseServices();
  await deleteDoc(doc(db, 'users', userId, 'items', itemId));
};
