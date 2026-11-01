# Region Construction Guidelines

Everything visible is a *region* of the character grid or a producer of cells inside it.

## Two kinds of component
- **Producers** (`gridText`, `bigText`, `gridEmbed`, `textButton`) render `null` and register a
  `Region` — `{ id, rect, draw(state), reserve? }` — with `useRegion()`. The surface composes
  their cells; they never touch layout CSS.
- **Screens** (`textScreen`, `screenBody`, `newsList`, `articleBody`) decide *where* regions go
  and how tall they are, using the pure measuring helpers so a full document is placed in one
  pass rather than a `useState` conversation.

## Rules
- **Ids are stable and hierarchical**: `${prefix}-${kind}-${index-or-href}`. Re-registering with
  the same id replaces the region in place.
- **Geometry is in cells, never pixels.** Position with `col`/`row` (+ `anchor`, `align`);
  convert to pixels only when a real DOM node is needed (`gridEmbed`, the invisible `textButton`).
- **Reserve the rows you take.** A top-anchored region passes `reserve: row + rows` so the canvas
  grows; bottom-anchored groups report a footprint through `reserveFooter(id, rows)`.
- **Measure before you paint.** Row counts come from `wrapLines`/`blockRows`/`flowHeight`, which
  are arithmetic on the monospace cell width — no DOM round trips, no reflow loops.
- **Font sizes are props on the surface, not on the region**: a region inherits `fontSize`,
  `lineHeight` and `charWidth` from `useMonoSurface().metrics`.
- **Interaction is text.** Hover/focus/press bold the label and its box (`pt-b`); the only DOM
  affordances are the invisible, focusable `<Link>`/`<button>` and its `sr-only` text.
- **Depth is greyscale**: pick an opacity and let `inkClass` quantize it to the 40 `.pt-i*`
  classes; do not write inline styles per glyph run.

## Accessibility
Real elements, real order: links are `Link` (internal), `a target=_blank` (external/mailto),
`button` (actions). Focus must be visible in the painting, since there is no outline.

## Adding a glyph font
```bash
npm install --no-save figlet
node scripts/extract-big-font.mjs "Gothic" src/data/fonts/gothic.ts
```
`assets/figlet/` holds the rendered samples the fonts were identified from. `TextScreen` and
`MarkdownFlow` take `fonts: BigFont[]` and paint the first that fits the viewport, so a smaller
companion font is a data-only change.
