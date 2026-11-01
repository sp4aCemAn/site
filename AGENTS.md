# Agent Guidelines

## Project Overview
A personal-site **Next.js** + **TypeScript** template. All site content is driven by a single config file, `src/data/siteConfig.ts`. There is no route configurator — routes are plain files in `src/app/` and read their data from the config.

## Tech Stack
- **Framework**: Next.js (App Router, v16.2.6)
- **Language**: TypeScript
- **UI Library**: React (v19.2.0)
- **Styling**: Tailwind CSS (v4) with `@tailwindcss/typography`
- **Icons**: react-icons, lucide-react
- **Containerization**: Docker & Docker Compose
- **Deployment**: Vercel or GitHub Pages
- **Scripts**: Makefile

## Architecture & Conventions
- **Content**: `src/data/siteConfig.ts` is the single source of truth (site identity, nav, socials, home, about, articles).
- **Theme**: Pure black background / white text. Design tokens live in `src/app/globals.css` (`@theme`); `--color-inferno` is the white accent.
- **Text-as-structure**: `src/components/text/pretextBlock.tsx` is a client component that uses [`@chenglou/pretext`](https://github.com/chenglou/pretext) (`prepareWithSegments` + `measureLineStats` + `layoutWithLines`) to measure and paint text line-by-line — enabling multi-line shrink-wrap, line clamps with measured ellipsis, responsive size scaling and per-line reveal animations. Its canvas font string must stay in sync with `--font-sans` in globals.css.
- **Routing**: Hand-written routes in `src/app/` — `/`, `/news`, `/news/[slug]` (prerendered from `articles` via `generateStaticParams`, `dynamicParams = false`), `/projects`, `/coolstuff`. Each renders one `<TextScreen title>` (a full-viewport character grid) with content from `src/data/siteConfig.ts` (`homeScreen`, `newsScreen`, `projectsScreen`, `coolStuffScreen`, `articles`).
- **Text surface**: `src/components/rainScreen/rainScreen.tsx` owns the grid — `rainGrid.ts` layers rain ink under a stable base of frame + region cells — and provides the `MonoSurface` context (`src/components/text/monoSurface.tsx`). Children register **regions** (rects in cells) that paint themselves into the grid; region rects are masked, so the rain never falls under them:
  - `text/textButton.tsx` — invisible real `<Link>`/`<a>`/`<button>` with a painted `╔═╗` label; hover/focus/press bolds the glyphs.
  - `text/bigText.tsx` — glyph-font headings (52 blocks, A–Z then a–z).
  - `text/gridText.tsx` — normal prose, wrapped by pretext and painted cell for cell.
  - `text/gridEmbed.tsx` — a real web canvas (YouTube/Vimeo iframe or image) inside a painted box.
  - `text/markdownGrid.ts` + `text/markdownFlow.tsx` — the site's own markdown reader: blocks are measured into cell rows (`flowHeight`) and painted by the components above. Grammar and non-goals are documented in `docs/lms/markdown-rendering.md`; there is deliberately no HTML renderer in the tree.
  - `rainScreen/textScreen.tsx` (screen shell + title), `screenControls.tsx` (`MENU`/`CLOSE`, `RAIN ON`/`OFF`, nav + social rows), `screenBody.tsx` (prose, then embeds flowing below it).
- **Scrolling**: the surface sizes itself to `max(window rows, reserved + footer)`. Top-anchored regions pass `reserve` (rows they need from the top) and bottom-anchored groups report their footprint through `reserveFooter(id, rows)`; `RainScreen` then sets the host's inline height to `rows * lineHeight`, so a screen with more content than fits grows its canvas and the document scrolls instead of clipping. Never read `window` during render for this — the prerendered HTML must match the first client render or React leaves a stale inline height in place (measure in an effect and keep the pre-measure state covered by `min-h-[100svh]`).
- **Grid primitives**: `src/components/text/monoGrid.ts` — `MONO` stack (kept in sync with `--font-sans` in `globals.css` and `FAMILY` in `pretextBlock.tsx`), `measureMonoWidth`/`useMonoMetrics` (pretext measurement defines cols/rows), `Cell`, `ringCells`/`writeCells`, and `inkClass` — quantized greyscale via `.pt-i1`…`.pt-i40` in `globals.css`.
- **Big-text fonts**: data arrays in `src/data/fonts/` (52 glyph blocks, `A-Z` then `a-z`); generate from any FIGlet font with `node scripts/extract-big-font.mjs "Gothic" src/data/fonts/gothic.ts` after `npm install --no-save figlet`. `TextScreen` and `MarkdownFlow` take `fonts: BigFont[]` and paint the first that fits, so adding a smaller companion font for narrow screens is data-only.
- **Dev-only extras**: `scripts/perf.mjs <url> <throttle>` and `scripts/dump-screen.mjs` drive system Chrome via `puppeteer-core` (install with `--no-save`; never a site dependency).
- **Paths**: always run public asset paths through `getPublicPath`/`PublicImage` so the GitHub Pages basePath works.

## Development Workflow
1. **Configure**: Edit `src/data/siteConfig.ts` — identity, `navLinks`, `socials`, each screen's `blurb`/`embeds`.
2. **Customize**: components in `src/components/`; new on-screen content is a region — consume `useMonoSurface()` + `useRegion()` and paint `Cell[][]`.
3. **Deploy**: Docker or the Makefile for production; `npm run build` emits the static `out/` for GitHub Pages. Note: `docker-compose.yaml` gives `node_modules` and `.next` anonymous volumes — after dependency or CSS changes run `docker compose down -v && make run`, or stale chunks/CSS will be served.

## Key Commands
- **Dev**: `npm run dev` (Docker: `make run`, i.e. `docker compose up`)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Install**: `npm install`
- **Docker**: `docker-compose up --build`
- **Reset container volumes**: `docker compose down -v`
- **Perf probe**: `node scripts/perf.mjs http://localhost:3000/ 20`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
