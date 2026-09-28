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
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  skipValidation: Boolean(process.env.CI || process.env.SKIP_ENV_VALIDATION),
});
