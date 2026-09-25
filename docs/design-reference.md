# Depois Eu Leio design reference

Source: `C:\Users\arthu\Downloads\Depois Eu Leio (1).html` (available here at `/mnt/c/Users/arthu/Downloads/Depois Eu Leio (1).html`). The app recreates the reference's structure using React and Tailwind utilities.

| Token | Value | Use |
| --- | --- | --- |
| Paper | `#f4f3ee` | Light page background |
| Ink | `#141210` | Type, outlines, offset shadows |
| Yellow | `#ffd84a` | Logo, primary actions, simulated zero-charge stamp |
| Red | `#e44f4b` | Classics and hero badge |
| Blue | `#5c80ed` | Illustrated hero panel and productivity |
| Green | `#86dc82` | Science fiction and confirmation |
| Pink | `#e9abd3` | Adventure and summary accents |

The reference uses Archivo Black for display text, Work Sans for body, Space Mono for compact metadata, and Bangers for occasional stamps. Controls and cards use 2–3 px outlines with hard 4–8 px offset shadows. The desktop hero places a large headline beside a blue dotted book display; mobile stacks them. Catalog cards use typographic covers rather than external book art. Styling lives in JSX Tailwind classes; `src/styles.css` holds tokens, font imports, and global accessibility rules.
