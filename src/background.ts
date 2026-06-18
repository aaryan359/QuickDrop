// Background script for data persistence and context menus
declare const chrome: any;

chrome.runtime.onInstalled.addListener(() => {
  console.log('QuickDrop extension installed');
  
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
        // Send a notification message to the active tab's content script
        if (tab && tab.id) {
          chrome.tabs.sendMessage(tab.id, { 
            type: 'SHOW_NOTIFICATION', 
            message: notificationMsg 
          }, () => {
            // Ignore runtime errors if no content script is loaded on the tab
            const lastError = chrome.runtime.lastError;
            if (lastError) {
              console.log('Notification skipped (content script not ready)');
            }
          });
        }
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
});