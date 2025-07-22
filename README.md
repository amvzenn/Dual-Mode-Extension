# 🔁 Dual Mode Extension & Proxy Server

A Chrome extension with a lightweight proxy server that enables fallback popups for websites that block iframe embedding. Includes advanced theme support and a modern, animated UI.

---

## 📁 Project Structure

```
.
├── extension/             # Chrome extension UI & logic
│   ├── background.js          # Background service worker (extension lifecycle)
│   ├── config.js              # Global configuration values
│   ├── cookies.js             # Manages cookies and site data
│   ├── dark_theme.css         # Dedicated dark mode styles
│   ├── history.js             # (Planned) History management
│   ├── icons/                 # Extension icons (e.g., gear, back)
│   ├── lava_lamp.css          # Styling for animated lava lamp background
│   ├── lava_lamp_animation.js # Lava lamp animation JS
│   ├── logic.js               # (Planned) Core logic
│   ├── manifest.json          # Chrome Extension manifest (v3)
│   ├── pageswitch.js          # Page switching logic
│   ├── popup.html             # UI: input, theme toggle, iframe container
│   ├── popup.js               # Logic: URL handling, fallback, theme, proxy
│   └── style.css              # Base styling, layout, animations
│
└── proxy-server/          # Backend proxy (Zeabur-hosted)
    ├── server.js              # Express server: proxy, CSP stripping, theme injection
    ├── package.json           # Node.js dependencies
    ├── package-lock.json      # Dependency lock
    └── zbpack.json            # Zeabur deployment config
```

---

## 🌐 Proxy Server (proxy-server/server.js)

**Live:** [https://dual-mode-server.zeabur.app](https://dual-mode-server.zeabur.app)

### Features:

* Proxies all URLs
* Supports GET and HEAD (for CSP checks)
* Dynamically injects theme CSS (light/dark)

### Local Setup:

```bash
cd proxy-server
npm install
node server.js
```

Update `BASE_PROXY_URL` in `extension/popup.js`:

```js
window.BASE_PROXY_URL = location.hostname === "localhost"
  ? "http://localhost:3001"
  : "https://your-deployment-url"; //Replace with local host if you want to host locally
```

## 🧰 Chrome Extension

### Key Files:

#### `popup.html`

* Input, theme toggle, iframe container
* Back/Settings icons

#### `popup.js`

* URL normalization (`https://` prefix)
* CSP detection
* Popup fallback if iframe fails
* Saves user preferences (theme, size)

#### `style.css`

* Light/Dark theme UI
* Custom scrollbars
* Smooth transitions, shadows

#### `dark_theme.css`

* Aggressive dark styling
* Consistent red-tinted themes
* Supports animated backgrounds

#### `cookies.js`

* Clears cookies and login data per site

#### `background.js`

* Listens for popup events
* Manages opened popup windows

---

## 🛠️ Installation & Usage

1. Go to **Releases** tab
2. Download and unzip the latest release
3. Open `chrome://extensions`
4. Enable **Developer Mode**
5. Click **Load unpacked** and select `extension/`
6. (Optional) Start local proxy (see above)

---

## ✅ Features

* 🌃 Light/Dark theme toggle with smooth animations
* 🔌 Auto-popup fallback for iframe-blocked sites (CSP detection)
* 🔗 Proxy-injected dark/light CSS into websites
* 📏 URL normalization (auto-prepend protocol)
* 💪 Resizable popup buttons (Compact, Medium, Full)
* 🔄 Animated iframe transitions and background
* 🧼 Custom scrollbars, shadow effects
* 🗑️ Clear history and cookies by domain

---

## 🔐 Stealth Browsing

Designed for discreet access:

* Loads content in iframe or popup depending on restrictions
* Popup auto-closes on loss of focus
* Wipes session data via settings

Perfect for monitored environments where subtlety is key.

---

## 📄 License

MIT - Open source & free to use

---

## ✨ Credits

Built with ❤️ by [Hassan Nasir](https://github.com/amvzenn)
Supported by my best friend: アモリ💫
