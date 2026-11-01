# Project Overview

A personal site whose entire UI is one measured monospace character grid. Text is not
laid out by CSS: it is painted cell by cell, so headings, prose, buttons and embeds all
share one coordinate system — and so does the rain.

## Tech Stack
- **Framework**: Next.js (App Router, v16.2.6), `output: 'export'`
- **Language**: TypeScript
- **UI Library**: React (v19.2.0) with the React Compiler
- **Styling**: Tailwind CSS (v4) — only for the black/white theme and the ink classes
- **Text measurement**: [@chenglou/pretext](https://github.com/chenglou/pretext)
- **Markdown**: our own subset reader (`src/components/text/markdownGrid.ts`), no markdown library

## Architecture
- `src/app/` — routes; each one renders a `TextScreen`
- `src/components/rainScreen/` — the surface: the character grid, the rain simulation, the
  screen shell, the controls and the per-screen content
- `src/components/text/` — grid primitives and regions: measurement, the region context,
  buttons, big glyphs, prose, embeds, markdown
- `src/data/` — `siteConfig.ts` (all content) and `fonts/` (glyph block data)
- `assets/figlet/` — the FIGlet font samples the glyph data was extracted from
- `scripts/` — generators and dev probes (see `AGENTS.md`)

## Rendering model
1. `useMonoMetrics` measures one monospace advance width with pretext; that fixes the column
   count for the surface's width.
2. `useViewportRows` + each region's `reserve` decide the row count: the canvas is at least a
   windowful tall and grows when content needs more, so long pages scroll.
3. Every frame the rain writes its cells into a scratch layer; a stable base layer (frame ring
   + region cells) wins wherever they overlap, and region rects are masked so rain never
   paints under a label or an embed.
4. Rows are recomposed only when their cells changed, unchanged rows keep their array identity,
   and ink depth uses 40 quantized greyscale classes rather than inline styles.

## Entry Points
- **Screen shell**: `src/components/rainScreen/textScreen.tsx`
- **Routes**: `src/app/page.tsx`, `src/app/news/`, `src/app/projects/`, `src/app/coolstuff/`
- **Layout**: `src/app/layout.tsx` (theme only — there is no header or footer yet)
