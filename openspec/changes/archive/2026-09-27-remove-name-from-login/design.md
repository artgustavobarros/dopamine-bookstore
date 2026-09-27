## Context

The `/account` page serves as the sign-in and profile view for visitors. Historically, before a dedicated `/register` screen was implemented, the account form allowed entering a name, email, and password, creating a profile on the fly if not found. Since the dedicated registration flow (`/register`) was introduced, the presence of the "Name" field in `/account` creates confusion—users logging into an existing account do not need to provide or update their name during sign-in.

## Goals / Non-Goals

**Goals:**
- Remove the name input field, label, error alerts, and GSAP dependency triggers from the login form in `src/routes/account.tsx`.
- Update `profileFormSchema` (renaming or adapting to `loginFormSchema`) in `src/routes/account.tsx` to only validate `email` and `password`.
- Ensure `signInUser` in `src/lib/store.ts` handles sign-ins using `email` and `password` for existing users, returning appropriate error codes when an account is not found or credentials do not match.
- Preserve the navigation prompt linking users to `/register` if they do not yet have an account.
- Update Playwright E2E tests (`tests/auth.spec.ts`) to ensure login assertions only interact with email and password fields.

**Non-Goals:**
- Modifying the registration flow on `/register` (which continues to collect name, email, and password).
- Changing backend or external identity providers; session persistence remains browser-local via `localStorage`.

## Decisions

### Decision 1: Streamline login form schema to email and password
- **Approach**: Replace or simplify the Zod schema in `src/routes/account.tsx` so only `email` (valid email string) and `password` are present.
- **Rationale**: Keeps form validation lightweight and matches standard authentication UX conventions.
- **Alternatives considered**: Keeping `name` as hidden or optional—rejected because exposing or keeping it confuses user expectations during login.

### Decision 2: Clear messaging for unregistered users
- **Approach**: When `signInUser` returns `not_found`, display the existing `userNotFound` error prompt and highlight the `/register` link below the form.
- **Rationale**: Guides visitors seamlessly to create an account if they haven't done so yet.

## Risks / Trade-offs

- [E2E test reliance on name field in /account] → Update `tests/auth.spec.ts` so login checks only populate `#profile-email` and `#profile-password`.
- [Legacy profiles in localStorage without password] → If an existing local record doesn't require a password, allow login by email or prompt as appropriate.
