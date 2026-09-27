## 1. Store & Session Integrity

- [x] 1.1 Update `src/lib/store.ts` persistence merge and hydration logic to validate that `profile.email` exists in `users`, resetting orphan profiles to `null` if no registered user entry exists
- [x] 1.2 Update `completeOrder` and profile handling in `src/lib/store.ts` to guarantee that actions requiring authentication verify the user exists in `users`
- [x] 1.3 Add translation strings in `src/lib/i18n.ts` for checkout registration prompts and register call-to-actions in PT and EN

## 2. UI & Auth Guards

- [x] 2.1 Update unauthenticated gate in `src/routes/checkout/index.tsx` to prominently offer "Cadastre-se para finalizar" (`/register?returnTo=/checkout`) as primary action alongside "Entrar" (`/account?returnTo=/checkout`)
- [x] 2.2 Ensure book review section in `src/routes/books/$bookId.tsx` requires a verified registered account and links to `/register` and `/account` with `returnTo` preserved
- [x] 2.3 Verify that header and mobile navigation correctly direct unauthenticated visitors to `/register` and `/account`

## 3. Verification & Testing

- [x] 3.1 Add automated Playwright tests in `tests/auth.spec.ts` verifying orphan session eviction, blocked checkout for unauthenticated users, and successful checkout after mandatory user registration
- [x] 3.2 Run full test suite (`pnpm test:e2e`) and typecheck (`pnpm typecheck`) to verify all scenarios pass
