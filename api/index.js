import { handleApiRequest } from '../server/routes.js';

export default async function handler(req, res) {
  // Determine protocol and host for URL parsing
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const urlObj = new URL(req.url, `${proto}://${host}`);

  try {
    await handleApiRequest(req, res, urlObj);
  } catch (err) {
    console.error('Vercel API Handler Error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal Server Error', details: err.message }));
    }
  }
}
