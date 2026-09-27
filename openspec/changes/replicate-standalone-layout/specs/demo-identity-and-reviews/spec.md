## MODIFIED Requirements

### Requirement: Browser-local demo identity
The application SHALL let visitors manage a local demo account session and persistent profile. The user profile in `localStorage` SHALL support a collection of saved delivery addresses (with custom labels, address details, and a designated preferred address) and saved payment cards (with detected card brand, last 4 digits, and expiration date). Auth submission buttons SHALL be rendered with dark backgrounds and vivid red offset shadows (`box-shadow: 4px 4px 0 oklch(63.7% 0.237 25.331)`) that expand on hover. Upon sign-out, the active session is cleared while preserving user registration records, saved addresses, orders, and wishlist entries.

#### Scenario: Manage multiple saved addresses in profile
- **WHEN** an authenticated visitor adds a new address with a custom nickname and CEP on the account page
- **THEN** the address is saved to their profile, can be set as preferred, and becomes immediately available in checkout

#### Scenario: Manage saved payment methods in profile
- **WHEN** an authenticated visitor saves a card or sets a preferred payment method
- **THEN** the card appears in their saved payment methods list and pre-selects that payment method in checkout

#### Scenario: Auth submit button styling
- **WHEN** an unauthenticated visitor views the login or registration form
- **THEN** the submit button displays an ink background with a bold red offset shadow expanding from 4px to 6px on hover

#### Scenario: Sign out
- **WHEN** an authenticated visitor signs out
- **THEN** the active demo profile session is cleared from `localStorage` without deleting existing local orders, wishlist entries, or registered account profiles
