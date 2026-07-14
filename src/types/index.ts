export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'image' | 'pdf' | 'text' | 'url';
  size?: string;
  content?: string;
  url?: string;
  description?: string;
  timestamp: number;
  status?: 'review' | 'done' | 'archived';
  reminderDate?: string;
  groupId?: string;
  subgroupId?: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: Date;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  status?: 'review' | 'done' | 'archived';
  reminderDate?: string;
  groupId?: string;
  subgroupId?: string;
}

export type QuickDropItemType = 'link' | 'note' | 'image' | 'pdf' | 'document' | 'text';

export interface QuickDropItem {
  id: string;
  userId: string;
  type: QuickDropItemType;
  title: string;
  url?: string;
  fileUrl?: string;
  content?: string;
  note?: string;
  groupId?: string;
  subgroupId?: string;
  tags: string[];
  isStarred: boolean;
  isArchived: boolean;
  reminderAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuickDropGroup {
  id: string;
  userId: string;
  name: string;
  parentGroupId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuickDropUser {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

export interface UploadResult {
  fileUrl: string;
  storagePath?: string;
  provider: 'local' | 'signed-url' | 'cloudinary' | 'firebase-storage';
}
