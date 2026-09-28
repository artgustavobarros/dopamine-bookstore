## Context

The bookstore uses two server functions in `src/lib/server/roast.ts`:
1. `generateRoastFn`: fast reaction toasts triggered on cart additions, filter changes, and checkout actions.
2. `generateDiagnosisFn`: a 3-4 sentence sarcastic psychiatric evaluation of reader book-hoarding habits displayed in the reader profile card.

Currently, both functions use `@openrouter/sdk` querying `openrouter/free`. OpenRouter free models suffer from variable queue delays, frequent HTTP 429 throttling, and markdown code fences that require manual regex cleanup. Migrating to Google's official Gemini API (Free Tier on Google AI Studio) provides a free dedicated quota of 15 RPM / 1,500 RPD, sub-second latency, and native JSON schema output.

## Goals / Non-Goals

**Goals:**
- Replace `@openrouter/sdk` with `@google/genai` (v2 unified SDK).
- Configure environment variables `GEMINI_API_KEY` and `GEMINI_MODEL` (`gemini-2.0-flash`).
- Leverage Gemini's native structured outputs (`responseMimeType: "application/json"`, `responseSchema`) to enforce `{ sfx: string, msg: string }`.
- Enforce strict timeouts (1,500ms for toasts, 10,000ms for diagnosis) with deterministic catalog fallback.
- Preserve 100% backward compatibility for existing callers (`checkout`, `reader-roast-card`, `roast-trigger`).

**Non-Goals:**
- Modifying UI components or toast presentation styles.
- Implementing streaming responses (toasts require immediate atomic delivery).
- Changing the satirical tone guidelines or catalog fallback rules.

## Decisions

### 1. Use `@google/genai` instead of `@google/generative-ai`
- **Rationale**: `@google/genai` (v2.x) is Google's modern, unified SDK supporting both Gemini Developer API (Google AI Studio) and Vertex AI. The legacy `@google/generative-ai` package is in maintenance mode.
- **Alternatives considered**: Direct `fetch` with OpenAI-compatibility endpoint. Rejected because the native SDK provides typed `responseSchema` definitions, cleaner error handling, and future-proof parameter support.

### 2. Native Structured Output (`responseSchema`)
- **Rationale**: By providing `responseMimeType: "application/json"` and `responseSchema: { type: Type.OBJECT, properties: { sfx, msg }, required: ["sfx", "msg"] }`, Gemini guarantees valid JSON adhering to the schema without markdown wrappers (````json ... ````), eliminating fragile regex parsing.
- **Fallback**: Secondary length (≤140 chars for toasts, ≤600 for diagnosis) and emoji regex filters remain active as defense-in-depth.

### 3. Latency & Timeout SLA with AbortSignal
- **Rationale**: `AbortSignal.timeout(timeoutMs)` or `Promise.race` ensures the server function never blocks the client UI if the network hangs. If Gemini does not respond within 1.5s, the system immediately resolves to the offline deterministic catalog from `src/lib/roasts.ts`.

### 4. Telemetry Identifier
- **Rationale**: Change `ruleId: "openrouter-ai"` to `ruleId: "gemini-ai"` so toast logs and event handlers accurately reflect the active AI provider.

## Risks / Trade-offs

- **[Risk] Free-tier rate limit (15 RPM) exceeded during high-burst browsing**
  → *Mitigation*: The server function catches 429 status codes and immediately falls back to `resolveFallback(data)` from the local catalog without throwing or breaking the user experience. In-memory session caching by `event:book:locale` also prevents repeat calls.

- **[Risk] Missing `GEMINI_API_KEY` in new developer environments**
  → *Mitigation*: If `GEMINI_API_KEY` is undefined or blank, a concise warning is logged and the catalog fallback is returned seamlessly without failing builds or app startup.

- **[Risk] Breaking changes in environment validation**
  → *Mitigation*: In `src/env.ts`, `GEMINI_API_KEY` is marked optional with `z.string().optional()`, and `GEMINI_MODEL` defaults to `"gemini-2.0-flash"`.
