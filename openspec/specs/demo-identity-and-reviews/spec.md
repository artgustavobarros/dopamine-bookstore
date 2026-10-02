# demo-identity-and-reviews Specification

## Purpose
Browser-local demo profiles, checkout access control, and visitor reviews.

## Requirements
### Requirement: Browser-local demo identity
The application SHALL let visitors manage a browser-local demo profile without collecting or storing a password. The profile in `localStorage` SHALL support saved demo addresses and simulated payment card labels/last four digits. Auth submission buttons SHALL retain the existing dark background and red offset shadow styling. On sign-out, the active demo profile is cleared while local orders, wishlist, and other demo records remain. The UI SHALL identify the profile as local to this device and SHALL not imply server authentication.

#### Scenario: Manage multiple saved addresses in profile
- **WHEN** a visitor with a local demo profile adds a labeled address
- **THEN** it is saved locally and becomes available in the simulated checkout

#### Scenario: Manage simulated payment methods
- **WHEN** a visitor saves a simulated payment method
- **THEN** only its display name, brand, expiration, and last four digits are persisted locally and can be selected in checkout

#### Scenario: Auth submit button styling
- **WHEN** a visitor views the profile or registration form
- **THEN** the submit button retains the existing dark background and red offset shadow behavior

#### Scenario: Sign out
- **WHEN** a visitor signs out
- **THEN** the active profile is cleared without deleting local orders or wishlist entries

### Requirement: Visitor reviews
The application SHALL let visitors with a demo profile submit a 1-to-5-star review with nonblank text for a book. Reviews SHALL be stored in local storage and displayed with the corresponding book. Submitting a review SHALL require an active local profile whose email exists in the local `users` registry.

#### Scenario: Submit a review
- **WHEN** a visitor with an active local profile submits a valid rating and review text
- **THEN** the review appears on that book's detail page and survives reload

#### Scenario: Review without profile
- **WHEN** a visitor without a registered user profile tries to review a book
- **THEN** the application asks them to create or select a local profile and preserves the book destination for their return

### Requirement: Dedicated registration screen
The application SHALL provide `/register` in the existing visual style and collect only a display name and valid email for a local demo profile. It SHALL not collect a password or represent the profile as a secure account. Submission SHALL create a persistent local record, select it as the active demo profile, and navigate to a validated internal `returnTo` destination or the homepage.

#### Scenario: Successful registration
- **WHEN** a visitor submits a nonblank name and valid email not already recorded on that device
- **THEN** a local demo profile is created and the visitor is sent to the valid internal destination or homepage

#### Scenario: Registration validation error
- **WHEN** a visitor submits a blank name or invalid email
- **THEN** an inline error appears and no local record is created

#### Scenario: Already registered email
- **WHEN** a visitor submits an email already recorded locally
- **THEN** the form directs them to select that local profile instead

### Requirement: Cross-navigation between profile selection and registration screens
The application SHALL provide prominent, styled navigation links between the profile selection view (`/account`) and the registration view (`/register`), preserving any active `returnTo` redirect query parameters during navigation.

#### Scenario: Navigate from login to register
- **WHEN** a visitor without an active local profile clicks the registration link on the profile selection view
- **THEN** the user is taken to `/register` with any existing `returnTo` query parameter preserved

#### Scenario: Navigate from register to login
- **WHEN** a visitor clicks the profile selection link on the registration view
- **THEN** the user is taken to `/account` with any existing `returnTo` query parameter preserved

### Requirement: Local profile guard for checkout
The application SHALL require an active local demo profile with an existing record in `users` before allowing simulated order checkout. When a visitor without one accesses checkout, the system SHALL block order submission and display clear, prominent options to create a new profile (`/register`) or select an existing profile (`/account`), preserving the checkout return destination.

#### Scenario: Block checkout without registration
- **WHEN** a visitor without an active local profile accesses `/checkout` with items in their cart
- **THEN** the order payment form is blocked and a profile required screen directs the visitor to create or select a local profile

#### Scenario: Direct navigation from checkout to registration
- **WHEN** a visitor without an active local profile on `/checkout` clicks the call-to-action to create a profile
- **THEN** the visitor is navigated to `/register?returnTo=/checkout` to create a local demo profile

### Requirement: Legacy plaintext credential removal
The application SHALL remove password fields from every persisted local user record during a versioned migration, without discarding the visitor's cart, orders, wishlist, reviews, or non-secret profile data. New persisted state SHALL not contain a password property.

#### Scenario: Upgrade existing browser state
- **WHEN** a browser with a prior version containing a plaintext local password loads the new application
- **THEN** the migrated state retains demo data and removes the password from storage

#### Scenario: New local profile
- **WHEN** a visitor creates a profile after migration
- **THEN** no password field is requested or stored
