const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Replace this with your real extension ID
const EXTENSION_ID = 'lkgkgaofkdmpjdohddlekjkcbdekikao';

const allowedOrigins = [
  `chrome-extension://${EXTENSION_ID}`,
  'http://localhost:3001'
];

// CORS: allow extension + localhost
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true
}));

// Validate query param
app.use('/proxy', (req, res, next) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Missing "url" query param');
  try {
    new URL(targetUrl);
    next();
  } catch (e) {
    return res.status(400).send('Invalid URL: ' + targetUrl);
  }
});

// Main proxy handler
app.use('/proxy', createProxyMiddleware({
  target: 'http://example.com', // dummy
  changeOrigin: true,
  credentials: 'include',
  cookieDomainRewrite: '',

  router: (req) => {
    const url = new URL(req.query.url);
    return url.origin;
  },

  pathRewrite: (path, req) => {
    const url = new URL(req.query.url);
    return url.pathname + url.search;
  },

  onProxyRes: (proxyRes, req, res) => {
    const hasCSP = !!proxyRes.headers['content-security-policy'];
    const hasXFO = !!proxyRes.headers['x-frame-options'];

    // Let client-side know if there's CSP/XFO
    if (hasCSP || hasXFO) {
      res.setHeader('x-csp-detected', 'true');
    } else {
      res.setHeader('x-csp-detected', 'false');
    }

    // Strip frame-blocking headers for actual iframe rendering
    delete proxyRes.headers['content-security-policy'];
    delete proxyRes.headers['x-frame-options'];
  },

  logLevel: 'warn'
}));

app.listen(3001, () => {
  console.log('✅ Proxy with CSP header detection running at http://localhost:3001');
});
