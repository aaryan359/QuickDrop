import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore';
import { getFirebaseServices } from './firebase';
import type { CreateQuickDropItem, QuickDropItem, QuickDropItemType } from '@/types/quickdrop';

const removeUndefined = <T extends Record<string, unknown>>(value: T): T => {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)
  ) as T;
};

const userItems = (userId: string) => {
  const { db } = getFirebaseServices();
  return collection(db, 'users', userId, 'items');
};

const mapItem = (id: string, data: DocumentData): QuickDropItem => ({
  id,
  userId: String(data.userId ?? ''),
  type: (data.type ?? 'text') as QuickDropItemType,
  title: String(data.title ?? 'Untitled'),
  url: data.url,
  fileUrl: data.fileUrl,
  content: data.content,
  note: data.note,
  tags: Array.isArray(data.tags) ? data.tags : [],
  isStarred: Boolean(data.isStarred),
  isArchived: Boolean(data.isArchived),
  isCompleted: Boolean(data.isCompleted),
  reminderAt: data.reminderAt,
  createdAt: String(data.createdAt ?? new Date().toISOString()),
  updatedAt: String(data.updatedAt ?? new Date().toISOString()),
});

export const watchItems = (
  userId: string,
  onItems: (items: QuickDropItem[]) => void,
  onError: (message: string) => void
) => {
  const itemsQuery = query(userItems(userId), orderBy('createdAt', 'desc'));
  return onSnapshot(
    itemsQuery,
    (snapshot) => onItems(snapshot.docs.map((itemDoc) => mapItem(itemDoc.id, itemDoc.data()))),
    (error) => onError(error.message)
  );
};

export const createItem = async (
  userId: string,
  input: CreateQuickDropItem
): Promise<QuickDropItem> => {
  const now = new Date().toISOString();
  const payload = removeUndefined({
    ...input,
    userId,
    createdAt: now,
    updatedAt: now,
  });
  const itemDoc = await addDoc(userItems(userId), payload);
  return { ...payload, id: itemDoc.id };
};

export const updateItem = async (
  userId: string,
  itemId: string,
  input: Partial<CreateQuickDropItem>
) => {
  const { db } = getFirebaseServices();
  await updateDoc(doc(db, 'users', userId, 'items', itemId), removeUndefined({
    ...input,
    updatedAt: new Date().toISOString(),
  }));
};

export const deleteItem = async (userId: string, itemId: string) => {
  const { db } = getFirebaseServices();
  await deleteDoc(doc(db, 'users', userId, 'items', itemId));
};
