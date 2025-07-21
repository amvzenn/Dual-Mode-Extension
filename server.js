const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio"); // 🔧 Used for HTML rewriting

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Helper to check if CSP headers exist
function hasCSP(headers) {
  const cspHeaders = [
    "content-security-policy",
    "content-security-policy-report-only",
    "x-webkit-csp",
    "x-content-security-policy",
  ];
  return cspHeaders.some((header) => headers[header]);
}

// 🔍 HEAD-only route to detect CSP
app.head("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("Missing url param");

  try {
    const response = await axios.head(targetUrl, { timeout: 5000 });
    const hasPolicy = hasCSP(response.headers);
    res.set("x-csp-detected", hasPolicy ? "true" : "false");
    res.sendStatus(200);
  } catch (err) {
    console.error("🔴 HEAD request error:", err.message);
    res.set("x-csp-detected", "false");
    res.sendStatus(200); // fallback to allow iframe
  }
});

// 🌐 Full proxy with HTML rewriting + CSP stripping
app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("Missing url param");

  try {
    const response = await axios.get(targetUrl, {
      timeout: 10000,
      responseType: "text",
      headers: { "User-Agent": "Mozilla/5.0 (Proxy)" },
    });

    const headers = { ...response.headers };
    const contentType = headers["content-type"] || "";

    // Remove CSP headers
    [
      "content-security-policy",
      "content-security-policy-report-only",
      "x-webkit-csp",
      "x-content-security-policy",
    ].forEach((h) => delete headers[h]);

    res.set(headers);

    // If it's HTML, inject <base> to fix relative paths
    if (contentType.includes("text/html")) {
      const $ = cheerio.load(response.data);

      // Inject base tag at top of <head>
      $("head").prepend(`<base href="${targetUrl}">`);

      // Optional: make all <a> tags open in new tab
      $("a").attr("target", "_blank");

      res.send($.html());
    } else {
      // Not HTML (e.g., image, CSS) — serve as-is
      res.send(response.data);
    }
  } catch (err) {
    console.error("🔴 Proxy error:", err.code || err.message);
    if (!res.headersSent) {
      res.status(500).send("Proxy failed: " + err.message);
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server listening on port ${PORT}`);
});
