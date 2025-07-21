// extension/popup.js
console.log("🔧 Popup UI loaded");

const urlInput = document.getElementById("urlInput");
const openBtn = document.getElementById("openBtn");
const iframe = document.getElementById("siteFrame");
const wrapper = document.getElementById("iframeWrapper");
const iframeLoader = document.getElementById("iframeLoader");
const sizeButtons = document.querySelectorAll("button[data-size]");
const popupWindowButtons = document.querySelectorAll("button[data-popup-size]");
const themeToggle = document.getElementById("themeToggle");

let openedPopupId = null;
let popupSize = { width: 400, height: 600 };

window.BASE_PROXY_URL = location.hostname === "localhost"
  ? "http://localhost:3001"
  : "https://dual-mode-server.zeabur.app";

const sizePresets = {
  small: { width: 400, height: 400 },
  medium: { width: 600, height: 500 },
  large: { width: 800, height: 600 },
};

const popupWindowPresets = {
  small: { width: 400, height: 400 },
  medium: { width: 600, height: 500 },
  large: { width: 800, height: 600 },
};

const port = chrome.runtime.connect({ name: "csp-popup" });
port.postMessage({ type: "HELLO" });

function normalizeUrl(url) {
  return /^https?:\/\//i.test(url) ? url : "https://" + url;
}

function openSiteInPopup(url) {
  port.postMessage({ type: "SWITCH_TO_POPUP" });
  const selectedPopupBtn = document.querySelector("button[data-popup-size].selected");
  const preset = selectedPopupBtn ? popupWindowPresets[selectedPopupBtn.dataset.popupSize] : popupSize;

  chrome.windows.create({ url, type: "popup", ...preset, focused: true }, (win) => {
    openedPopupId = win.id;
    port.postMessage({ type: "SET_POPUP_ID", windowId: win.id });
  });
}

function closeAnyOpenPopup() {
  port.postMessage({ type: "POPUP_UI_CLOSED" });
}

chrome.storage.local.get(["lastUrl", "popupSize"], (res) => {
  if (res.lastUrl) urlInput.value = res.lastUrl;
  if (res.popupSize) popupSize = res.popupSize;

  window.resizeTo(popupSize.width, popupSize.height + 120);
  wrapper.style.display = "block";
  wrapper.style.width = "100%";
  wrapper.style.height = popupSize.height + "px";
  wrapper.style.overflow = "hidden";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
});

sizeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    sizeButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");

    const size = btn.dataset.size;
    if (sizePresets[size]) {
      popupSize = sizePresets[size];
      chrome.storage.local.set({ popupSize });

      window.resizeTo(popupSize.width, popupSize.height + 120);
      wrapper.style.display = "block";
      wrapper.style.width = "100%";
      wrapper.style.height = popupSize.height + "px";
      wrapper.style.overflow = "hidden";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
    }
  });
});

popupWindowButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    popupWindowButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
  });
});

async function checkCSPViaProxy(url) {
  const proxyUrl = `${window.BASE_PROXY_URL}/proxy?url=${encodeURIComponent(url)}`;
  try {
    const res = await fetch(proxyUrl, { method: "HEAD" });
    const csp = res.headers.get("x-csp-detected");
    return csp === "true";
  } catch (e) {
    console.warn("🔴 Failed to check CSP:", e);
    return false;
  }
}

window.CSP_PROTECTED_DOMAINS = window.CSP_PROTECTED_DOMAINS || [];

openBtn.addEventListener("click", async () => {
  let url = urlInput.value.trim();
  if (!url) return;
  iframeLoader.style.display = "block";
  url = normalizeUrl(url);
  chrome.storage.local.set({ lastUrl: url });
  const domain = new URL(url).hostname;

  chrome.storage.local.get({ cspDomains: [] }, async (res) => {
    const userCsp = res.cspDomains || [];
    const combined = [...new Set(window.CSP_PROTECTED_DOMAINS.concat(userCsp))];
    const isBlocked = combined.some((d) => domain === d || domain.endsWith("." + d));

    if (isBlocked) return openSiteInPopup(url);

    const actuallyBlocked = await checkCSPViaProxy(url);
    if (actuallyBlocked) {
      userCsp.push(domain);
      chrome.storage.local.set({ cspDomains: [...new Set(userCsp)] });
      openSiteInPopup(url);
    } else {
      closeAnyOpenPopup();
      port.postMessage({ type: "SWITCH_TO_IFRAME" });
      wrapper.style.display = "block";
      wrapper.style.width = "100%";
      wrapper.style.height = popupSize.height + "px";
      wrapper.style.overflow = "hidden";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.src = `${window.BASE_PROXY_URL}/proxy?url=${encodeURIComponent(url)}`;
    }
  });
});

// 🌗 Theme toggle logic
chrome.storage.local.get("extensionTheme", (data) => {
  if (data.extensionTheme === "theme-red-black") {
    document.body.className = "theme-red-black";
    themeToggle.checked = true;
  } else {
    document.body.className = "theme-red-white";
    themeToggle.checked = false;
  }
});

themeToggle.addEventListener("change", () => {
  const theme = themeToggle.checked ? "theme-red-black" : "theme-red-white";
  document.body.className = theme;
  chrome.storage.local.set({ extensionTheme: theme });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "POPUP_UI_CLOSED") {
    window.close();
  }
});

iframe.addEventListener("load", () => {
  iframeLoader.style.display = "none";
});
