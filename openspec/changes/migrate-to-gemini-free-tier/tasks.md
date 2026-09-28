## 1. Dependencies and Environment Configuration

- [x] 1.1 Remove `@openrouter/sdk` and install `@google/genai`
- [x] 1.2 Update environment schema in `src/env.ts` with `GEMINI_API_KEY` and `GEMINI_MODEL`
- [x] 1.3 Update `.env.example` with Google AI Studio configuration and Gemini model documentation

## 2. Server Roast Client Implementation

- [x] 2.1 Refactor `src/lib/server/roast.ts` to instantiate Google Gen AI client with `GEMINI_API_KEY`
- [x] 2.2 Configure native structured schema (`responseSchema` with `sfx` and `msg` properties and `responseMimeType: "application/json"`)
- [x] 2.3 Implement timeout protection (1.5s for toasts, 10s for diagnosis) with AbortSignal / race handling
- [x] 2.4 Update telemetry ruleId to `gemini-ai` and verify in-memory cache behavior
- [x] 2.5 Ensure seamless fallback to catalog when API key is missing, call times out, or rate limit 429 occurs

## 3. Verification and Testing

- [x] 3.1 Run `pnpm run typecheck` to confirm zero type errors across server functions and consumers
- [x] 3.2 Verify `tests/roasts.spec.ts` passes and confirm offline fallback remains functional without API keys
