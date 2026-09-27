## Context

Previously, browser sessions could maintain an active `profile` object even without a corresponding registered user in the local `users` registry. This occurred when visitors had cached state from prior versions of the application or bypassed explicit account registration. Additionally, while the dedicated `/register` screen exists, checkout only offered a link to `/account` (login), confusing visitors who had no account yet.

To enforce real user creation, the system must require all users to complete registration via `/register` (Name, Email, Password, Confirmation) before accessing authenticated bookstore features (completing checkout and posting reviews). Any orphan profiles lacking a matching record in `users` must be automatically discarded upon storage hydration.

## Goals / Non-Goals

**Goals:**
- **Strict Registered Session Integrity**: An active session `profile` is only valid if `users[profile.email]` exists. Orphan sessions in `localStorage` are evicted (`profile: null`) on load and merge.
- **Mandatory Registration for Checkout**: Ensure the order placement flow is inaccessible to visitors without a registered account. Update the checkout auth prompt to prominently present account registration (`/register?returnTo=/checkout`) as well as login (`/account?returnTo=/checkout`).
- **Mandatory Registration for Reviews**: Prevent review submission without a validated registered account.
- **Eliminate Shortcuts**: No fake user generation buttons or mock bypasses; account creation must happen through the user registration form.

**Non-Goals:**
- Real server-side authentication, remote database synchronization, or email verification (this is an educational client-first neo-brutalist project).
- Restricting browsing, catalog search, or cart management for unauthenticated visitors.

## Decisions

### 1. Invalidation of Orphan Sessions in Store Hydration & Merge
- **Decision**: In `zustand` persistence `merge` and when hydrating storage, inspect `parsed.data.profile`. If `parsed.data.users` does not contain `parsed.data.profile.email`, set `profile: null`.
- **Rationale**: Completely prevents visitors from having an authenticated state without a persistent registered user entry.

### 2. Dual Action Gate on `/checkout`
- **Decision**: In `src/routes/checkout/index.tsx`, when `!profile` (or profile not in users), display a high-contrast neo-brutalist panel featuring two clear options:
  1. Primary Action: "Cadastre-se para finalizar" linking to `/register?returnTo=/checkout`
  2. Secondary Action: "Já tem conta? Entrar" linking to `/account?returnTo=/checkout`
- **Rationale**: Visitors who arrive at checkout without an account previously only saw a "Entrar" button, leading to a dead-end on `/account` if they hadn't registered.

### 3. Review Submission Enforcement
- **Decision**: In `src/routes/books/$bookId.tsx`, verify `profile && users[profile.email]` before displaying the review submission form. If unauthenticated, show a styled prompt linking to `/register` and `/account` with `returnTo=/books/${bookId}`.
- **Rationale**: Guarantees reviewers have legitimate local user credentials.

## Risks / Trade-offs

- **[Logout of users with legacy data]** → Any visitors with an active `profile` created before the `users` registry was introduced will be logged out upon refreshing. Mitigation: Cart items, wishlists, and orders are preserved; the user simply registers at `/register` to re-authenticate.
