import type { FileItem, Task, NoteItem } from '../types';
import { saveData, loadData } from './storage';

// Set this to your backend URL when ready, or configure Firebase here.
const API_BASE_URL = '';

export class DataService {
  // Load all data
  static async loadAllData(): Promise<{ files: FileItem[], tasks: Task[], notes: NoteItem[] }> {
    if (API_BASE_URL) {
      const res = await fetch(`${API_BASE_URL}/all`);
      return res.json();
    }
    return loadData();
  }

  // Sync / Save all data (for local storage fallback or bulk sync)
  static async syncData(files: FileItem[], tasks: Task[], notes: NoteItem[]): Promise<void> {
    if (API_BASE_URL) {
      await fetch(`${API_BASE_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files, tasks, notes })
      });
      return;
    }
    return saveData(files, tasks, notes);
  }

  // Create/Add a File
  static async addFile(file: File, fileContent: string): Promise<FileItem> {
    const getFileType = (name: string): 'file' | 'image' | 'pdf' | 'text' | 'url' => {
      const ext = name.split('.').pop()?.toLowerCase();
      if (!ext) return 'file';
      if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'image';
      if (ext === 'pdf') return 'pdf';
      if (['txt', 'md', 'json', 'js', 'html', 'css'].includes(ext)) return 'text';
      return 'file';
    };

    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const newItem: FileItem = {
      id: Date.now().toString() + Math.random(),
      name: file.name,
      type: getFileType(file.name),
      content: fileContent,
      size: formatFileSize(file.size),
      timestamp: Date.now()
    };

    if (API_BASE_URL) {
      const res = await fetch(`${API_BASE_URL}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      return res.json();
    }

    return newItem;
  }

  // Create/Add a URL snippet
  static async addUrlItem(
    url: string, 
    description: string,
    status?: 'review' | 'done' | 'archived',
    reminderDate?: string
  ): Promise<FileItem> {
    const newItem: FileItem = {
      id: Date.now().toString() + Math.random(),
      name: url.trim(),
      type: 'url',
      url: url.trim(),
      description: description.trim() || 'Text Snippet',
      timestamp: Date.now(),
      status: status || 'review',
      reminderDate
    };

    if (API_BASE_URL) {
      const res = await fetch(`${API_BASE_URL}/snippets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      return res.json();
    }

    return newItem;
  }

  // Delete a File or URL item
  static async deleteFile(fileId: string): Promise<void> {
    if (API_BASE_URL) {
      await fetch(`${API_BASE_URL}/files/${fileId}`, {
        method: 'DELETE'
      });
    }
  }

  // Create/Add a Note
  static async addNoteItem(title: string, content: string): Promise<NoteItem> {
    const newItem: NoteItem = {
      id: Date.now().toString() + Math.random(),
      title: title.trim() || 'Untitled Note',
      content: content,
      timestamp: Date.now()
    };

    if (API_BASE_URL) {
      const res = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      return res.json();
    }

    return newItem;
  }

  // Delete a Note
  static async deleteNote(noteId: string): Promise<void> {
    if (API_BASE_URL) {
      await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'DELETE'
      });
    }
  }

  // Create/Add a Task
  static async addTaskItem(title: string): Promise<Task> {
    const newItem: Task = {
      id: Date.now().toString() + Math.random(),
      title: title.trim(),
      completed: false,
      date: new Date()
    };

    if (API_BASE_URL) {
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      return res.json();
    }

    return newItem;
  }

  // Toggle a Task's status
  static async toggleTask(taskId: string, completed: boolean): Promise<void> {
    if (API_BASE_URL) {
      await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
    }
  }

  // Delete a Task
  static async deleteTask(taskId: string): Promise<void> {
    if (API_BASE_URL) {
      await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE'
      });
    }
  }
}
