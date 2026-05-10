// PhishGuard AI - Content Script
// Runs on every webpage - can be extended for auto-scan features

// Currently minimal - just sends page URL to background if needed
chrome.runtime.sendMessage({
  type: "PAGE_LOADED",
  url: window.location.href
});
