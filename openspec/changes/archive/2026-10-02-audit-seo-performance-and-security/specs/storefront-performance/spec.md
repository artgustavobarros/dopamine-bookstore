## ADDED Requirements

### Requirement: Measured mobile initial loading
The public homepage SHALL preserve visible hero text in the initial render and SHALL be measured with three Lighthouse mobile runs against the same production build. The median run SHALL reach performance score at least 90, LCP at most 2.5 seconds, TBT at most 200 milliseconds, and CLS at most 0.1 under the audit's fixed settings. The initial route SHALL avoid eagerly loading code used only by later interactions or other routes.

#### Scenario: Fresh mobile visit
- **WHEN** a visitor opens the homepage on a cold mobile session
- **THEN** the hero text is visible before optional animations execute and the documented Lighthouse median meets the budgets

#### Scenario: Reduced motion
- **WHEN** a visitor prefers reduced motion
- **THEN** the hero is visible without entrance motion and the page remains usable

### Requirement: Efficient critical assets
The homepage SHALL load only required font faces on the critical path and SHALL size its three featured covers for their rendered dimensions while retaining explicit image dimensions and a fallback when a remote cover fails.

#### Scenario: Featured cover unavailable
- **WHEN** Open Library does not serve a featured cover
- **THEN** its reserved cover area displays the existing text fallback without layout shift

