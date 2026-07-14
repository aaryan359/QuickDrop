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
import type { QuickDropGroup } from '../types';
import { getCurrentUser } from './authService';
import { getFirebaseServices } from './firebase';

type CreateGroupInput = Pick<QuickDropGroup, 'name' | 'parentGroupId'>;
type UpdateGroupInput = Partial<CreateGroupInput>;

const getUserId = (): string => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Sign in before syncing QuickDrop groups.');
  }
  return user.id;
};

const groupsCollection = (userId: string) => {
  const { db } = getFirebaseServices();
  return collection(db, 'users', userId, 'groups');
};

const mapGroup = (id: string, data: DocumentData): QuickDropGroup => ({
  id,
  userId: String(data.userId),
  name: String(data.name),
  parentGroupId: data.parentGroupId,
  createdAt: String(data.createdAt),
  updatedAt: String(data.updatedAt),
});

export const getUserGroups = async (): Promise<QuickDropGroup[]> => {
  const userId = getUserId();
  const snapshot = await getDocs(query(groupsCollection(userId), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((groupDoc) => mapGroup(groupDoc.id, groupDoc.data()));
};

export const createGroup = async (input: CreateGroupInput): Promise<QuickDropGroup> => {
  const userId = getUserId();
  const now = new Date().toISOString();
  const payload = {
    ...input,
    userId,
    createdAt: now,
    updatedAt: now,
  };
  const groupDoc = await addDoc(groupsCollection(userId), payload);
  return { ...payload, id: groupDoc.id };
};

export const updateGroup = async (
  groupId: string,
  input: UpdateGroupInput
): Promise<void> => {
  const userId = getUserId();
  const { db } = getFirebaseServices();
  await updateDoc(doc(db, 'users', userId, 'groups', groupId), {
    ...input,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  const userId = getUserId();
  const { db } = getFirebaseServices();
  await deleteDoc(doc(db, 'users', userId, 'groups', groupId));
};
