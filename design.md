# Pediloo presentation design system

## Design read

Reading this as: technical defense presentation for students and evaluators, with a product-education language, leaning toward a dark editorial systems board instead of a marketing landing page.

## Intent

The presentation explains how Pediloo works from React to Express to SQLite. The visual system must make code, theory, evidence and caveats easy to scan while keeping the Pediloo identity visible.

## Dials

- `DESIGN_VARIANCE: 6` for diagrams with a little asymmetry, but enough structure for an oral defense.
- `MOTION_INTENSITY: 4` for slide transitions and progressive reveals that explain sequence.
- `VISUAL_DENSITY: 7` because the deck carries source paths, code, contracts and defense notes.

## Brand source

The palette is extracted from the working `reactfinal` project and its brand assets:

- `F:/Escritorio/reactfinal/public/assets/logoheader.png`
- `F:/Escritorio/reactfinal/src/App.css`
- `F:/Escritorio/reactfinal/src/index.css`

The presentation copies the real wordmark to `public/brand/logoheader.png` so the deck does not redraw the logo.

## Color tokens

| Token | Value | Use |
| --- | --- | --- |
| `--brand-forest` | `#2a6053` | primary brand, links, active navigation |
| `--brand-deep` | `#1f483e` | pressed/hover state and dark brand contrast |
| `--brand-mint` | `#3bb393` | primary accent and diagram flow |
| `--brand-mint-bright` | `#48f7c6` | small highlights and focus only |
| `--brand-soft` | `#a1d1bf` | readable accent text on dark surfaces |
| `--brand-pale` | `#d7efe4` | pale mint emphasis |
| `--brand-coral` | `#c75d3a` | warning, caveat and fallback states |
| `--brand-coral-soft` | `#ffa585` | readable coral text on dark surfaces |
| `--brand-yellow` | `#f9d276` | secondary emphasis and metrics |
| `--surface-0` | `#121413` | page background |
| `--surface-1` | `#1a1e1c` | cards and panels |
| `--surface-2` | `#222a27` | code panels and selected surfaces |
| `--ink` | `#f3f6f5` | primary text |
| `--ink-muted` | `#a4adab` | secondary text |
| `--line` | `rgba(240, 245, 243, 0.10)` | separators |
| `--line-strong` | `rgba(240, 245, 243, 0.18)` | focus and structural borders |

Only the brand palette is used. There are no presentation-only blue, purple or orange tokens.

## Typography

- Display and body: `Space Grotesk Variable`, already installed in the project.
- Code, source paths and small labels: `JetBrains Mono Variable`, already installed.
- Headlines are left-aligned, compact and sentence case.
- Code is never smaller than `0.72rem` on desktop and scrolls horizontally on small screens.

## Layout

- One dark theme across the full deck.
- Max content width: `1180px`.
- Desktop slides use a two-column or asymmetric grid when the content benefits from comparison.
- Long theory is split into short evidence blocks. Each block states the concept, implementation and defense line.
- Cards are used only for real units of evidence, not as decoration.
- Radius scale: `12px` for panels, `8px` for controls, `999px` only for status markers.
- Grid and flexbox handle layout. React only manages slide state, navigation and interactive behavior.

## Content pattern

Every technical slide uses this order when applicable:

1. **Idea**: what the concept means.
2. **Evidence**: exact path and line range from the guide.
3. **Code**: the smallest relevant piece from the project.
4. **Defense**: the sentence to use in an oral explanation.
5. **Limit**: the honest caveat, when the guide documents one.

## Motion and accessibility

- Slide changes use `motion/react` with `MotionConfig`.
- Motion supports hierarchy and sequence, never decoration without meaning.
- `prefers-reduced-motion` disables translation and scale changes.
- Keyboard navigation: Arrow keys, Page Up/Down, Home, End and Space.
- Every interactive control has a visible focus ring using `--brand-mint-bright`.
- Code blocks remain readable without syntax color because contrast is carried by text and spacing.

## Image and asset rules

- Use the actual Pediloo wordmark from `public/brand/logoheader.png`.
- Do not replace the wordmark with a CSS approximation.
- Diagrams are HTML/CSS and text because they represent architecture, not fake product screenshots.
- No decorative image is introduced when the code path is the more useful evidence.

## Verification checklist

- All presentation colors resolve to the tokens above.
- The deck builds with the existing `npm run build` script.
- Every major guide block appears in at least one slide: architecture, boot, request flow, REST, model, ABM, auth, cart, checkout, orders, responsive behavior, functional logic, Atomic Design, T1-T7 theory, decisions, findings, defense demo and reproducible verification.
- Source paths remain visible beside code so the deck is defensible and auditable.
