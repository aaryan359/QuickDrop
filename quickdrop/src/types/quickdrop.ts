export type QuickDropItemType = 'url' | 'text' | 'note' | 'image' | 'pdf' | 'file' | 'task';

export type QuickDropItem = {
  id: string;
  userId: string;
  type: QuickDropItemType;
  title: string;
  url?: string;
  fileUrl?: string;
  content?: string;
  note?: string;
  tags: string[];
  isStarred: boolean;
  isArchived: boolean;
  isCompleted?: boolean;
  reminderAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateQuickDropItem = Omit<
  QuickDropItem,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;
