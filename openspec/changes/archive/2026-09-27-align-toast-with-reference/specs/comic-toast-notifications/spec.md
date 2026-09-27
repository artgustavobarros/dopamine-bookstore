# comic-toast-notifications Specification

## ADDED Requirements

### Requirement: Comic speech bubble toast visual design
The application SHALL render all toast notifications as neo-brutalist comic speech bubbles. The bubble container SHALL have a white/card background (`bg-card`), an 18px border radius (`border-radius: 18px`), a 3px solid ink border (`border: 3px solid var(--line)`), and a solid 6px neo-brutalist offset shadow (`box-shadow: 6px 6px 0 var(--line)`). The bubble container SHALL feature a speech bubble tail/beak positioned at the bottom right (`bottom: -12px; right: 36px; width: 20px; height: 20px; border-right: 3px solid var(--line); border-bottom: 3px solid var(--line); transform: rotate(45deg) skew(12deg, 12deg); background: var(--card)`).

#### Scenario: Visual presentation of comic toast
- **WHEN** any toast notification is triggered in light or dark mode
- **THEN** it renders with an 18px rounded speech bubble, 3px solid ink border, 6px offset shadow, and a speech bubble beak at the bottom-right

### Requirement: Comic typography and close action
The toast notification SHALL display an uppercase sound-effect header (`sfx` / `tag`) formatted in Bangers font (`font-family: 'Bangers', cursive; font-size: 24px; letter-spacing: 0.05em; color: oklch(57.7% 0.245 27.325)`). The body message text SHALL render in Work Sans (`font-size: 16px; font-weight: 600; line-height: 1.35; text-wrap: pretty; color: var(--ink)`). The toast SHALL include a close button (`×`) in the top right that expands to `scale(1.25)` and turns red (`oklch(63.7% 0.237 25.331)`) on hover, immediately dismissing the toast when clicked.

#### Scenario: Toast header and interactive dismiss
- **WHEN** a toast with SFX tag `"DE NOVO?!"` and message `"Você já possui esse livro."` is displayed
- **THEN** the tag is rendered in red Bangers cursive font, the message is rendered in 16px semi-bold text, and clicking the `"×"` button dismisses the toast

### Requirement: Entrance motion and stacking
The application SHALL animate new toast appearances using `@keyframes del-pop` with `cubic-bezier(.2, .9, .25, 1.2)` over 0.4 seconds, with the transform origin anchored at the beak location (`transform-origin: 85% 110%`). Toasts SHALL be fixed to the bottom right (`right: 20px; bottom: 20px`), stacked vertically with a 20px gap, capped at the most recent 3 toasts, and automatically dismiss after a configurable duration (defaulting to 6 seconds).

#### Scenario: Toast animation on trigger
- **WHEN** a toast is mounted
- **THEN** it animates into view with a spring pop (`del-pop`) originating from `85% 110%` and automatically fades/dismisses after 6 seconds

### Requirement: Universal application for roasts and system alerts
The application SHALL use the comic speech bubble toast system for all application alerts, including satirical AI and deterministic roasts, cart feedback (add, duplicate), wishlist updates, checkout feedback (Pix code copied, checkout validation failure), order tracking stages, and registration confirmations.

#### Scenario: Triggering an informational system toast
- **WHEN** a user copies a Pix code or encounters a checkout failure
- **THEN** a comic speech bubble toast appears with an appropriate SFX tag (e.g. `"COPIADO!"` or `"OPA!"`) rather than an unstyled sonner pill
