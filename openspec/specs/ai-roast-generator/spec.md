# ai-roast-generator Specification

## Purpose
Generate contextual, satirical comedic reader roasts leveraging OpenRouter LLMs with strict latency bounds, validation against vulgarity and emojis, prompt calibration with catalog few-shots, and seamless fallback to deterministic offline catalog roasts.

## Requirements
### Requirement: OpenRouter Free Model API Client
The application SHALL provide a server-side client to communicate with OpenRouter's free tier models (`openrouter/free`, `qwen/qwen3.8-27b:free`, or `google/gemma-4-31b-it:free`) using standard bearer authentication, site attribution headers (`HTTP-Referer`, `X-Title`), and an enforced timeout of at most 1,500 milliseconds (1.5 seconds). Responses SHALL be validated to guarantee:
1. Message length does not exceed 140 characters.
2. The response contains no emojis.
3. The content is written in the requested locale (`pt` or `en`).
If OpenRouter returns an error, HTTP 429, times out after 1.5 seconds, or returns a payload failing validation, the server function SHALL immediately resolve to an appropriate deterministic fallback roast from the `roast-manifestations` catalog. Successful generations SHALL be cached in session state by `event + rule` key so subsequent identical action contexts avoid duplicate generation costs.

#### Scenario: Successful OpenRouter inference within timeout
- **WHEN** a valid context payload is sent to the server function, `OPENROUTER_API_KEY` is available, and the model responds within 1.5 seconds with valid JSON
- **THEN** the client validates the length (<= 140 characters) and structure, caches the result under the event and rule key, and returns `{ tag, roast }`

#### Scenario: OpenRouter timeout or validation failure
- **WHEN** OpenRouter exceeds 1.5 seconds, responds with invalid JSON, includes forbidden emojis, or returns text over 140 characters
- **THEN** the system aborts the request and immediately serves an evaluated roast from the deterministic catalog without user-facing delay

#### Scenario: Session cache hit for identical event context
- **WHEN** a user triggers an action matching an event and rule that has already been generated via OpenRouter in the current session
- **THEN** the client returns the cached roast payload without issuing a redundant API request

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
