import type { FileItem, Task, NoteItem } from '../types';
import { getFileType, formatFileSize } from '../utils/helpers';
import { getBackendClient } from './backend/backendClient';
import { createCloudFile, createCloudNote, createCloudUrl } from './backend/firebaseBackend';

export class DataService {
  // Load all data
  static async loadAllData(): Promise<{ files: FileItem[], tasks: Task[], notes: NoteItem[] }> {
    return getBackendClient().loadAllData();
  }

  // Sync / Save all data (for local storage fallback or bulk sync)
  static async syncData(files: FileItem[], tasks: Task[], notes: NoteItem[]): Promise<void> {
    return getBackendClient().syncData({ files, tasks, notes });
  }

  // Create/Add a File
  static async addFile(file: File, fileContent: string): Promise<FileItem> {
    const newItem: FileItem = {
      id: Date.now().toString() + Math.random(),
      name: file.name,
      type: getFileType(file.name),
      content: fileContent,
      size: formatFileSize(file.size),
      timestamp: Date.now()
    };

    const backend = getBackendClient();
    if (backend.mode === 'firebase') {
      return createCloudFile(file, fileContent, newItem);
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

    const backend = getBackendClient();
    if (backend.mode === 'firebase') {
      return createCloudUrl(newItem);
    }

    return newItem;
  }

  // Delete a File or URL item
  static async deleteFile(fileId: string): Promise<void> {
    await getBackendClient().deleteItem(fileId);
  }

  // Create/Add a Note
  static async addNoteItem(title: string, content: string): Promise<NoteItem> {
    const newItem: NoteItem = {
      id: Date.now().toString() + Math.random(),
      title: title.trim() || 'Untitled Note',
      content: content,
      timestamp: Date.now()
    };

    const backend = getBackendClient();
    if (backend.mode === 'firebase') {
      return createCloudNote(newItem);
    }

    return newItem;
  }

  // Delete a Note
  static async deleteNote(noteId: string): Promise<void> {
    await getBackendClient().deleteItem(noteId);
  }

  // Create/Add a Task
  static async addTaskItem(title: string): Promise<Task> {
    const newItem: Task = {
      id: Date.now().toString() + Math.random(),
      title: title.trim(),
      completed: false,
      date: new Date()
    };

    return newItem;
  }

  // Toggle a Task's status
  static async toggleTask(taskId: string, completed: boolean): Promise<void> {
    void taskId;
    void completed;
  }

  // Delete a Task
  static async deleteTask(taskId: string): Promise<void> {
    void taskId;
  }
}
