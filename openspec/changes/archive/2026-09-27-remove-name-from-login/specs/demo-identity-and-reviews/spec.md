## MODIFIED Requirements

### Requirement: Browser-local demo identity
The application SHALL let visitors log into a local demo account using email and password, without requesting a name on the login screen. It SHALL label the identity as local and fictional, persist registered user records and the active authenticated session in `localStorage`, and allow sign-out. Upon sign-out, the active session is cleared while preserving user registration records, orders, and wishlist entries.

#### Scenario: Enter valid identity on login
- **WHEN** a visitor logs in on `/account` with an email matching a registered account and valid password credentials
- **THEN** the account view and navigation display the registered user's name, the authenticated state is saved to `localStorage`, and the profile survives page reloads

#### Scenario: Invalid login credentials or format
- **WHEN** a visitor submits an unregistered email, incorrect password, or invalid email format on `/account`
- **THEN** field-level validation appears with motion alert feedback and the session is not saved

#### Scenario: Sign out
- **WHEN** an authenticated visitor signs out
- **THEN** the active demo profile session is cleared from `localStorage` without deleting existing local orders, wishlist entries, or registered account profiles
