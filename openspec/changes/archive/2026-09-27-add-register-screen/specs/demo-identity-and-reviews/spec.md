## MODIFIED Requirements

### Requirement: Browser-local demo identity
The application SHALL let visitors register and log into a local demo account with a name and valid email. It SHALL label the identity as local and fictional, persist registered user records and the active authenticated session in `localStorage`, and allow sign-out. Upon sign-out, the active session is cleared while preserving user registration records, orders, and wishlist entries.

#### Scenario: Enter valid identity on login
- **WHEN** a visitor logs in with an email matching a registered account or submits valid login credentials
- **THEN** the account view and navigation display the chosen name, the authenticated state is saved to `localStorage`, and the profile survives page reloads

#### Scenario: Invalid login credentials or format
- **WHEN** a visitor submits invalid or missing login credentials
- **THEN** field-level validation appears with motion alert feedback and the session is not saved

#### Scenario: Sign out
- **WHEN** an authenticated visitor signs out
- **THEN** the active demo profile session is cleared from `localStorage` without deleting existing local orders, wishlist entries, or registered account profiles

## ADDED Requirements

### Requirement: Dedicated registration screen
The application SHALL provide a dedicated registration route (`/register`) matching the visual neo-brutalist styling, colors, and layout of the login screen. The form SHALL collect a display name, a valid email address, and password fields (with password confirmation). Form submissions SHALL create a persistent local user record, set the user as the active authenticated session in `localStorage`, and redirect the user to their target destination (`returnTo`) or the homepage.

#### Scenario: Successful registration
- **WHEN** a visitor completes the registration form with a non-blank name, a valid email, and matching password fields
- **THEN** a new account is registered in `localStorage`, the user is authenticated, and redirected to `returnTo` if provided, or the home page

#### Scenario: Registration validation error
- **WHEN** a visitor submits mismatched passwords, a blank name, or an invalid email
- **THEN** inline validation errors are animated into view using GSAP alerts and the account is not created

#### Scenario: Already registered email
- **WHEN** a visitor attempts to register with an email that is already registered locally
- **THEN** an informative error message is displayed directing the user to sign in instead

### Requirement: Cross-navigation between login and register screens
The application SHALL provide prominent, styled navigation links between the login view (`/account`) and the registration view (`/register`), preserving any active `returnTo` redirect query parameters during navigation.

#### Scenario: Navigate from login to register
- **WHEN** an unauthenticated visitor clicks the registration link on the login view
- **THEN** the user is taken to `/register` with any existing `returnTo` query parameter preserved

#### Scenario: Navigate from register to login
- **WHEN** a visitor clicks the login link on the registration view
- **THEN** the user is taken to `/account` with any existing `returnTo` query parameter preserved
