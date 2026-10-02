import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    headless: true,
  },
  webServer: [
    {
      command: "node tests/open-library-mock.mjs",
      reuseExistingServer: false,
      timeout: 30_000,
      url: "http://127.0.0.1:4174/health",
    },
    {
      command: "pnpm run dev --host 127.0.0.1 --port 4173 --strictPort",
      env: {
        GEMINI_API_KEY: "",
        VITE_OPEN_LIBRARY_BASE_URL: "http://127.0.0.1:4174",
      },
      reuseExistingServer: false,
      timeout: 30_000,
      url: "http://127.0.0.1:4173",
    },
  ],
});
