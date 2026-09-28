import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    headless: true,
  },
  webServer: {
    command: "pnpm run dev --host 127.0.0.1 --port 4173 --strictPort",
    // Never hit Gemini from tests: force the deterministic catalog fallback
    env: { GEMINI_API_KEY: "" },
    reuseExistingServer: false,
    timeout: 30_000,
    url: "http://127.0.0.1:4173",
  },
});
