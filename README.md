# 🔁 Dual Mode Extension & Proxy Server

This project contains a Chrome extension and a lightweight proxy server to enable popup fallback for web content that restricts iframe embedding.

---

## 📁 Project Structure

```
.
├── extension/               # Chrome extension UI & logic
│   ├── background.js        # Background service worker (extension lifecycle)
│   ├── config.js            # Global constants or configuration values
│   ├── manifest.json        # Chrome Extension manifest (v3)
│   ├── popup.html           # HTML UI: input, toggle, iframe container
│   ├── popup.js             # UI logic: proxy routing, theme, popup fallback
│   └── style.css            # Theme styling, layout, animation, custom scrollbars
│
└── proxy-server/            # Backend proxy deployed via Zeabur
    ├── package.json         # Node.js dependencies for proxy
    ├── package-lock.json    # Lock file
    ├── server.js            # Express server for popup redirection
    └── zbpack.json          # Zeabur deployment configuration
```

---

## 🌐 Proxy Server (`proxy-server/server.js`)

* Deployed via [Zeabur](https://zeabur.com) to: `https://dual-mode-server.zeabur.app`
* Proxies URLs and supports fallback popup viewing for CSP-restricted pages
* Responds to both `GET` and `HEAD` requests (used for CSP detection)

To host locally:

```bash
cd proxy-server
npm install
node server.js
```

Then update `BASE_PROXY_URL` in `popup.js` to:

```js
window.BASE_PROXY_URL = "http://localhost:3001";
```

---

## 🧩 Chrome Extension (`/extension`)

### `popup.html`

* Layout for input, theme switch, buttons, and iframe
* Injects proxy-wrapped URL into iframe or opens as popup

### `popup.js`

* Normalizes URLs
* Detects and bypasses CSP-restricted pages
* Saves theme and popup size to local storage
* Opens Chrome popup window if embedding fails

### `style.css`

* Dual theme (light/dark)
* Fully animated buttons and layout
* Custom transparent scrollbars
* Smooth iframe shadow, hover effects, and clean UI

### `background.js`

* Listens for messages from popup and manages popup window state

---

## 🛠 Installation & Usage

1. Go to the [Releases tab](https://github.com/amvzenn/Dual-Mode-Server/releases)

   * Download the latest `.zip`
   * Unzip it

2. **Load the Extension**:

   * Go to `chrome://extensions`
   * Enable "Developer Mode"
   * Click "Load unpacked" and select the `extension/` folder from the unzipped release

3. *(Optional)* Run the Proxy Server locally (see above)

---

## ✅ Features

* 🌓 Light/Dark theme toggle
* 🔗 Auto-resizing popup window options
* 🧠 CSP detection to choose iframe vs popup
* 🧼 Modern UI with animations, shadows, and custom scrollbars

---

## 🔐 Stealth Browsing

This extension is designed for discreet access to websites:

* Websites either load inside an iframe or open in a separate Chrome popup.
* If you're browsing privately, simply **click outside** the popup window or extension interface — it will **automatically hide itself**.
* Ideal for stealthy use in restricted or monitored environments.
* *(Coming soon:)* A feature to **clear browsing history and login session data** directly from the extension.

---

## 📄 License

MIT – open source and free to use.

---

## ✨ Credits

Built with ❤️ by Hassan Nasir | GitHub: amvzenn
