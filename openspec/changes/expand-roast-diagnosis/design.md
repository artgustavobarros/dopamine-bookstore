## Context

The bookstore provides an interactive reading stats dashboard at `/stats` featuring a "Diagnóstico do Leitor" (Reader's Roast / Fritada Literária) card (`ReaderRoastCard`). Previously, the backend function `generateDiagnosisFn` shared the same prompt generation routine (`buildUserPrompt`) and constraints as short interaction toasts, prompting the model to produce a single concise sentence under 140 characters.

Users expect an extensive, biting psychological critique that examines their book-hoarding pathology (*tsundoku*), quantifies their imaginary expenditures, reading hours, and accumulated page counts, and prescribes a satirical medical remedy.

## Goals / Non-Goals

**Goals:**
- Separate roast prompt pipelines into fast reaction toasts (`buildUserPrompt`, <= 140 chars) and elaborate reader diagnoses (`buildDiagnosisPrompt`, 150-250 words, 2-3 paragraphs).
- Raise Gemini generation token parameters for diagnosis to `maxOutputTokens: 1000` while staying strictly within the Google AI Studio Free Tier (limit: 8,192 output tokens, 1,000,000 TPM).
- Expand character validation for diagnosis output to 2,500 characters and header tags up to 24 characters (`LAUDO CLÍNICO`, `CLINICAL REPORT`).
- Ensure the frontend renders multi-paragraph text with proper visual separation via `whitespace-pre-line`.
- Upgrade deterministic offline fallbacks to mirror the complete 3-section report format.

**Non-Goals:**
- Modifying interactive reaction toasts (which remain strictly <= 140 characters and fast-reaction SLA).
- Implementing streaming (diagnoses are returned as structured JSON payloads rendered in full).
- Adding database persistence for diagnoses beyond the active browser session (`sessionStorage`).

## Decisions

### 1. Dedicated `buildDiagnosisPrompt` Function
- **Rationale**: Interactive toasts require short, punchy jokes under 140 characters, while diagnoses require an expansive psychiatric evaluation report. Sharing a single prompt function led to conflicting system instructions and truncated one-line responses.
- **Alternatives considered**: Passing a boolean flag into `buildUserPrompt`. Rejected because diagnosis requires a fundamentally distinct data context structure (hours, total books, pretend spend, tsundoku framing) and few-shot guidance.

### 2. Multi-Paragraph Structured Report Format
- **Rationale**: The clinical report is structured into three clear sections separated by `\n\n`:
  1. **Quadro Clínico (Clinical Presentation)**: Quantitative stats (pages, books, pretend spend, hours).
  2. **Análise Comportamental (Behavioral Analysis)**: Merciless roast of tsundoku and intellectual vanity.
  3. **Prescrição Médica (Mock Prescription)**: Absurd medical and behavioral treatment.
- **Alternatives considered**: Returning a complex JSON object with separate keys (`{ clinical, analysis, prescription }`). Rejected to maintain 100% backward compatibility with `RoastPayload` (`{ roast: string, tag: string }`) and existing client consumers.

### 3. Gemini Free Tier Token Budget Allocation
- **Rationale**: Google AI Studio's Free Tier allows up to 8,192 output tokens per request and 1,000,000 tokens per minute. Allocating `maxOutputTokens: 1000` (~750 words / ~4,000 chars) provides ample space for a dense 250-word report without approaching rate or token ceilings.
- **Alternatives considered**: Setting `maxOutputTokens: 2000`. Unnecessary since diagnoses are targeted at 150-250 words, keeping latency tight and well within the 10-second timeout.

### 4. Frontend Line Break Rendering via `whitespace-pre-line`
- **Rationale**: HTML standard `<p>` elements collapse newline characters (`\n\n`) into single spaces. Adding `whitespace-pre-line` preserves paragraph breaks naturally without requiring dangerous HTML rendering (`dangerouslySetInnerHTML`) or markdown parsers.

## Risks / Trade-offs

- **[Risk] Model generates emojis despite instructions**
  → *Mitigation*: The `EMOJI_REGEX` validation check rejects any output with emojis, automatically triggering the multi-paragraph fallback without crashing the UI.

- **[Risk] Gemini latency on cold start exceeding 10 seconds**
  → *Mitigation*: `AbortSignal.timeout(10000)` cancels hung requests and smoothly serves the comprehensive local fallback report from `roast-fallbacks.ts`.

- **[Risk] Free tier rate limiting (15 RPM) during rapid regenerations**
  → *Mitigation*: The UI disables the regenerate button while loading, and rate limit errors (HTTP 429) cleanly fail over to local fallbacks.
