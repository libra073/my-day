import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handleApiRequest } from './server/routes.js';

function myDayApiPlugin() {
  return {
    name: 'my-day-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost:5173'}`);
        if (urlObj.pathname.startsWith('/api')) {
          handleApiRequest(req, res, urlObj).catch(err => {
            console.error('API Middleware Error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal Server Error', details: err.message }));
          });
        } else {
          next();
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), myDayApiPlugin()],
});
