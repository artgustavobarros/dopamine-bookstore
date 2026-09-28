## Why

The current AI comedic roast generation relies on OpenRouter's public free-tier models (`openrouter/free`), which suffer from variable queue latency, frequent rate-limiting (HTTP 429), and non-deterministic formatting quirks that require regex stripping. Migrating to Google's official Gemini API (Free Tier on Google AI Studio) provides dedicated per-key rate limits (15 RPM / 1,500 RPD), sub-second inference latency, and native structured outputs (`responseSchema`) with zero financial cost, drastically improving the speed and reliability of the storefront's satirical toasts and psychiatric diagnoses.

## What Changes

- **SDK Replacement**: Replace `@openrouter/sdk` with Google's official unified SDK `@google/genai`.
- **Environment Variables**: Replace `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_SITE_URL`, and `OPENROUTER_SITE_NAME` with `GEMINI_API_KEY` and `GEMINI_MODEL` (defaulting to `gemini-2.0-flash`). Update `.env.example` and `src/env.ts`.
- **Native Structured Output**: Utilize Gemini's native `responseSchema` and `responseMimeType: "application/json"` to guarantee `{ sfx: string, msg: string }` format without relying on markdown parsing or regex extraction.
- **Latency & Timeout Calibration**: Enforce a strict timeout (1.5s for toasts, 10s for reader psychiatric diagnosis) with instant fallback to the deterministic offline roast catalog.
- **Telemetry & Rule Tagging**: Update AI roast metadata `ruleId` from `openrouter-ai` to `gemini-ai`.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `ai-roast-generator`: Migrate the server-side AI client from OpenRouter free models to Google Gemini API (`gemini-2.0-flash`), adopting native JSON schema enforcement while preserving the 140-char limit, zero-emoji constraint, bilingual support (`pt`/`en`), and deterministic catalog fallbacks.

## Impact

- **Affected Code**: `src/lib/server/roast.ts`, `src/env.ts`, `.env.example`, and `package.json`.
- **Consumers (`checkout`, `reader-roast-card`, `roast-trigger`)**: Zero breaking changes; `generateRoastFn` and `generateDiagnosisFn` signatures and return schemas remain identical.
- **Dependencies**: Uninstalls `@openrouter/sdk`, installs `@google/genai`.
