## ADDED Requirements

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

