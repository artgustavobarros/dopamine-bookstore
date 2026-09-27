## Why

The bookstore currently has a basic profile/login form at `/account`, but lacks a dedicated registration screen ("tela de cadastro"). Users need an explicit registration flow that follows the exact neo-brutalist aesthetic and layout of the login screen, persists account credentials and authentication state locally in `localStorage`, and seamlessly integrates with checkout and review flows.

## What Changes

- **Dedicated Registration Screen**: Create a new `/register` route providing a registration form (Name, Email, Password, and Password Confirmation) styled with the brand's neo-brutalist visual design (heavy borders, high-contrast palette, GSAP-animated validation alerts, responsive layout).
- **Cross-Screen Navigation**: Add quick-toggle links between the login view (`/account`) and the registration view (`/register`) — e.g., "Não tem conta? Cadastre-se" on login, and "Já tem conta? Entre" on registration.
- **LocalStorage Authentication & Account Persistence**: Store registered users and maintain the active authenticated session in `localStorage` via the store persistence layer, ensuring users remain logged in across page reloads.
- **Post-Auth Redirection**: Preserve `returnTo` search parameters so that upon successful registration or login, the user is returned to checkout, a book review, or the homepage.
- **Internationalization (i18n)**: Add comprehensive Portuguese and English translations for registration titles, field placeholders, validation messages, and switch links.

## Capabilities

### New Capabilities
<!-- None: the existing demo-identity-and-reviews capability is extended -->

### Modified Capabilities
- `demo-identity-and-reviews`: Add user registration requirements, cross-navigation between login and register screens, and localStorage authentication session handling.

## Impact

- **Routes**: New `src/routes/register.tsx`, modifications to `src/routes/account.tsx`.
- **Store & Storage**: Enhance `src/lib/store.ts` to manage registered accounts and session authentication in `localStorage`.
- **Translations**: Extend `src/lib/i18n.ts` with registration strings in Portuguese and English.
- **Navigation**: Update header/mobile menu and account links to reflect auth status and entry points.
- **Testing**: Add or update Playwright tests for registration, login, and localStorage persistence.
