import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

try {
  process.loadEnvFile?.();
} catch {
  // .env may not exist in some environments
}

export const env = createEnv({
  client: {},
  clientPrefix: "VITE_",
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    OPENROUTER_API_KEY: z.string().optional(),
    OPENROUTER_MODEL: z.string().default("openrouter/free"),
    OPENROUTER_SITE_NAME: z.string().default("Depois Eu Leio"),
    OPENROUTER_SITE_URL: z.string().default("http://localhost:3000"),
  },
  skipValidation: Boolean(process.env.CI || process.env.SKIP_ENV_VALIDATION),
});
