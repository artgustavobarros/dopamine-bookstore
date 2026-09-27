## MODIFIED Requirements

### Requirement: Roast Comedy Prompt and Tone Calibration
The roast generation prompt SHALL instruct the model to adopt the persona of a satirical comedy roast master specialized in reader habits (*tsundoku*, buying 1000-page classics as intellectual trophies, productivity illusions, installment payment rationalizations, endless wishlist graveyards, category hopping, and perpetual search paralysis). The prompt SHALL instruct the model to return concise responses (maximum 2 sentences) accompanied by an uppercase sound-effect tag (`tag`, e.g. `[ALERTA!]`, `[TERAPIA JÁ]`, `[CEMITÉRIO DE DESEJOS]`, `[TURISTA LITERÁRIO]`, `[BUSCA INFINITA]`).

#### Scenario: Acidic roast generation with sound effect
- **WHEN** the user adds multiple Russian literature books or crosses 1,000 pages in their cart
- **THEN** the generated roast contains an uppercase tag in brackets and a punchy, ironic one-or-two-sentence joke targeting that specific behavior

#### Scenario: Wishlist and browsing roast generation
- **WHEN** the user crosses 1,000 or 2,000 wishlist pages, switches categories more than 3 times, or runs more than 3 searches
- **THEN** the generated roast contains an uppercase tag in brackets and punchy satire targeting wishlist hoarding, genre commitment phobia, or search paralysis

#### Scenario: Bilingual output
- **WHEN** the client requests a roast with locale `pt` or `en`
- **THEN** the prompt directs the model to output the tag and punchline in the matching language with appropriate cultural references
