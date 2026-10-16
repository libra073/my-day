import http from 'node:http';
import { handleApiRequest } from './routes.js';
import { loadDatabase } from './db.js';

// Pre-load database on start
loadDatabase();

export function createApiServer() {
  const server = http.createServer((req, res) => {
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    const host = req.headers.host || 'localhost:3001';
    const urlObj = new URL(req.url, `http://${host}`);

    if (urlObj.pathname.startsWith('/api')) {
      handleApiRequest(req, res, urlObj).catch(err => {
        console.error('API Error:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Internal Server Error', details: err.message }));
      });
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
  });

  return server;
}

// If executed directly
const isDirectRun = process.argv[1] && process.argv[1].endsWith('server.js');
if (isDirectRun) {
  const port = process.env.PORT || 3001;
  const server = createApiServer();
  server.listen(port, () => {
    console.log(`[MY DAY API] Server running on http://localhost:${port}`);
  });
}
