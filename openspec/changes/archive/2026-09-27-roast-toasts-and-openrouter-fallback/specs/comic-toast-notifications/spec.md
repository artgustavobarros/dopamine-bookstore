## MODIFIED Requirements

### Requirement: Comic typography and close action
The toast notification SHALL display an uppercase sound-effect header (`sfx` / `tag`) formatted in Bangers font (`font-family: 'Bangers', cursive; font-size: 24px; letter-spacing: 0.05em; color: oklch(57.7% 0.245 27.325)`), limited to a maximum of 14 characters. The body message text SHALL render in Work Sans (`font-size: 16px; font-weight: 600; line-height: 1.35; text-wrap: pretty; color: var(--ink)`), limited to a maximum of 140 characters. The toast SHALL support an optional micro-action button rendered with `sm secondary` styling (maximum 18 characters) that triggers a dedicated callback (e.g., "Ver carrinho", "Desfazer", "Tentar de novo"). The toast SHALL include a close button (`×`) with a minimum 44×44px touch target and `aria-label="Fechar"` that expands on hover and immediately dismisses the toast when clicked. The toast container SHALL also dismiss the most recent active toast upon pressing the `Esc` key and upon a horizontal swipe-right gesture on touch devices.

#### Scenario: Toast header and interactive dismiss
- **WHEN** a toast with SFX tag `"DE NOVO?!"` and message `"Você já possui esse livro."` is displayed
- **THEN** the tag is rendered in red Bangers cursive font, the message is rendered in 16px semi-bold text, and clicking the `"×"` button, pressing `Esc`, or swiping right dismisses the toast

#### Scenario: Toast with contextual micro-action
- **WHEN** a toast includes an action button (e.g., label `"Ver carrinho"`)
- **THEN** an accessible secondary button appears inside the toast, clickable and focusable via keyboard Tab, without preventing dismiss or auto-dismiss

### Requirement: Entrance motion and stacking
The application SHALL animate new toast appearances using `@keyframes del-pop` with `cubic-bezier(.2, .9, .25, 1.2)` over 0.4 seconds, with the transform origin anchored at the beak location (`transform-origin: 85% 110%`), followed by a 2-degree shake on the onomatopoeia text for 200ms. Dismissed toasts SHALL animate out with a fade and 12px rightward translation over 200ms, while remaining toasts slide vertically into place over 200ms. Toasts SHALL be fixed to the bottom right (`right: 20px; bottom: 20px`), stacked vertically with a 20px gap, capped at the most recent 3 toasts. The toast auto-dismiss duration SHALL scale dynamically based on message length (`toastSeconds` base 6s + 40ms per character exceeding 80 characters, capped at 12s), and timer countdown SHALL pause while the user hovers over or focuses within the toast container. When `prefers-reduced-motion` is active, all entry, shake, and exit animations SHALL be disabled.

#### Scenario: Dynamic duration and hover pause
- **WHEN** a toast with a 130-character message is displayed and the user hovers over it
- **THEN** the base duration is calculated as 8.0 seconds (6s + 50 * 0.04s) and the dismiss countdown pauses until the pointer leaves the toast

#### Scenario: Exit animation and stack reordering
- **WHEN** a toast is dismissed from a stack of two toasts
- **THEN** the dismissed toast shifts 12px to the right while fading over 200ms, and the remaining toast smoothly slides to its new position

### Requirement: Universal application for roasts and system alerts
The application SHALL use the comic speech bubble toast system for all application alerts, including satirical AI and deterministic roasts, cart feedback (add, duplicate, remove), wishlist updates, checkout feedback (Pix code copied, checkout validation failure, card declined, Pix expired), order tracking stages, and registration confirmations. The toast container SHALL declare `role="status"` and `aria-live="polite"` for informational messages, but SHALL switch to `role="alert"` for critical P1 error events (such as `card-declined` and `pix-expired`). Onomatopoeias containing repeated celebratory or screeching letters SHALL provide a normalized `aria-label` for screen reader clarity.

#### Scenario: Triggering an informational system toast
- **WHEN** a user copies a Pix code or encounters a checkout failure
- **THEN** a comic speech bubble toast appears with an appropriate SFX tag (e.g. `"COPIADO!"` or `"OPA!"`) rather than an unstyled sonner pill

#### Scenario: High priority failure announcement
- **WHEN** a card is declined or a Pix payment window expires
- **THEN** the toast container renders with `role="alert"` so assistive technology announces it immediately, and the failure details also render inline on the page
