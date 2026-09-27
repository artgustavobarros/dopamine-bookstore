## 1. Storage & State Management

- [x] 1.1 Update `src/lib/store.ts` state schema and types to include registered user records and ensure safe persistence in `localStorage`.
- [x] 1.2 Implement store methods for registering a new user (`registerUser`) and signing in (`signInUser`) with error/duplicate checks and automatic session storage.
- [x] 1.3 Maintain schema migration and hydration safety for existing localStorage store state.

## 2. Internationalization (i18n)

- [x] 2.1 Add Portuguese translations in `src/lib/i18n.ts` for registration titles, form labels (name, email, password, confirm password), validation errors, and login/register switch links.
- [x] 2.2 Add English translations in `src/lib/i18n.ts` matching all new registration copy and error messages.

## 3. Registration Screen Implementation

- [x] 3.1 Create route `src/routes/register.tsx` configured with `validateSearch` for `returnTo`.
- [x] 3.2 Build the registration form UI mirroring the login layout (neo-brutalist container, heavy borders, brutalist button, responsive spacing).
- [x] 3.3 Integrate `react-hook-form` and `zod` schema validation for name, email, password, and matching password confirmation.
- [x] 3.4 Wire up GSAP micro-animations for input validation alerts using `data-motion-alert`.
- [x] 3.5 Handle form submission: persist account in `localStorage`, set active authenticated session, and redirect to `returnTo` or homepage.

## 4. Login Screen & Cross-Navigation

- [x] 4.1 Update `src/routes/account.tsx` to include an action link navigating to `/register` ("Não tem conta? Cadastre-se") preserving `returnTo`.
- [x] 4.2 Include an action link on `src/routes/register.tsx` navigating back to `/account` ("Já tem conta? Entre") preserving `returnTo`.
- [x] 4.3 Ensure header and mobile navigation correctly link to auth routes and display authenticated user information.

## 5. Verification & Testing

- [x] 5.1 Run type-checking (`tsc --noEmit` or `pnpm build`) and route tree generation.
- [x] 5.2 Validate end-to-end user flow: registration form validation, successful account creation, `localStorage` persistence across page reloads, and redirect behavior.
