# Circle Clash Ultimate — Design System

This project uses an original interface inspired by the PlayStation analysis in
[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md/tree/main/design-md/playstation).
It is not affiliated with or endorsed by PlayStation.

## Direction

The product should feel like a finished console fighting game: cinematic imagery,
quiet interface chrome, immediate actions, and readable combat information. The UI
supports the game instead of competing with it.

## Tokens

```css
--color-canvas: #000000;
--color-surface: #121314;
--color-surface-raised: #18191d;
--color-primary: #0070d1;
--color-primary-pressed: #005cae;
--color-link-dark: #53b1ff;
--color-text: #ffffff;
--color-text-muted: rgb(255 255 255 / 68%);
--color-hairline: rgb(255 255 255 / 18%);
--radius-card: 8px;
--radius-dialog: 16px;
--radius-pill: 999px;
```

## Typography

- Use Inter and system sans-serif fallbacks. Do not add a proprietary font.
- Display text uses weight 300, tight but readable line height, and minimal tracking.
- Buttons use weight 700. Body copy uses weight 400 and a 1.5 line height.
- Uppercase is reserved for compact game-state labels, not paragraphs or large titles.

## Surfaces and layout

- Use black, near-black, and blue as the three structural surfaces.
- Let gameplay imagery occupy 60–70% of a desktop hero.
- Use a maximum content width of 1440px and an 8px spacing grid.
- Cards have an 8px radius and no resting shadow.
- Dialogs may use a 16px radius and a soft shadow to separate them from the game.
- Do not add decorative grids, mesh gradients, or ambient neon glows.

## Components

- Primary actions are solid blue pills, at least 48px high.
- Secondary actions are transparent pills with a quiet white hairline.
- Focus states must remain visible and use the primary or link-blue color.
- Controls need at least a 44px touch target.
- Game imagery uses an 8px radius with restrained overlays for text legibility.
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

- Use one blue accent per viewport; fighter-specific colors stay inside character art and combat.
- Never use orange unless a future commerce action is introduced.
- Do not imitate PlayStation logos, names, or proprietary assets.
- Prefer existing project imagery and procedural graphics over downloaded binaries.
