// Helper function to launch a workspace's URLs
function launchWorkspace(urls) {
  if (!urls || urls.length === 0) return;
  
  // Open the first URL in a new window, then loop through the rest
  chrome.windows.create({ url: urls[0], focused: true }, (window) => {
    for (let i = 1; i < urls.length; i++) {
      chrome.tabs.create({ windowId: window.id, url: urls[i] });
    }
  });
}

// Listen for global keyboard shortcut commands
chrome.commands.onCommand.addListener((command) => {
  chrome.storage.local.get(['workspaces'], (result) => {
    const workspaces = result.workspaces || [];
    
    if (command === "launch_workspace_1" && workspaces[0]) {
      launchWorkspace(workspaces[0].urls);
    } else if (command === "launch_workspace_2" && workspaces[1]) {
      launchWorkspace(workspaces[1].urls);
    }
  });
});