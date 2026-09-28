## MODIFIED Requirements

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
