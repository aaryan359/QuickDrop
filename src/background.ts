// Background script for data persistence and context menus
declare const chrome: any;

type ReminderItem = {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  reminderDate?: string;
  type?: string;
};

const REMINDER_PREFIX = 'quickdrop-reminder:';

const getReminderTitle = (item: ReminderItem): string => {
  return item.title || item.description || item.name || 'Saved QuickDrop item';
};

const createQuickDropNotification = (
  id: string,
  title: string,
  message: string,
  callback?: (result: { success: boolean; message: string }) => void
) => {
  chrome.notifications.getPermissionLevel((level: string) => {
    if (level !== 'granted') {
      const permissionMessage = `Chrome notification permission is ${level}.`;
      console.error('QuickDrop notification blocked:', permissionMessage);
      callback?.({ success: false, message: permissionMessage });
      return;
    }

    chrome.notifications.create(id, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icon-128.png'),
      title,
      message,
      priority: 2,
      requireInteraction: true,
    }, (notificationId: string) => {
      const error = chrome.runtime.lastError;
      if (error) {
        console.error('QuickDrop notification failed:', error.message);
        callback?.({ success: false, message: error.message || 'Notification failed.' });
        return;
      }

      callback?.({
        success: true,
        message: `Notification created: ${notificationId}`,
      });
    });
  });
};

const scheduleReminderAlarms = (files: ReminderItem[], notes: ReminderItem[]) => {
  const items = [...files, ...notes].filter((item) => item.reminderDate);

  chrome.alarms.getAll((alarms: any[]) => {
    alarms
      .filter((alarm) => String(alarm.name).startsWith(REMINDER_PREFIX))
      .forEach((alarm) => chrome.alarms.clear(alarm.name));

    items.forEach((item) => {
      const when = new Date(item.reminderDate || '').getTime();
      if (!Number.isFinite(when) || when <= Date.now()) return;

      chrome.alarms.create(`${REMINDER_PREFIX}${item.id}`, { when });
    });

    chrome.storage.local.set({
      reminderItems: items.reduce((map: Record<string, ReminderItem>, item) => {
        map[item.id] = item;
        return map;
      }, {}),
    });
  });
};

const restoreReminderAlarms = () => {
  chrome.storage.local.get(['files', 'notes'], (result: any) => {
    scheduleReminderAlarms(result.files || [], result.notes || []);
  });
};

const removeLegacyPageWidget = () => {
  if (!chrome.tabs || !chrome.scripting) return;

  chrome.tabs.query({}, (tabs: any[]) => {
    tabs.forEach((tab) => {
      if (!tab.id || !tab.url || !/^https?:\/\//i.test(tab.url)) return;

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          document.getElementById('quickdrop-root')?.remove();
        },
      }, () => {
        void chrome.runtime.lastError;
      });
    });
  });
};

chrome.runtime.onInstalled.addListener(() => {
  console.log('QuickDrop extension installed');
  restoreReminderAlarms();
  removeLegacyPageWidget();
  
  // Create context menu items for different contexts
  chrome.contextMenus.create({
    id: 'save-image',
    title: 'Save Image to QuickDrop',
    contexts: ['image']
  });

  chrome.contextMenus.create({
    id: 'save-text',
    title: 'Save Selection to QuickDrop',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'save-link',
    title: 'Save Link to QuickDrop',
    contexts: ['link']
  });

  chrome.contextMenus.create({
    id: 'save-page',
    title: 'Save Page Link to QuickDrop',
    contexts: ['page']
  });
});

chrome.runtime.onStartup.addListener(() => {
  restoreReminderAlarms();
  removeLegacyPageWidget();
});

chrome.alarms.onAlarm.addListener((alarm: any) => {
  if (!String(alarm.name).startsWith(REMINDER_PREFIX)) return;

  const itemId = String(alarm.name).replace(REMINDER_PREFIX, '');
  chrome.storage.local.get(['reminderItems'], (result: any) => {
    const item = result.reminderItems?.[itemId];
    if (!item) return;

    createQuickDropNotification(
      `quickdrop-notification:${itemId}`,
      'QuickDrop Reminder',
      getReminderTitle(item)
    );
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info: any, tab: any) => {
  chrome.storage.local.get(['files'], (result: any) => {
    const currentFiles = result.files || [];
    let newItem: any = null;
    let notificationMsg = '';

    const timestamp = Date.now();
    const itemId = timestamp.toString() + Math.random();

    if (info.menuItemId === 'save-image') {
      const srcUrl = info.srcUrl;
      const name = srcUrl.split('/').pop()?.split('?')[0] || 'web-image.png';
      newItem = {
        id: itemId,
        name: name,
        type: 'image',
        content: srcUrl,
        url: srcUrl,
        size: 'Web Link',
        timestamp
      };
      notificationMsg = 'Image saved to QuickDrop!';
    } else if (info.menuItemId === 'save-text') {
      const selectionText = info.selectionText;
      const name = selectionText.length > 30 ? selectionText.substring(0, 30) + '...' : selectionText;
      newItem = {
        id: itemId,
        name: name,
        type: 'text',
        content: selectionText,
        size: 'Snippet',
        timestamp
      };
      notificationMsg = 'Text snippet saved!';
    } else if (info.menuItemId === 'save-link') {
      const linkUrl = info.linkUrl;
      newItem = {
        id: itemId,
        name: linkUrl,
        type: 'url',
        url: linkUrl,
        description: 'Saved Link',
        timestamp
      };
      notificationMsg = 'Link saved to QuickDrop!';
    } else if (info.menuItemId === 'save-page') {
      const pageUrl = info.pageUrl;
      const title = tab?.title || 'Saved Page';
      newItem = {
        id: itemId,
        name: title,
        type: 'url',
        url: pageUrl,
        description: 'Saved Page Link',
        timestamp
      };
      notificationMsg = 'Page saved to QuickDrop!';
    }

    if (newItem) {
      const updatedFiles = [newItem, ...currentFiles];
      chrome.storage.local.set({ files: updatedFiles }, () => {
        createQuickDropNotification(`quickdrop-save:${itemId}`, 'QuickDrop', notificationMsg);
      });
    }
  });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request: any, _sender: any, sendResponse: any) => {
  if (request.type === 'SAVE_DATA') {
    chrome.storage.local.set({
      files: request.data.files,
      tasks: request.data.tasks,
      notes: request.data.notes || []
    }, () => {
      scheduleReminderAlarms(request.data.files || [], request.data.notes || []);
      sendResponse({ success: true });
    });
    return true; // Keep the message channel open for async response
  }
  
  if (request.type === 'LOAD_DATA') {
    chrome.storage.local.get(['files', 'tasks', 'notes'], (result: any) => {
      sendResponse({
        files: result.files || [],
        tasks: result.tasks || [],
        notes: result.notes || []
      });
    });
    return true; // Keep the message channel open for async response
  }

  if (request.type === 'SCHEDULE_REMINDERS') {
    scheduleReminderAlarms(request.data.files || [], request.data.notes || []);
    sendResponse({ success: true });
    return true;
  }

  if (request.type === 'TEST_NOTIFICATION') {
    createQuickDropNotification(
      `quickdrop-test:${Date.now()}`,
      'QuickDrop Test',
      'Chrome notifications are working.',
      sendResponse
    );
    return true;
  }
});
