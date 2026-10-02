# ai-roast-generator Specification

## Purpose
Generate contextual, satirical reader roasts through Gemini with bounded inputs and latency, output validation, prompt calibration, shared request limits, and deterministic fallback content.

## Requirements
### Requirement: Roast Comedy Prompt and Tone Calibration
The roast generation prompt SHALL calibrate the model against the satirical bookstore tone guide:
1. Mock the reading habit (buying and not reading, tsundoku, dopamine rush, wishlist graveyard, procrastination) rather than the person (appearance, intelligence, income).
2. Incorporate real quantitative numbers from the context (exact pages, price, author, hours) whenever available.
3. Use dry, affirmative irony without excessive exclamation marks or full-phrase uppercase.
4. Address the user directly ("você" in Portuguese, "you" in English).
5. Strictly avoid emojis.
6. Restrict output to a maximum of 140 characters and valid JSON with `{ "sfx": string, "msg": string }`.
The user prompt SHALL format the action context (event, book metadata, pages, spend, cart totals, intensity level) accompanied by 3 illustrative few-shot examples drawn from the catalog for that event.

#### Scenario: Acidic roast generation with structured tone constraints
- **WHEN** the user adds a 1,024-page classic book to their cart
- **THEN** the model is prompted with the tone guide, the book's title and 1,024 page count, and 3 catalog examples, outputting a punchy, emoji-free joke under 140 characters with an uppercase SFX header

#### Scenario: Bilingual output calibration
- **WHEN** the client requests a roast with locale `pt` or `en`
- **THEN** the prompt directs the model to output the SFX and message adapted to the selected language's cultural nuances rather than a literal word-for-word translation

### Requirement: Google Gemini Free Model API Client
The application SHALL provide a server-side client to communicate with Google Gemini models (`gemini-2.0-flash` or `gemini-2.5-flash`) via the official `@google/genai` SDK using `GEMINI_API_KEY`, enforcing native structured JSON schema (`responseSchema` with `sfx` and `msg` properties), and an enforced timeout of at most 1,500 milliseconds for toasts (and 10,000 milliseconds for psychiatric diagnosis). Responses SHALL be validated to guarantee:
1. Message length does not exceed 140 characters for toasts, and does not exceed 2,500 characters for multi-paragraph diagnosis reports.
2. The response contains no emojis.
3. The content is written in the requested locale (`pt` or `en`).
The diagnosis prompt SHALL be generated via a dedicated `buildDiagnosisPrompt` pipeline requesting a 2-3 paragraph clinical psychiatric report (150-250 words) with up to 1,000 max output tokens under the Google AI Studio Free Tier quota. If Google Gemini returns an error, HTTP 429, times out after the enforced timeout, or returns a payload failing validation, the server function SHALL immediately resolve to an appropriate deterministic fallback roast from the catalog or fallback registry.

#### Scenario: Successful Gemini diagnosis inference within timeout
- **WHEN** a valid diagnosis request payload is sent to `generateDiagnosisFn` with `GEMINI_API_KEY` available and the model responds within 10 seconds with valid JSON matching the schema
- **THEN** the client validates the message length (<= 2,500 characters), verifies no emojis are present, retains uppercase header tags up to 24 characters, and returns the evaluated diagnosis report with `ruleId: "gemini-ai"`

#### Scenario: Dedicated diagnosis prompt formulation
- **WHEN** preparing a prompt for event `"diagnosis"`
- **THEN** the server invokes `buildDiagnosisPrompt` with user reading stats (books count, total pages, pretend spend, reading hours, favorite author, favorite genre), requesting a structured 3-part report without 140-character toast limits or short one-liner few-shot examples

#### Scenario: Deterministic multi-paragraph fallback on error or timeout
- **WHEN** Gemini exceeds the timeout, returns an error or HTTP 429, or `GEMINI_API_KEY` is not configured
- **THEN** the system immediately serves a comprehensive multi-paragraph clinical diagnosis fallback containing Clinical Presentation, Behavioral Analysis, and Mock Prescription

### Requirement: Bounded public AI requests
The public roast and diagnosis server functions SHALL validate upper bounds for every client-controlled string, array, count, and numeric field before building a prompt. They SHALL enforce separate shared, atomic per-client request budgets across serverless instances before calling Gemini. Over-budget requests and unavailable rate-limit infrastructure SHALL use the deterministic fallback without calling the provider. Server response caching SHALL have bounded capacity and expiry, and logs SHALL not include full prompts or personal fields.

#### Scenario: Excessive client payload
- **WHEN** a caller submits an oversized title, cart, or context field
- **THEN** the server rejects it before prompt construction or provider invocation

#### Scenario: Distributed quota reached
- **WHEN** the same client exceeds the configured roast or diagnosis budget across multiple server instances
- **THEN** subsequent requests return deterministic fallback content and make no Gemini call until the quota window resets

#### Scenario: Limiter unavailable
- **WHEN** the shared limiter cannot be reached in production
- **THEN** the function serves deterministic fallback content and does not call Gemini

#### Scenario: Cache capacity reached
- **WHEN** more distinct roast inputs than the cache capacity are requested
- **THEN** expired or least-recently-used entries are evicted and memory remains bounded
