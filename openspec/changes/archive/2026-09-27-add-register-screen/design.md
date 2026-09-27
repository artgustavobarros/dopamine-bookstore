## Context

The application is a satirical, high-dopamine fictional bookstore built with TanStack Router, Zustand, Tailwind CSS, and GSAP. Currently, user identification is managed as a demo profile directly inside `/account`. The user requested a dedicated registration screen ("tela de cadastro") that follows the exact visual layout of the login screen and persists authentication state in `localStorage`.

## Goals / Non-Goals

**Goals:**
- Provide a dedicated `/register` route matching the neo-brutalist UI layout, typography, and motion of the login screen (`/account`).
- Implement form handling using `react-hook-form` and `zod` for Name, Email, Password, and Password Confirmation with inline GSAP-animated error alerts.
- Store registered demo accounts in `localStorage` and persist the active authenticated session (`profile`) in the existing Zustand store persistence layer.
- Support bidirectional navigation between Login (`/account`) and Register (`/register`), retaining the `returnTo` redirect parameter.
- Maintain full bilingual support (`pt` and `en`) for all registration labels, buttons, helper notes, and validation errors.

**Non-Goals:**
- Real remote backend authentication, password encryption servers, or third-party OAuth providers (the bookstore is entirely simulated and client-side by design).
- Password recovery email flows or multi-factor authentication.

## Decisions

### 1. Dedicated Route (`/register`) vs. Tabbed View
- **Decision**: Create a dedicated `src/routes/register.tsx` file route.
- **Rationale**: Clean URL structure, deep-linking with `returnTo` query parameters, native browser history support, and natural alignment with TanStack Router file-based conventions.
- **Alternatives considered**: In-place tab switching on `/account`. Rejected because dedicated URLs provide better DX and user navigation when redirected from actions like book reviews or checkout.

### 2. State & Storage Architecture in Zustand
- **Decision**: Extend `src/lib/store.ts` to persist a registered users directory `users: Record<string, { email: string; name: string; password?: string }>` alongside `profile: Profile | null`.
- **Rationale**:
  - The active user session remains represented by `profile`, preserving compatibility across the entire application (checkout, reader reviews, navbar display).
  - Newly registered users are saved into `users` in `localStorage` (via the existing `persist` middleware with `safeStorage`).
  - Upon registering, the active `profile` is immediately populated, authenticating the user.
  - Signing in on `/account` validates against registered accounts or provides helpful feedback, saving the session to `localStorage`.
- **Alternatives considered**: Direct `window.localStorage.setItem()` outside Zustand. Rejected because Zustand `persist` already handles safe fallback storage, SSR safety, schema migration, and automatic reactivity.

### 3. Visual Layout and Motion System Alignment
- **Decision**: Build `/register` using identical markup, borders (`border-[3px] border-line`), colors (`bg-surface`, `bg-paper`, `shadow-[6px_6px_0_var(--line)]`), and GSAP alert animations (`useGSAP`, `withMotion`, `data-motion-alert`).
- **Rationale**: Maintains the distinct neo-brutalist aesthetic of "Depois Eu Leio" and guarantees visual parity with the login screen.

## Risks / Trade-offs

- **[Risk] Schema migration issues with existing localStorage data**
  → *Mitigation*: Update `savedSchema` in `src/lib/store.ts` using `z.record(userSchema).default({})` and provide safe defaults in `merge` so existing users' stored data remains valid without resetting carts or orders.
- **[Risk] TanStack Router route tree mismatch**
  → *Mitigation*: Verify route generation via `pnpm build` or `vite` so that `src/routeTree.gen.ts` registers `/register` without route conflicts.
