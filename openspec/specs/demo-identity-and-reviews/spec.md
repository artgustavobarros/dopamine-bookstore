# demo-identity-and-reviews Specification

## Purpose
Browser-local demo identity, visitor authentication, checkout access control, and visitor reviews.
## Requirements
### Requirement: Browser-local demo identity
The application SHALL let visitors log into a local demo account using email and password, without requesting a name on the login screen. It SHALL label the identity as local and fictional, persist registered user records and the active authenticated session in `localStorage`, and allow sign-out. The application MUST ensure that any active demo profile session in storage is backed by a corresponding record in `users`; any unverified or orphan session SHALL be purged upon storage merge/initialization. Upon sign-out, the active session is cleared while preserving user registration records, orders, and wishlist entries.

#### Scenario: Enter valid identity on login
- **WHEN** a visitor logs in on `/account` with an email matching a registered account and valid password credentials
- **THEN** the account view and navigation display the registered user's name, the authenticated state is saved to `localStorage`, and the profile survives page reloads

#### Scenario: Invalid login credentials or format
- **WHEN** a visitor submits an unregistered email, incorrect password, or invalid email format on `/account`
- **THEN** field-level validation appears with motion alert feedback and the session is not saved

#### Scenario: Sign out
- **WHEN** an authenticated visitor signs out
- **THEN** the active demo profile session is cleared from `localStorage` without deleting existing local orders, wishlist entries, or registered account profiles

#### Scenario: Evict orphan profile sessions on load
- **WHEN** storage is hydrated or merged containing an active profile whose email does not match any registered user record in `users`
- **THEN** the active profile is set to `null` so unverified visitors are not treated as authenticated

### Requirement: Visitor reviews
The application SHALL let visitors with a demo profile submit a 1-to-5-star review with nonblank text for a book. Reviews SHALL be stored in local storage and displayed with the corresponding book. Submitting a review SHALL strictly require an active authenticated user whose email exists in the local `users` registry.

#### Scenario: Submit a review
- **WHEN** a signed-in visitor with a registered user account submits a valid rating and review text
- **THEN** the review appears on that book's detail page and survives reload

#### Scenario: Review without profile
- **WHEN** a visitor without a registered user profile tries to review a book
- **THEN** the application asks them to register or sign in and preserves the book destination for their return

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

### Requirement: Authentication guard for checkout
The application SHALL strictly require an authenticated user with an existing record in `users` before allowing order checkout. When an unauthenticated visitor accesses checkout, the system SHALL block order submission and display clear, prominent options to register a new account (`/register`) or sign in (`/account`), preserving the checkout return destination.

#### Scenario: Block checkout without registration
- **WHEN** an unauthenticated visitor accesses `/checkout` with items in their cart
- **THEN** the order payment form is blocked and an authentication required screen is shown directing the visitor to create an account or sign in

#### Scenario: Direct navigation from checkout to registration
- **WHEN** an unauthenticated visitor on `/checkout` clicks the call-to-action to create an account
- **THEN** the visitor is navigated to `/register?returnTo=/checkout` to register their user credentials
