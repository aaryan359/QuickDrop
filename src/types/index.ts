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
}
