let trackedPopupIds = new Set();
let port = null;

chrome.runtime.onConnect.addListener((p) => {
  port = p;
  console.log("🔌 Connected:", p.name);

  p.onMessage.addListener((msg) => {
    if (msg.action === "openPopup" && msg.url) openNewPopup(msg.url);
    if (msg.type === "SET_POPUP_ID" && msg.windowId) trackPopup(msg.windowId);
    if (msg.type === "POPUP_UI_CLOSED") closeAllTrackedPopups();
    if (msg.type === "PING") console.log("📡 Ping received");
  });

  p.onDisconnect.addListener(() => {
    console.log("💥 Port disconnected");
    closeAllTrackedPopups();
    port = null;
  });
});

function trackPopup(windowId) {
  chrome.windows.get(windowId, {}, (win) => {
    if (!win || chrome.runtime.lastError) {
      console.warn("❌ Failed to track popup:", windowId);
    } else {
      trackedPopupIds.add(windowId);
      console.log("🆔 Tracking popup:", windowId);
    }
  });
}

chrome.windows.onFocusChanged.addListener((focusedId) => {
  if (focusedId === chrome.windows.WINDOW_ID_NONE) return;
  chrome.windows.get(focusedId, {}, (win) => {
    if (win?.type === "popup" && trackedPopupIds.has(win.id)) {
      setTimeout(() => port?.postMessage({ type: "POPUP_UI_CLOSED" }), 150);
    }
  });
});

function openNewPopup(url) {
  chrome.windows.create(
    { url, type: "popup", width: 1000, height: 800, focused: true },
    (win) => {
      if (win?.id) {
        trackedPopupIds.add(win.id);
        console.log("🎕 Popup opened:", win.id);
      }
    }
  );
}

function closeAllTrackedPopups() {
  const ids = Array.from(trackedPopupIds);
  trackedPopupIds.clear();

  Promise.allSettled(ids.map((id) =>
    new Promise((resolve) => {
      chrome.windows.remove(id, () => {
        if (chrome.runtime.lastError) {
          console.warn(`⚠️ Couldn't close ${id}:`, chrome.runtime.lastError.message);
        } else {
          console.log("🪯 Closed popup:", id);
        }
        resolve(true);
      });
    })
  ));
}
