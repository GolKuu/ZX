# docs/

Specifications that are **in scope for the vertical slice**.

| File | What it is | Binding on |
|---|---|---|
| [`UI-CCU-700-ui-ux.md`](./UI-CCU-700-ui-ux.md) | Front-end screens and combat HUD — tokens, layouts, interaction rules, accessibility | `F17`, `F21` |
| [`ui-mockups.html`](./ui-mockups.html) | Rendered mockups of all nine screens plus an interactive HUD state switcher | reference for the above |

**Open `ui-mockups.html` in a browser before implementing any UI.** It is the visual source of truth; the markdown is the measurable one.

---

## What is deliberately not here

A larger design corpus exists for this project — architecture, game design bible, world bible, character bible, art bible, audio bible, arena design, and a greenlight review. It describes a 32-month, 18-character production with rollback netcode, dual-language voice acting, and a story campaign.

**None of it is in scope**, and it is kept out of this repository on purpose. Rule `R1` in the root [`README.md`](../README.md) exists precisely because that material is seductive and will pull an implementation off-plan. The slice ships twenty-one features; everything else is a distraction until it ships.

If a document from that set is genuinely needed for a decision, add it under `docs/reference/` with a header stating it is **not** buildable scope.
