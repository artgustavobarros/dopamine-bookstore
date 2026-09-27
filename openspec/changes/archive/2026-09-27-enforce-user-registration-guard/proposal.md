## Why

Currently, visitors can find themselves in an authenticated session without having completed registration (due to legacy cached localStorage profile data or direct profile assignments), and checkout/reviews do not strictly enforce that the active session belongs to a locally registered account in `users`. Creating a user account via the registration flow (`/register`) must be strictly mandatory before using protected bookstore features (checkout and book reviews), ensuring all active sessions are tied to an authentic registered user and clearing unverified/orphan sessions.

## What Changes

- **Strict Registered Identity Enforcement**: Validate that any active demo `profile` corresponds to an entry in `users`. Discard orphan/legacy unverified profile sessions on store load/merge so visitors cannot bypass registration.
- **Mandatory Registration for Checkout**:
  - Unauthenticated visitors cannot submit orders.
  - The unauthenticated checkout gate clearly prompts visitors to create an account (`/register`) or sign in (`/account`) with preserved `returnTo=/checkout` redirection.
- **Mandatory Registration for Reviews**:
  - Book reviews cannot be submitted without an active registered account in `users`.
  - Visitors without an account are prompted to register or log in.
- **Removal of Fake Registration Shortcuts**: No automated or 1-click fake user generation; users must go through the dedicated registration flow (`/register`) to establish their account credentials.
- **Internationalization (i18n)**: Ensure all call-to-actions, gate messages, and auth requirements clearly communicate account creation requirements in Portuguese and English.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `demo-identity-and-reviews`: Require active authentication to match a locally registered user record, enforce account registration guards on checkout and reviews, and evict orphan unverified profile sessions.

## Impact

- **Store & Persistence**: Update `src/lib/store.ts` so session hydration and `merge` only retain profiles with valid corresponding `users` records.
- **Routes & UI**:
  - `src/routes/checkout/index.tsx`: Update unauthenticated checkout view to prominently direct users to `/register` (and `/account`) with `returnTo=/checkout`.
  - `src/routes/books/$bookId.tsx`: Ensure review section strictly checks for verified registered user and provides links to register/sign in.
- **Translations**: Update translation strings in `src/lib/i18n.ts` for checkout registration prompts in PT and EN.
- **Testing**: Update E2E tests in `tests/auth.spec.ts` and `tests/storefront.spec.ts` to verify orphan session eviction, mandatory account registration before checkout, and review barriers.
