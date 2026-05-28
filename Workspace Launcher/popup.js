// Default mock data to populate on first run
const defaultWorkspaces = [
  { name: "Work Section", urls: ["https://github.com", "https://claude.ai", "https://youtube.com"] },
  { name: "Cinema Section", urls: ["https://netflix.com", "https://youtube.com", "https://hotstar.com"] }
];

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['workspaces'], (result) => {
    let workspaces = result.workspaces;
    if (!workspaces) {
      workspaces = defaultWorkspaces;
      chrome.storage.local.set({ workspaces });
    }
    renderWorkspaces(workspaces);
  });

  document.getElementById('add-workspace-btn').addEventListener('click', addNewWorkspace);
});

function renderWorkspaces(workspaces) {
  const container = document.getElementById('workspace-container');
  container.innerHTML = '';

  workspaces.forEach((ws, wsIndex) => {
    const card = document.createElement('div');
    card.className = 'workspace-card';

    // Shortcut tag label assignment mapping
    const shortcutLabel = wsIndex < 2 ? `Ctrl+Shift+${wsIndex + 1}` : 'No Shortcut';

    card.innerHTML = `
      <div class="workspace-header">
        <input type="text" class="workspace-name" value="${ws.name}" data-index="${wsIndex}">
        <button class="btn danger-btn delete-ws-btn" data-index="${wsIndex}">Delete Workspace</button>
      </div>
      <div class="url-list" id="url-list-${wsIndex}">
        ${ws.urls.map((url, urlIndex) => `
          <div class="url-row">
            <input type="text" class="url-input" value="${url}" data-ws="${wsIndex}" data-url="${urlIndex}">
            <button class="btn remove-url-btn" data-ws="${wsIndex}" data-url="${urlIndex}">✕</button>
          </div>
        `).join('')}
      </div>
      <div class="action-row">
        <div>
          <button class="btn add-url-btn" data-index="${wsIndex}">+ Add Link</button>
          <button class="btn launch-btn" data-index="${wsIndex}" style="background: #e6f4ea; color: #137333; border-color: transparent;">Launch</button>
        </div>
        <span class="shortcut-tag">${shortcutLabel}</span>
      </div>
    `;

    container.appendChild(card);
  });

  attachEventListeners();
}

function attachEventListeners() {
  // Save workspace name edits
  document.querySelectorAll('.workspace-name').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = e.target.dataset.index;
      updateStorage((workspaces) => { workspaces[idx].name = e.target.value; });
    });
  });

  // Save url input modifications
  document.querySelectorAll('.url-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const wsIdx = e.target.dataset.ws;
      const urlIdx = e.target.dataset.url;
      updateStorage((workspaces) => { workspaces[wsIdx].urls[urlIdx] = e.target.value; });
    });
  });

  // Action listeners
  document.querySelectorAll('.add-url-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.dataset.index;
      updateStorage((workspaces) => { workspaces[idx].urls.push(''); });
    });
  });

  document.querySelectorAll('.remove-url-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const wsIdx = e.target.dataset.ws;
      const urlIdx = e.target.dataset.url;
      updateStorage((workspaces) => { workspaces[wsIdx].urls.splice(urlIdx, 1); });
    });
  });

  document.querySelectorAll('.delete-ws-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.dataset.index;
      updateStorage((workspaces) => { workspaces.splice(idx, 1); });
    });
  });

  document.querySelectorAll('.launch-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.dataset.index;
      chrome.storage.local.get(['workspaces'], (result) => {
        const urls = result.workspaces[idx].urls.filter(u => u.trim() !== '');
        if(urls.length > 0) {
          chrome.windows.create({ url: urls[0], focused: true }, (win) => {
            for(let i=1; i<urls.length; i++) {
              chrome.tabs.create({ windowId: win.id, url: urls[i] });
            }
          });
        }
      });
    });
  });
}

function addNewWorkspace() {
  updateStorage((workspaces) => {
    workspaces.push({ name: "New Workspace", urls: ["https://"] });
  });
}

function updateStorage(callback) {
  chrome.storage.local.get(['workspaces'], (result) => {
    let workspaces = result.workspaces || [];
    callback(workspaces);
    chrome.storage.local.set({ workspaces }, () => {
      renderWorkspaces(workspaces);
    });
  });
}