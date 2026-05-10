// PhishGuard AI - Background Service Worker
// Handles background tasks for the extension

chrome.runtime.onInstalled.addListener(() => {
  console.log("PhishGuard AI Extension installed!");
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_CURRENT_TAB") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ url: tabs[0]?.url || "" });
    });
    return true; // Keep message channel open for async response
  }
});
