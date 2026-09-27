## Why

Currently, the login form on the `/account` route requires or displays a "Name" field in addition to email and password. Since user registration has been separated into its own dedicated screen (`/register`), a login form should only prompt for existing credentials (email and password). Asking for a name during login causes confusion for returning visitors and deviates from standard authentication practices.

## What Changes

- Remove the `name` input field and its validation errors from the `/account` login form.
- Update `profileFormSchema` in `src/routes/account.tsx` so that `name` is no longer a required or presented field for logging in.
- Update `signInUser` in `src/lib/store.ts` so login checks existing user records via email and password without expecting a new name input on sign-in (or handling fallback if an existing user has no recorded password).
- Update test cases in `tests/auth.spec.ts` to reflect the streamlined login form (only email and password).

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `demo-identity-and-reviews`: Update the browser-local demo identity requirement and login scenario so that logging in only requires email and password, without a name input.

## Impact

- **UI / Routes**: `src/routes/account.tsx` (removes the name input from the login form and updates the zod resolver schema).
- **Store**: `src/lib/store.ts` (verifies `signInUser` logic adheres to email + password without requiring name).
- **Tests**: `tests/auth.spec.ts` (ensures login verification tests only supply email and password).
