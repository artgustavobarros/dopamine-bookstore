## 1. Server Prompt and Token Limits

- [x] 1.1 Implement dedicated `buildDiagnosisPrompt` in `src/lib/server/roast.ts` separate from toast prompt logic
- [x] 1.2 Update `getSystemPrompt` for `isDiagnosis` with 3-part clinical report structure (Quadro Clínico, Análise Comportamental, Prescrição Médica)
- [x] 1.3 Increase `maxOutputTokens` to 1,000 and expand response validation length up to 2,500 characters
- [x] 1.4 Support clinical report header tags up to 24 characters without slicing

## 2. Frontend Presentation and Context Payload

- [x] 2.1 Add `whitespace-pre-line` to the diagnosis paragraph container in `src/components/store/reader-roast-card.tsx`
- [x] 2.2 Pass reading `hours` and `orderCount` from `getStats` into `generateDiagnosisFn`

## 3. Fallback and Verification

- [x] 3.1 Upgrade `getDiagnosisFallback` in `src/lib/roast-fallbacks.ts` to provide rich multi-paragraph clinical reports
- [x] 3.2 Run `pnpm typecheck` and Playwright tests (`tests/roasts.spec.ts`) to ensure zero regressions
