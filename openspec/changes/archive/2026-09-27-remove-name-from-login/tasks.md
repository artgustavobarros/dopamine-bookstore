## 1. Route & Component Updates

- [x] 1.1 Update `src/routes/account.tsx` form schema to validate only `email` and `password`
- [x] 1.2 Remove the Name input field, label, error display, and related animation triggers from `src/routes/account.tsx`
- [x] 1.3 Update form submission handler in `src/routes/account.tsx` to pass email and password to `signInUser`

## 2. Store & Logic Adjustments

- [x] 2.1 Adjust `signInUser` in `src/lib/store.ts` so sign-in operates strictly on existing registered credentials without expecting name input
- [x] 2.2 Verify translation keys and error alerts in `src/lib/i18n.ts`

## 3. Testing and Verification

- [x] 3.1 Update E2E test in `tests/auth.spec.ts` to remove references to `#profile-name` and assert login with only email and password
- [x] 3.2 Run typecheck and Playwright test suite to verify tests pass cleanly
