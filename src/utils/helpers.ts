import type { FileItem } from '../types';

export const getFileType = (fileName: string): FileItem['type'] => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
  if (extension === 'pdf') return 'pdf';
  return 'file';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isValidUrl = (str: string): boolean => {
  return /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(str);
};

export const getTodayDateFormatted = (): string => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

export const showNotification = (message: string): void => {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 2500);
};

export const copyToClipboard = async (content: string, showNotificationFn: (m: string) => void): Promise<void> => {
  try {
    await navigator.clipboard.writeText(content);
    showNotificationFn('Copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy:', err);
    showNotificationFn('Failed to copy');
  }
};

export const downloadFile = (file: FileItem, showNotificationFn: (m: string) => void): void => {
  const link = document.createElement('a');
  link.href = file.content || '';
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showNotificationFn('Download started!');
};

export const openUrl = (url: string): void => {
  let target = url;
  if (!/^https?:\/\//i.test(url)) {
    target = 'https://' + url;
  }
  window.open(target, '_blank');
};

export const formatReminder = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (isToday) {
    return `Today at ${timeStr}`;
  } else if (isTomorrow) {
    return `Tomorrow at ${timeStr}`;
  } else {
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
  }
};

