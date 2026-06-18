// Background script for data persistence
declare const chrome: any

chrome.runtime.onInstalled.addListener(() => {
  console.log('QuickDrop extension installed')
})

// Enable opening the side panel when the user clicks the extension's toolbar icon
if (typeof chrome !== 'undefined' && chrome.sidePanel) {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error: any) => console.error('Error setting side panel behavior:', error));
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request: any, _sender: any, sendResponse: any) => {
  if (request.type === 'SAVE_DATA') {
    chrome.storage.local.set({
      files: request.data.files,
      tasks: request.data.tasks,
      notes: request.data.notes || []
    }, () => {
      sendResponse({ success: true })
    })
    return true // Keep the message channel open for async response
  }
  
  if (request.type === 'LOAD_DATA') {
    chrome.storage.local.get(['files', 'tasks', 'notes'], (result: any) => {
      sendResponse({
        files: result.files || [],
        tasks: result.tasks || [],
        notes: result.notes || []
      })
    })
    return true // Keep the message channel open for async response
  }
}) 