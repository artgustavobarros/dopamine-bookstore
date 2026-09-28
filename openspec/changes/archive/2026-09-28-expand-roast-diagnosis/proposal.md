## Why

The on-demand reader diagnosis ("Diagnóstico do Leitor" / "Fritada Literária") in `/stats` was previously generating a single, one-line sentence because the server function shared a user prompt that strictly enforced `< 140 chars` with toast-sized few-shot examples. Users expect a substantial, hilariously detailed satirical psychiatric evaluation that thoroughly roasts their book-hoarding habits (*tsundoku*), pretend spend, reading hours, and literary pretension, culminating in an absurd clinical prescription.

## What Changes

- Separate user prompt construction for diagnosis (`buildDiagnosisPrompt`) from reaction toasts (`buildUserPrompt`).
- Instruct Gemini to produce a rich 2-3 paragraph clinical psychiatric diagnosis report (Quadro Clínico, Análise Comportamental, Prescrição Médica) citing real user statistics (total pages, books count, pretend spend, estimated reading hours, favorite author/genre).
- Increase `maxOutputTokens` from 600 to 1,000 for diagnosis requests (well within Gemini Free Tier limits of 8,192 output tokens and 1,000,000 TPM).
- Expand maximum response character validation for diagnosis from 600 to 2,500 characters while preserving the strict 140-character limit for interactive toasts.
- Support up to 24 characters for diagnosis header tags (`LAUDO CLÍNICO`, `CLINICAL REPORT`) without slicing.
- Enable `whitespace-pre-line` formatting in the reader roast card component to properly display paragraph breaks (`\n\n`).
- Upgrade the deterministic offline fallback diagnosis in `roast-fallbacks.ts` to match the comprehensive 3-part structure.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `reading-insights`: Expand the "Dedicated Reader Psychological Roast" requirement to mandate a multi-paragraph clinical diagnosis structure (Clinical Presentation, Behavioral Analysis, Mock Prescription) with proper newline rendering.
- `ai-roast-generator`: Update the diagnosis inference specifications to reflect dedicated diagnosis prompt generation, 1,000 max output tokens, and 2,500 character validation limit under the Google Gemini Free Tier.

## Impact

- `src/lib/server/roast.ts`: Dedicated `buildDiagnosisPrompt`, increased token ceiling (1,000 tokens), expanded character validator (2,500 chars), tag slice handling.
- `src/components/store/reader-roast-card.tsx`: Added `whitespace-pre-line` CSS class for paragraph presentation, passing `hours` and `orderCount` in payload.
- `src/lib/roast-fallbacks.ts`: Multi-paragraph fallback diagnoses for zero-order and active-order states in English and Portuguese.
- Gemini Free Tier: Zero cost ($0.00), consuming ~1,000 output tokens out of 8,192 per request and a fraction of the 1M TPM / 15 RPM quota.
