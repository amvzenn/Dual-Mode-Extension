let trackedPopupIds = new Set();
let port = null;

chrome.runtime.onConnect.addListener((p) => {
  port = p;
  console.log("🔌 Port connected:", port.name);

  port.onMessage.addListener((msg) => {
    console.log("📨 Message from popup:", msg);

    if (msg.action === "openPopup" && msg.url) {
      handleOpenPopup(msg.url);
    }

    if (msg.type === "SET_POPUP_ID" && msg.windowId) {
      chrome.windows.get(msg.windowId, {}, (win) => {
        if (chrome.runtime.lastError || !win) {
          console.warn("❌ Failed to track popup — window may have closed early:", msg.windowId);
        } else {
          trackedPopupIds.add(msg.windowId);
          console.log("🆔 Added popup ID to tracking set:", msg.windowId);
        }
      });
    }

    if (msg.type === "POPUP_UI_CLOSED") {
      console.log("🔒 popup.html closed — attempting to close all popups:", [...trackedPopupIds]);
      closeAllTrackedPopups();
    }
  });

  port.onDisconnect.addListener(() => {
    console.log("💥 Port disconnected — cleaning up popups if needed");
    closeAllTrackedPopups();
    port = null;
  });
});

// 🔍 Detect when user clicks outside the extension popup
chrome.windows.onFocusChanged.addListener((focusedWindowId) => {
  if (focusedWindowId === chrome.windows.WINDOW_ID_NONE) return;
  chrome.windows.getCurrent((currentWin) => {
    if (!currentWin || currentWin.type !== "popup") return;
    if (!trackedPopupIds.has(currentWin.id)) return;
    setTimeout(() => {
      if (port) {
        port.postMessage({ type: "POPUP_UI_CLOSED" });
      }
    }, 150);
  });
});

function handleOpenPopup(url) {
  openNewPopup(url);
}

function openNewPopup(url) {
  chrome.windows.create(
    {
      url,
      type: "popup",
      width: 1000,
      height: 800,
      focused: true,
    },
    (win) => {
      if (win && win.id != null) {
        trackedPopupIds.add(win.id);
        console.log("🎕 New popup opened with ID:", win.id);
      }
    }
  );
}

function closeAllTrackedPopups() {
  const ids = Array.from(trackedPopupIds);
  trackedPopupIds.clear();

  Promise.allSettled(
    ids.map(
      (id) =>
        new Promise((resolve) => {
          chrome.windows.remove(id, () => {
            if (chrome.runtime.lastError) {
              console.warn(`⚠️ Error closing popup ${id}:`, chrome.runtime.lastError.message);
              resolve(false);
            } else {
              console.log("🪯 Popup closed:", id);
              resolve(true);
            }
          });
        })
    )
  ).then((results) => {
    const failed = results.filter((r) => !r.value).length;
    if (failed > 0) {
      console.warn(`⚠️ ${failed} popup(s) may not have closed properly.`);
    }
  });
}
