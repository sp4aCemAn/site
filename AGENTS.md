# Agent Guidelines

## Project Overview
A personal-site **Next.js** + **TypeScript** app whose entire interface is one measured monospace
character grid: rain, headings, prose, buttons and embeds are painted cell by cell, with no CSS
layout and no icon sets. All content is driven by a single config file, `src/data/siteConfig.ts`.
There is no route configurator — routes are plain files in `src/app/` that read from the config.

## Tech Stack
- **Framework**: Next.js (App Router, v16.2.6), `output: 'export'`, React Compiler on
- **Language**: TypeScript, React (v19.2.0)
- **Styling**: Tailwind CSS (v4) — theme tokens and the quantized ink classes only
- **Text measurement**: `@chenglou/pretext` (the site's only rendering dependency)
- **Markdown**: our own subset reader; no markdown or HTML renderer in the tree
- **Containerization**: Docker & Docker Compose (dev) and a nginx static runner image
- **Deployment**: static `out/` — GitHub Pages, Vercel, or Docker
- **Scripts**: Makefile (`make run`, `make down`)

## Architecture & Conventions
- **Content**: `src/data/siteConfig.ts` is the single source of truth: `site` (identity + `navLinks`), `socials`, one `ScreenContent` per screen and `articles`.
- **Theme**: pure black background, white text, depth by greyscale opacity. Tokens live in `src/app/globals.css` (`@theme`); there is no header or footer yet.
- **Routing**: Hand-written routes in `src/app/` — `/`, `/news`, `/news/[slug]` (prerendered from `articles` via `generateStaticParams`, `dynamicParams = false`), `/projects`, `/coolstuff`. Each renders one `<TextScreen title>` (a full-viewport character grid) with content from `src/data/siteConfig.ts` (`homeScreen`, `newsScreen`, `projectsScreen`, `coolStuffScreen`, `articles`).
- **Text surface**: `src/components/rainScreen/rainScreen.tsx` owns the grid — `rainGrid.ts` layers rain ink under a stable base of frame + region cells — and provides the `MonoSurface` context (`src/components/text/monoSurface.tsx`). Children register **regions** (rects in cells) that paint themselves into the grid; region rects are masked, so the rain never falls under them:
  - `text/textButton.tsx` — invisible real `<Link>`/`<a>`/`<button>` with a painted `╔═╗` label; hover/focus/press bolds the glyphs.
  - `text/bigText.tsx` — glyph-font headings (52 blocks, A–Z then a–z).
  - `text/gridText.tsx` — normal prose, wrapped by pretext and painted cell for cell.
  - `text/gridEmbed.tsx` — a real web canvas (YouTube/Vimeo iframe or image) inside a painted box.
  - `text/markdownGrid.ts` + `text/markdownFlow.tsx` — the site's own markdown reader: blocks are measured into cell rows (`flowHeight`) and painted by the components above. Grammar and non-goals are documented in `docs/lms/markdown-rendering.md`; there is deliberately no HTML renderer in the tree.
  - `rainScreen/textScreen.tsx` (screen shell + title), `screenControls.tsx` (`MENU`/`CLOSE`, with the nav, social and `RAIN ON`/`OFF` rows inside it — the rain toggle is hidden until the menu opens), `screenBody.tsx` (prose, then embeds flowing below it).
- **Persisted state**: the rain on/off choice is kept in `localStorage` under `textscreen.rain` (see `readRain`/`writeRain` in `rainScreen.tsx`), because a static export has no server to read a cookie; it is read lazily with a `typeof window` guard so the prerendered HTML stays deterministic, and a `storage` listener keeps other tabs in step.
- **Scrolling**: the surface sizes itself to `max(window rows, reserved + footer)`. Top-anchored regions pass `reserve` (rows they need from the top) and bottom-anchored groups report their footprint through `reserveFooter(id, rows)`; `RainScreen` then sets the host's inline height to `rows * lineHeight`, so a screen with more content than fits grows its canvas and the document scrolls instead of clipping. Never read `window` during render for this — the prerendered HTML must match the first client render or React leaves a stale inline height in place (measure in an effect and keep the pre-measure state covered by `min-h-[100svh]`).
- **Grid primitives**: `src/components/text/monoGrid.ts` — `MONO` stack (kept in sync with `--font-sans` in `globals.css`), `measureMonoWidth`/`useMonoMetrics` (pretext measurement defines cols) and `useViewportRows` (defines the windowful), `Cell`, `ringCells`/`writeCells`, and `inkClass` — quantized greyscale via `.pt-i1`…`.pt-i40` in `globals.css`.
- **Big-text fonts**: data arrays in `src/data/fonts/` (52 glyph blocks, `A-Z` then `a-z`), extracted from the FIGlet font collection bundled in the [figlet.js](https://github.com/patorjk/figlet.js) npm package — the rendered samples that identified each style are in `assets/figlet/`. Generate with `node scripts/extract-big-font.mjs "Gothic" src/data/fonts/gothic.ts` after `npm install --no-save figlet`; the script copies the font's own authorship comments into the generated header, so keep that attribution. `TextScreen` and `MarkdownFlow` take `fonts: BigFont[]` and paint the first that fits, so adding a smaller companion font for narrow screens is data-only.
- **Dev-only extras**: `scripts/perf.mjs <url> <throttle>` (frame timing + long tasks under CPU throttling) and `scripts/dump-screen.mjs <url> <out.txt>` drive system Chrome via `puppeteer-core` — install with `--no-save`, never a site dependency.
- **Paths**: always run public asset paths through `getPublicPath`/`PublicImage` so the GitHub Pages basePath works.

## Development Workflow
1. **Configure**: Edit `src/data/siteConfig.ts` — identity, `navLinks`, `socials`, each screen's `blurb`/`embeds`.
2. **Customize**: components in `src/components/`; new on-screen content is a region — consume `useMonoSurface()` + `useRegion()` and paint `Cell[][]`.
3. **Deploy**: `npm run build` emits the static `out/` (see `docs/architecture/deployment.md`). Note: `docker-compose.yaml` gives `node_modules` and `.next` anonymous volumes — after dependency or CSS changes run `docker compose down -v && make run`, or stale chunks/CSS will be served.

## Key Commands
- **Dev**: `npm run dev` (Docker: `make run`, i.e. `docker compose up`)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Install**: `npm install`
- **Docker dev**: `make run` (`docker compose up`) — recreate volumes after dep/CSS changes: `make down`
- **Static image**: `docker build -t text-screen . && docker run -p 8080:8080 text-screen`
- **Perf probe**: `node scripts/perf.mjs http://localhost:3000/ 20`
- **Screen dump**: `node scripts/dump-screen.mjs http://localhost:3000/ /tmp/screen.txt`
- **New glyph font**: `npm install --no-save figlet && node scripts/extract-big-font.mjs "Ghost" src/data/fonts/ghost.ts`

## Docs
`docs/architecture/overview.md` (rendering model), `docs/lms/components.md` (region rules),
`docs/lms/markdown-rendering.md` (grammar + non-goals), `docs/lms/content-delivery.md`
(sources and routes), `docs/architecture/deployment.md`, `docs/dev-guidelines/vibe-coding.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
