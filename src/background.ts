// Background script for data persistence
declare const chrome: any

chrome.runtime.onInstalled.addListener(() => {
  console.log('QuickDrop extension installed')
})

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request: any, _sender: any, sendResponse: any) => {
  if (request.type === 'SAVE_DATA') {
    chrome.storage.local.set({
      files: request.data.files,
      tasks: request.data.tasks
    }, () => {
      sendResponse({ success: true })
    })
    return true // Keep the message channel open for async response
  }
  
  if (request.type === 'LOAD_DATA') {
    chrome.storage.local.get(['files', 'tasks'], (result: any) => {
      sendResponse({
        files: result.files || [],
        tasks: result.tasks || []
      })
    })
    return true // Keep the message channel open for async response
  }
}) 