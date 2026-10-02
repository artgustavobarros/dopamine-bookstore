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
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().default("gemini-flash-lite-latest"),
    RATE_LIMIT_KEY_SECRET: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  skipValidation: Boolean(process.env.CI || process.env.SKIP_ENV_VALIDATION),
});
