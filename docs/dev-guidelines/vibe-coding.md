# Vibe Coding Guidelines

"Vibe coding" here means working with the agent at the level of intent and structure, and
letting it handle the mechanical parts — as long as the interfaces stay honest.

## 1. The interface is the contract
The grid's contract is a region: `{ id, rect, draw(state), reserve? }` plus the cell type
`{ glyph, opacity, bold }`. Anything that obeys it composes with everything else without
touching the surface, so when a new screen is needed, define its shape first (data in
`src/data/siteConfig.ts`, placement in a `Screen*` component) and let the fill-in work be
generated.

## 2. Cells, not pixels
Layout questions are asked in rows and columns. Before writing code for a placement problem,
check whether it is really a measuring problem — `flowHeight`, `blockRows` and `wrapLines` are
pure functions, which is what lets a heading flow, a news list and a nav row coexist without
state ping-pong.

## 3. Keep the context small
- One region per file, named for what it paints (`gridText`, `bigText`, `textButton`,
  `gridEmbed`), not for what page it appears on.
- Point the agent at the two or three files a change actually touches. `AGENTS.md` lists the
  map; `docs/lms/components.md` lists the rules.
- Prefer data edits (`siteConfig.ts`, `src/data/fonts/`) over component edits when the look is
  the only thing changing.

## 4. Text carries the interface
No icon sets, no CSS chrome, no HTML renderer. If a control needs to exist, it is a real
`Link`/`button` whose visible state is drawn as glyphs — which also means every affordance has
to survive being read aloud or navigated by keyboard.

## 5. Verify by looking
Painted screens are easy to get subtly wrong. `node scripts/perf.mjs <url> <throttle>` reports
frame timing and long tasks under CPU throttling, `node scripts/dump-screen.mjs <url>` prints
what the grid actually rendered, and both are the cheapest way to catch a regression the type
checker cannot see.

## Why this works
The heavy lifting — measurement, quantized ink, dirty-row bookkeeping, keep-out masks — is
already mechanical and already covered by those probes, so review time goes to the thing that
actually needs judgement: whether the page reads as one screen.
