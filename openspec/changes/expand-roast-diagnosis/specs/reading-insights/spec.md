## MODIFIED Requirements

### Requirement: Dedicated Reader Psychological Roast (Diagnóstico do Leitor)
The application SHALL provide a dedicated "Diagnóstico do Leitor" (Reader's Roast / Fritada Literária) card in the `/stats` route that analyzes the visitor's overall shopping habits, pretend spend, favorite genres, accumulated pages, reading hours, and unread book hoarding. The card SHALL offer an on-demand "Gerar Diagnóstico" / "Generate Roast" action with animated feedback and display a detailed, multi-paragraph satirical psychological diagnosis report structured into clinical presentation, behavioral analysis, and mock medical prescription. The diagnosis report SHALL preserve paragraph line breaks with `whitespace-pre-line` formatting.

#### Scenario: Initial state with no orders
- **WHEN** a visitor visits `/stats` before completing any simulated orders
- **THEN** the roast panel displays an invitation to first accumulate books or indulge in some questionable decisions

#### Scenario: On-demand psychological roast generation
- **WHEN** a visitor with simulated purchases clicks to generate their psychological evaluation
- **THEN** an animated analysis state is displayed while the server generates the roast, followed by the multi-paragraph clinical diagnosis report citing their real stats and including an acidic behavioral analysis and cynical mock prescription

#### Scenario: Multi-paragraph line break presentation
- **WHEN** a diagnosis report containing section line breaks (`\n\n`) is rendered in the reader roast card
- **THEN** the text is displayed with distinct paragraphs and readable vertical rhythm without running together into a single continuous block
