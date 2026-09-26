## ADDED Requirements

### Requirement: OpenRouter Free Model API Client
The application SHALL provide a server-side client to communicate with OpenRouter's free tier models (`openrouter/free`, `qwen/qwen3.8-27b:free`, or `google/gemma-4-31b-it:free`) using standard bearer authentication, site attribution headers (`HTTP-Referer`, `X-Title`), and an optional configurable timeout.

#### Scenario: Successful OpenRouter inference
- **WHEN** a valid context payload is sent to the server function and `OPENROUTER_API_KEY` is available
- **THEN** the client queries OpenRouter using the configured free model, parses the structured response (`{ tag, roast }`), and returns it to the caller

#### Scenario: OpenRouter error or rate limit
- **WHEN** OpenRouter returns an error, HTTP 429, times out after 2.5 seconds, or the API key is not configured
- **THEN** the client catches the error without throwing to the client and immediately returns an appropriate deterministic fallback roast

### Requirement: Roast Comedy Prompt and Tone Calibration
The roast generation prompt SHALL instruct the model to adopt the persona of a satirical comedy roast master specialized in reader habits (*tsundoku*, buying 1000-page classics as intellectual trophies, productivity illusions, installment payment rationalizations). The prompt SHALL instruct the model to return concise responses (maximum 2 sentences) accompanied by an uppercase sound-effect tag (`tag`, e.g. `[ALERTA!]`, `[TERAPIA JÁ]`, `[DE NOVO?!]`, `[CHIQUE.]`).

#### Scenario: Acidic roast generation with sound effect
- **WHEN** the user adds multiple Russian literature books or crosses 1,000 pages in their cart
- **THEN** the generated roast contains an uppercase tag in brackets and a punchy, ironic one-or-two-sentence joke targeting that specific behavior

#### Scenario: Bilingual output
- **WHEN** the client requests a roast with locale `pt` or `en`
- **THEN** the prompt directs the model to output the tag and punchline in the matching language with appropriate cultural references
