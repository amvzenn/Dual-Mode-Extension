// pageswitch.js

document.addEventListener("DOMContentLoaded", () => {
  const mainPage = document.getElementById("mainPage");
  const settingsPage = document.getElementById("settingsPage");
  const settingsBtn = document.getElementById("settingsBtn");
  const backBtn = document.getElementById("backBtn");
  const iframe = document.getElementById("siteFrame");
  const loader = document.getElementById("iframeLoader");
  const openBtn = document.getElementById("openBtn");
  const urlInput = document.getElementById("urlInput");
  

  const fadeDuration = 300;

  const fadeOut = (el, callback) => {
    el.style.transition = `opacity ${fadeDuration}ms ease, transform ${fadeDuration}ms ease`;
    el.style.opacity = "0";
    el.style.transform = "translateX(20px)";
    el.style.pointerEvents = "none";
    setTimeout(() => {
      el.style.display = "none";
      if (callback) callback();
    }, fadeDuration);
  };

  const fadeIn = (el) => {
    el.style.display = "block";
    el.offsetHeight; // Force reflow
    el.style.transition = `opacity ${fadeDuration}ms ease, transform ${fadeDuration}ms ease`;
    el.style.opacity = "1";
    el.style.transform = "translateX(0)";
    el.style.pointerEvents = "auto";
  };

  const fadeSwitch = (elOut, elIn) => {
    fadeOut(elOut, () => fadeIn(elIn));
  };

  // Initial state
  mainPage.style.opacity = "1";
  mainPage.style.transform = "translateX(0)";
  mainPage.style.pointerEvents = "auto";
  mainPage.style.display = "block";

  settingsPage.style.opacity = "0";
  settingsPage.style.transform = "translateX(20px)";
  settingsPage.style.pointerEvents = "none";
  settingsPage.style.display = "none";

  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      fadeSwitch(mainPage, settingsPage);
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      fadeSwitch(settingsPage, mainPage);
    });
  }

  // Loader: ensure hidden at start
  // This part is now primarily controlled by popup.js's openSiteInIframe function
  if (loader) {
    loader.style.display = "none";
    loader.style.opacity = "0";
  }

  // The openBtn logic is now entirely handled in popup.js
  // This block can be removed from pageswitch.js if it's solely for page transitions.
  // If it has other roles, ensure it doesn't conflict with popup.js's site opening logic.
  // For now, I'm commenting it out as popup.js takes over.
  /*
  if (iframe && loader && openBtn && urlInput) {
    openBtn.addEventListener("click", () => {
      const url = urlInput.value.trim();
      if (!url) return;

      // This logic is now handled in popup.js
      // const isPopupUrl = url.includes("example.com/popup"); 

      // if (isPopupUrl) {
      //     console.log(`Opening ${url} in a new window/tab (not showing iframe loader).`);
      //     chrome.tabs.create({ url: url }); 
      //     urlInput.value = ''; 
      //     return; 
      // }

      // Show loader centered
      loader.style.display = "flex";
      loader.style.opacity = "1";

      iframe.classList.remove("visible");
      iframe.style.opacity = "0";

      setTimeout(() => {
        iframe.src = url.startsWith("http") ? url : `https://${url}`;
      }, 100);
    });

    iframe.addEventListener("load", () => {
      // Hide loader
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
      }, 400);

      // Fade in iframe
      iframe.classList.add("visible");
      iframe.style.opacity = "1";
    });
  }
  */
});

function showSettingsPage() {
  mainPage.classList.remove("active");
  settingsPage.classList.add("active");
  document.body.style.height = "750px"; // taller for settings
}

function showMainPage() {
  settingsPage.classList.remove("active");
  mainPage.classList.add("active");
  document.body.style.height = "650px"; // shorter for main
}
