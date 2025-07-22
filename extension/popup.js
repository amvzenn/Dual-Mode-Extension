// extension/popup.js
console.log("🔧 Popup UI loaded");

const urlInput = document.getElementById("urlInput");
const openBtn = document.getElementById("openBtn");
const iframe = document.getElementById("siteFrame");
const wrapper = document.getElementById("iframeWrapper"); // Corrected: was 'document = document.getElementById'
const iframeLoader = document.getElementById("iframeLoader");
const sizeButtons = document.querySelectorAll("button[data-size]");
const popupWindowButtons = document.querySelectorAll("button[data-popup-size]");
const themeToggle = document.getElementById("themeToggle");

let popupSize = { width: 400, height: 600 };
const port = chrome.runtime.connect({ name: "csp-popup" });

const sizePresets = {
  small: { width: 400, height: 400 },
  medium: { width: 600, height: 500 },
  large: { width: 800, height: 600 },
};

window.BASE_PROXY_URL = location.hostname === "localhost"
  ? "http://localhost:3001"
  : "https://dual-mode-server.zeabur.app";

window.CSP_PROTECTED_DOMAINS = window.CSP_PROTECTED_DOMAINS || [];

port.postMessage({ type: "HELLO" });

// 🔁 Keep port alive
let pingInterval = setInterval(() => port.postMessage({ type: "PING" }), 10000);
port.onDisconnect.addListener(() => clearInterval(pingInterval));

// 📦 Restore state
chrome.storage.local.get(["lastUrl", "popupSize"], (res) => {
  if (res.lastUrl) urlInput.value = res.lastUrl;
  if (res.popupSize) popupSize = res.popupSize;
  resizePopup();
});

// 🧠 Helpers
function normalizeUrl(url) {
  return /^https?:\/\//i.test(url) ? url : "https://" + url;
}

function resizePopup() {
  window.resizeTo(popupSize.width, popupSize.height + 120);
  wrapper.style.height = popupSize.height + "px";
}

// 📦 Save popup size on button click
sizeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    sizeButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");

    const size = btn.dataset.size;
    if (sizePresets[size]) {
      popupSize = sizePresets[size];
      chrome.storage.local.set({ popupSize });
      resizePopup();
    }
  });
});

popupWindowButtons.forEach((btn) =>
  btn.addEventListener("click", async () => { // Added async here
    popupWindowButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");

    let url = normalizeUrl(urlInput.value.trim()); // Normalize URL
    if (!url) return; // Exit if no URL is entered

    // Check if the URL is CSP protected
    const isCSPProtected = await checkCSPViaProxy(url); // Await the CSP check

    if (isCSPProtected) {
      // If CSP protected, open in iframe
      openSiteInIframe(url);
    } else {
      // If not CSP protected, open in popup
      openSiteInPopup(url);
    }
  })
);

// 🔍 CSP detection via HEAD fetch
async function checkCSPViaProxy(url) {
  try {
    // We need to ensure the proxy URL is correctly formed here
    const proxyCheckUrl = `${window.BASE_PROXY_URL}/proxy?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyCheckUrl, { method: "HEAD" });
    return res.headers.get("x-csp-detected") === "true";
  } catch (e) {
    console.warn("🔴 Proxy CSP check failed:", e);
    return false;
  }
}

// 🔓 Open site logic
openBtn.addEventListener("click", async () => { // Added async here
  let url = normalizeUrl(urlInput.value.trim());
  if (!url) return;

  chrome.storage.local.set({ lastUrl: url });
  const domain = new URL(url).hostname;

  chrome.storage.local.get({ cspDomains: [] }, async ({ cspDomains }) => { // Added async here
    const combined = [...new Set([...window.CSP_PROTECTED_DOMAINS, ...cspDomains])];
    const isBlocked = combined.some((d) => domain === d || domain.endsWith("." + d));

    if (isBlocked || await checkCSPViaProxy(url)) { // Await the CSP check
      if (!cspDomains.includes(domain)) {
        cspDomains.push(domain);
        chrome.storage.local.set({ cspDomains });
      }
      console.log(`Attempting to open ${url} in POPUP mode.`); // Debug log
      openSiteInPopup(url);
    } else {
      console.log(`Attempting to open ${url} in IFRAME mode.`); // Debug log
      openSiteInIframe(url);
    }
  });
});

function openSiteInPopup(url) {
  // Ensure iframe and loader are hidden when opening in a popup
  iframe.style.opacity = "0";
  iframe.src = "about:blank"; // Clear iframe content
  iframeLoader.classList.add("hidden"); // Ensure loader is hidden
  iframeLoader.style.opacity = "0"; // Ensure loader is fully transparent

  const selectedBtn = document.querySelector("button[data-popup-size].selected");
  const size = selectedBtn ? sizePresets[selectedBtn.dataset.popupSize] : popupSize;

  chrome.windows.create({ url, type: "popup", ...size, focused: true }, (win) => {
    if (win?.id) {
      port.postMessage({ type: "SET_POPUP_ID", windowId: win.id });
    }
  });
}

function openSiteInIframe(url) {
  console.log(`Executing openSiteInIframe for: ${url}`); // Debug log
  // Show loader for iframe loading
  iframeLoader.classList.remove("hidden"); // Remove 'hidden' class which might set display: none
  iframeLoader.style.display = "flex"; // Explicitly set display to flex
  iframeLoader.offsetHeight; // Force reflow to apply display change before opacity transition
  iframeLoader.style.opacity = "1"; // Start fade-in animation

  // Hide iframe immediately to show loader
  iframe.style.opacity = "0"; 

  port.postMessage({ type: "SWITCH_TO_IFRAME" });
  wrapper.style.display = "block";
  wrapper.style.height = popupSize.height + "px";
  iframe.src = `${window.BASE_PROXY_URL}/proxy?url=${encodeURIComponent(url)}`;
}

iframe.addEventListener("load", () => {
  console.log(`Iframe loaded for: ${iframe.src}`); // Debug log
  // Hide loader after iframe loads
  iframeLoader.style.opacity = "0"; // Start fade-out animation
  setTimeout(() => {
    // Only set display to none after opacity transition is complete
    iframeLoader.style.display = "none"; 
  }, 400); // Match fade duration from CSS

  // Show iframe
  iframe.classList.add("visible"); // Add class for visibility (if needed by CSS)
  iframe.style.opacity = "1"; // Start fade-in animation
});

// 🌗 Theme
chrome.storage.local.get("extensionTheme", ({ extensionTheme }) => {
  const isDark = extensionTheme === "theme-red-black";
  document.body.className = isDark ? "theme-red-black" : "theme-red-white";
  themeToggle.checked = isDark;
});

themeToggle.addEventListener("change", () => {
  const theme = themeToggle.checked ? "theme-red-black" : "theme-red-white";
  document.body.className = theme;
  chrome.storage.local.set({ extensionTheme: theme });
});

// 🔒 Respond to background's close message
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "POPUP_UI_CLOSED") window.close();
});
