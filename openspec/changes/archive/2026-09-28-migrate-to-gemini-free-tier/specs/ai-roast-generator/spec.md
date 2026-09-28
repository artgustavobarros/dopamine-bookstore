## REMOVED Requirements

### Requirement: OpenRouter Free Model API Client
**Reason**: Replaced with Google Gemini official API to benefit from dedicated free-tier quota (15 RPM / 1,500 RPD), lower latency, and native structured outputs.
**Migration**: Configure `GEMINI_API_KEY` and use the Google Gen AI client via `@google/genai`.

## ADDED Requirements

### Requirement: Google Gemini Free Model API Client
The application SHALL provide a server-side client to communicate with Google Gemini models (`gemini-2.0-flash` or `gemini-2.5-flash`) via the official `@google/genai` SDK using `GEMINI_API_KEY`, enforcing native structured JSON schema (`responseSchema` with `sfx` and `msg` properties), and an enforced timeout of at most 1,500 milliseconds for toasts (and 10,000 milliseconds for psychiatric diagnosis). Responses SHALL be validated to guarantee:
1. Message length does not exceed 140 characters for toasts (and 600 characters for diagnosis).
2. The response contains no emojis.
3. The content is written in the requested locale (`pt` or `en`).
If Google Gemini returns an error, HTTP 429, times out after the enforced timeout, or returns a payload failing validation, the server function SHALL immediately resolve to an appropriate deterministic fallback roast from the `roast-manifestations` catalog. Successful generations SHALL be cached in session state by `event + rule` key so subsequent identical action contexts avoid duplicate generation costs.

#### Scenario: Successful Gemini inference within timeout
- **WHEN** a valid context payload is sent to the server function, `GEMINI_API_KEY` is available, and the model responds within 1.5 seconds with valid JSON matching the schema
- **THEN** the client validates the length (<= 140 characters for toasts), verifies no emojis are present, caches the result under the cache key, and returns the evaluated roast with `ruleId: "gemini-ai"`

#### Scenario: Gemini timeout, rate limit (HTTP 429), or missing key
- **WHEN** Gemini exceeds the timeout, returns an error or 429, fails validation, or `GEMINI_API_KEY` is not set
- **THEN** the system immediately serves an evaluated roast from the deterministic catalog without user-facing delay

#### Scenario: Session cache hit for identical event context
- **WHEN** a user triggers an action matching an event and context that has already been generated via Gemini in the current session
- **THEN** the client returns the cached roast payload without issuing a redundant API request
