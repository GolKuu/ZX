# Circle Clash Ultimate — Design System

This project uses an original retro-futurist interface inspired by late-1980s
arcade cabinets, VHS title cards, and early computer terminals.

## Direction

The product feels like a premium 1980s arcade cabinet reimagined for the browser:
high-contrast cyan and magenta, sharp geometric framing, CRT scanlines, italic
display type, immediate actions, and readable combat information. The game remains
the focus while the interface supplies an unmistakable retro-futurist identity.

## Tokens

```css
--color-canvas: #050019;
--color-surface: #11072c;
--color-surface-raised: #180b39;
--color-primary: #ff2fb3;
--color-primary-pressed: #d91491;
--color-link-dark: #39f5ff;
--color-text: #fff8eb;
--color-text-muted: rgb(219 226 255 / 76%);
--color-hairline: rgb(57 245 255 / 34%);
--radius-card: 2px;
--radius-dialog: 4px;
--radius-pill: 2px;
```

## Typography

- Use system sans-serif, Impact-style condensed display type, and monospace UI labels.
- Display text is bold, italic, tightly spaced, and uppercase.
- Buttons use bold monospace lettering. Body copy stays calm and readable.
- Keep long paragraphs in normal case; reserve uppercase for titles and game-state labels.

## Surfaces and layout

- Use midnight purple surfaces with cyan and magenta accents.
- Let gameplay imagery occupy 60–70% of a desktop hero.
- Use a maximum content width of 1440px and an 8px spacing grid.
- Cards use sharp clipped corners, bright hairlines, and offset block shadows.
- Dialogs reuse the cyan outline and magenta offset-shadow treatment.
- Perspective grids and subtle CRT scanlines are allowed as procedural decoration.

## Components

- Primary actions are solid cyan rectangles with white outlines and magenta shadows.
- Secondary actions are transparent rectangles with a cyan hairline.
- Focus states must remain visible and use cyan or magenta.
- Controls need at least a 44px touch target.
- Game imagery uses clipped corners and restrained overlays for text legibility.
- Combat HUD elements may be denser than marketing UI, but must reuse the same colors.

## Motion

- Use 140–220ms transitions for scale, color, and opacity.
- Hovered game tiles or primary actions may scale up to 1.02.
- Never animate layout-critical dimensions.
- Disable non-essential transitions when `prefers-reduced-motion` is enabled.

## Responsive rules

- Desktop: editorial copy on the left, gameplay imagery on the right.
- Tablet: keep two columns while space permits; reduce image height and gutters.
- Mobile: stack copy above imagery, use full-width primary actions, and preserve 44px targets.
- Keep primary content usable at 320px without horizontal scrolling.

## Guardrails

- Use cyan for interaction and magenta for emphasis; fighter colors stay inside character art.
- Never use orange unless a future commerce action is introduced.
- Do not imitate real arcade brands, logos, or proprietary assets.
- Prefer existing project imagery and procedural graphics over downloaded binaries.
