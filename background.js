// background.js - Service worker for LinkedIn Job Copilot AI

chrome.runtime.onInstalled.addListener(() => {
  console.log("LinkedIn Job Copilot AI extension installed.");
  // Configure side panel to open when clicking extension icon
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
      console.error("Failed to set side panel behavior:", error);
    });
  }
});

// Listener for messages between content script and sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_SIDEPANEL" && sender.tab) {
    if (chrome.sidePanel && chrome.sidePanel.open) {
      chrome.sidePanel.open({ tabId: sender.tab.id });
    }
  }
  return true;
});
