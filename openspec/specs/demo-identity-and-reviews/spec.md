# demo-identity-and-reviews Specification

## Purpose
TBD - created by archiving change build-dopamine-bookstore. Update Purpose after archive.
## Requirements
### Requirement: Browser-local demo identity
The application SHALL let visitors enter a name and valid email for a demo profile. It SHALL label the profile as local and fictional, persist it in local storage, and allow sign-out. It SHALL NOT request or retain a password.

#### Scenario: Enter valid identity
- **WHEN** a visitor submits a name and valid email
- **THEN** the account view and navigation display the chosen name, and the profile survives reload

#### Scenario: Invalid identity
- **WHEN** a visitor submits a blank name or invalid email
- **THEN** field-level validation appears and the profile is not saved

#### Scenario: Sign out
- **WHEN** a visitor signs out
- **THEN** the active demo profile is cleared without deleting existing local orders or wishlist entries

### Requirement: Visitor reviews
The application SHALL let visitors with a demo profile submit a 1-to-5-star review with nonblank text for a book. Reviews SHALL be stored in local storage and displayed with the corresponding book.

#### Scenario: Submit a review
- **WHEN** a signed-in demo visitor submits a valid rating and review text
- **THEN** the review appears on that book's detail page and survives reload

#### Scenario: Review without profile
- **WHEN** a visitor without a demo profile tries to review a book
- **THEN** the application asks them to create a demo identity and preserves the book destination for their return

