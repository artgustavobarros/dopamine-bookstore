# ai-roast-generator Specification

## Purpose
TBD - created by archiving change ai-roasts-with-openrouter. Update Purpose after archive.
## Requirements
### Requirement: OpenRouter Free Model API Client
The application SHALL provide a server-side client to communicate with OpenRouter's free tier models (`openrouter/free`, `qwen/qwen3.8-27b:free`, or `google/gemma-4-31b-it:free`) using standard bearer authentication, site attribution headers (`HTTP-Referer`, `X-Title`), and an optional configurable timeout.

#### Scenario: Successful OpenRouter inference
- **WHEN** a valid context payload is sent to the server function and `OPENROUTER_API_KEY` is available
- **THEN** the client queries OpenRouter using the configured free model, parses the structured response (`{ tag, roast }`), and returns it to the caller

#### Scenario: OpenRouter error or rate limit
- **WHEN** OpenRouter returns an error, HTTP 429, times out after 2.5 seconds, or the API key is not configured
- **THEN** the client catches the error without throwing to the client and immediately returns an appropriate deterministic fallback roast

### Requirement: Roast Comedy Prompt and Tone Calibration
The roast generation prompt SHALL instruct the model to adopt the persona of a satirical comedy roast master specialized in reader habits (*tsundoku*, buying 1000-page classics as intellectual trophies, productivity illusions, installment payment rationalizations, endless wishlist graveyards, category hopping, perpetual search paralysis, and obsessive filter tweaking). The prompt SHALL instruct the model to return concise responses (maximum 2 sentences) accompanied by an uppercase sound-effect tag (`tag`, e.g. `[ALERTA!]`, `[TERAPIA JÁ]`, `[CEMITÉRIO DE DESEJOS]`, `[TURISTA LITERÁRIO]`, `[BUSCA INFINITA]`, `[PECHINCHA INÚTIL]`, `[SÍNDROME DE INTELECTUAL]`). When invoked with exploration filter parameters (`filterType`, `filterValue`, `previousValue`), the prompt and user message SHALL explicitly reference the parameter that was altered.

#### Scenario: Acidic roast generation with sound effect
- **WHEN** the user adds multiple Russian literature books or crosses 1,000 pages in their cart
- **THEN** the generated roast contains an uppercase tag in brackets and a punchy, ironic one-or-two-sentence joke targeting that specific behavior

#### Scenario: Wishlist and browsing roast generation
- **WHEN** the user crosses 1,000 or 2,000 wishlist pages, or reaches a multiple of 3 search or filter parameter changes (query, genre, price, author, length)
- **THEN** the generated roast contains an uppercase tag in brackets and punchy satire targeting the specific action, explicitly mocking the parameter altered (e.g., price thriftiness, author name-dropping, book length excuses, genre tourism, or repetitive querying)

#### Scenario: Bilingual output
- **WHEN** the client requests a roast with locale `pt` or `en`
- **THEN** the prompt directs the model to output the tag and punchline in the matching language with appropriate cultural references

