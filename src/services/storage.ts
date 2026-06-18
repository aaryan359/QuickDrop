import type { FileItem, Task, NoteItem } from '../types';

declare const chrome: any;

export const saveData = async (files: FileItem[], tasks: Task[], notes: NoteItem[]): Promise<void> => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: 'SAVE_DATA',
          data: { files, tasks, notes }
        }, (response: any) => {
          if (response && response.success) {
            resolve();
          } else {
            reject(new Error('Chrome storage failed'));
          }
        });
      });
    } else {
      localStorage.setItem('quickdrop-files', JSON.stringify(files));
      localStorage.setItem('quickdrop-tasks', JSON.stringify(tasks));
      localStorage.setItem('quickdrop-notes', JSON.stringify(notes));
    }
  } catch (error) {
    console.error('Error saving data:', error);
    try {
      localStorage.setItem('quickdrop-files', JSON.stringify(files));
      localStorage.setItem('quickdrop-tasks', JSON.stringify(tasks));
      localStorage.setItem('quickdrop-notes', JSON.stringify(notes));
    } catch (localError) {
      console.error('localStorage also failed:', localError);
    }
  }
};

export const loadData = async (): Promise<{ files: FileItem[], tasks: Task[], notes: NoteItem[] }> => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: 'LOAD_DATA'
        }, (response: any) => {
          if (response) {
            const files = (response.files || []).map((file: any) => ({
              ...file,
              timestamp: file.timestamp || Date.now()
            }));
            const tasks = (response.tasks || []).map((task: any) => ({
              ...task,
              date: new Date(task.date)
            }));
            const notes = (response.notes || []).map((note: any) => ({
              ...note,
              timestamp: note.timestamp || Date.now()
            }));
            resolve({ files, tasks, notes });
          } else {
            reject(new Error('Chrome storage failed'));
          }
        });
      });
    } else {
      const savedFiles = localStorage.getItem('quickdrop-files');
      const savedTasks = localStorage.getItem('quickdrop-tasks');
      const savedNotes = localStorage.getItem('quickdrop-notes');
      
      const files = savedFiles ? JSON.parse(savedFiles).map((file: any) => ({
        ...file,
        timestamp: file.timestamp || Date.now()
      })) : [];
      
      const tasks = savedTasks ? JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        date: new Date(task.date)
      })) : [];
      
      const notes = savedNotes ? JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        timestamp: note.timestamp || Date.now()
      })) : [];
      
      return { files, tasks, notes };
    }
  } catch (error) {
    console.error('Error loading data:', error);
    try {
      const savedFiles = localStorage.getItem('quickdrop-files');
      const savedTasks = localStorage.getItem('quickdrop-tasks');
      const savedNotes = localStorage.getItem('quickdrop-notes');
      
      const files = savedFiles ? JSON.parse(savedFiles).map((file: any) => ({
        ...file,
        timestamp: file.timestamp || Date.now()
      })) : [];
      
      const tasks = savedTasks ? JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        date: new Date(task.date)
      })) : [];
      
      const notes = savedNotes ? JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        timestamp: note.timestamp || Date.now()
      })) : [];
      
      return { files, tasks, notes };
    } catch (localError) {
      console.error('localStorage also failed:', localError);
      return { files: [], tasks: [], notes: [] };
    }
  }
};
