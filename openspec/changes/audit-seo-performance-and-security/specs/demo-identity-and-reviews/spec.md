## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Legacy plaintext credential removal
The application SHALL remove password fields from every persisted local user record during a versioned migration, without discarding the visitor's cart, orders, wishlist, reviews, or non-secret profile data. New persisted state SHALL not contain a password property.

#### Scenario: Upgrade existing browser state
- **WHEN** a browser with a prior version containing a plaintext local password loads the new application
- **THEN** the migrated state retains demo data and removes the password from storage

#### Scenario: New local profile
- **WHEN** a visitor creates a profile after migration
- **THEN** no password field is requested or stored

