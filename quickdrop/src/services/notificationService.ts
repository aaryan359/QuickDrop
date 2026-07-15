import { Alert } from 'react-native';

let loadError: string | null = null;
const reminderTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const getNotificationLoadError = () => {
  return loadError ?? 'Saved. Notifications need a development build on Android.';
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  loadError = 'Notifications need a development build on Android.';
  return false;
};

export const scheduleQuickDropReminder = async ({
  itemId,
  title,
  reminderAt,
}: {
  itemId: string;
  title: string;
  reminderAt: string;
}): Promise<boolean> => {
  const date = new Date(reminderAt);
  if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now()) {
    loadError = 'Reminder time must be in the future.';
    return false;
  }

  const delay = date.getTime() - Date.now();
  const existingTimer = reminderTimers.get(itemId);
  if (existingTimer) clearTimeout(existingTimer);

  const timer = setTimeout(() => {
    Alert.alert('QuickDrop Reminder', title);
    reminderTimers.delete(itemId);
  }, delay);

  reminderTimers.set(itemId, timer);
  loadError = 'Reminder saved. System notifications need a development build on Android.';
  return false;
};
