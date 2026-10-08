import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testMatch: /.*\.spec\.mjs/,
  use: {
    channel: 'msedge', // use already-installed Microsoft Edge on system
    headless: true,
    baseURL: 'http://localhost:5173',
  },
});
