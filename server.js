require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Service worker & manifest harus selalu segar agar update PWA terdeteksi
app.get('/sw.js', (req, res) => {
  res.set({ 'Cache-Control': 'no-cache', 'Service-Worker-Allowed': '/' });
  res.type('application/javascript').sendFile(path.join(__dirname, 'public', 'sw.js'));
});
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, file) => {
    if (file.endsWith('.webmanifest')) res.setHeader('Content-Type', 'application/manifest+json');
    if (/\.(woff2|png)$/.test(file)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

// ===== Route view =====
const sendView = (file) => (req, res) =>
  res.sendFile(path.join(__dirname, 'public', file));

app.get('/', sendView('index.html'));
app.get('/camera', sendView('camera.html'));

// ===== Route API =====
app.get('/api/health', (req, res) => res.json({ ok: true, app: 'retro-cam' }));

// SPA fallback
app.get('*', sendView('index.html'));

app.listen(PORT, () => console.log(`Retro Cam jalan di http://localhost:${PORT}`));