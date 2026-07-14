import { getToken, onMessage, type MessagePayload, type Unsubscribe } from 'firebase/messaging';
import { getFirebaseMessaging } from './firebase';

type ChromeNotificationApi = {
  notifications?: {
    create: (
      id: string,
      options: {
        type: 'basic';
        iconUrl: string;
        title: string;
        message: string;
      }
    ) => void;
  };
};

declare const chrome: ChromeNotificationApi | undefined;

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission !== 'default') {
    return Notification.permission;
  }

  return Notification.requestPermission();
};

export const getMessagingToken = async (): Promise<string | null> => {
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    return null;
  }

  const messaging = await getFirebaseMessaging();
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

  if (!messaging || !vapidKey) {
    return null;
  }

  return getToken(messaging, { vapidKey });
};

export const onForegroundMessage = (
  callback: (payload: MessagePayload) => void
): Promise<Unsubscribe | null> => {
  return getFirebaseMessaging().then((messaging) => {
    return messaging ? onMessage(messaging, callback) : null;
  });
};

export const showChromeNotification = (title: string, message: string): void => {
  if (typeof chrome !== 'undefined' && chrome.notifications) {
    chrome.notifications.create(`quickdrop-${Date.now()}`, {
      type: 'basic',
      iconUrl: 'vite.svg',
      title,
      message,
    });
    return;
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body: message });
  }
};
