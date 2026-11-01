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
- **Routing**: Hand-written routes in `src/app/`: `/`, `/about`, `/news`, `/news/[slug]` (statically generated from `articles`).
- **Page Templates**: `src/components/pageType/` — receive props from routes or read `siteConfig` directly; keep presentation data-driven.
- **Sections/Atoms**: `src/components/heroSection/`, `midsection/`, `subcomponents/`, `imageFrames/`, `buttons/`, `text/`.
- **Content Rendering**: Markdown via `react-markdown` (`src/components/text/mdfield.tsx`, rendered `prose-invert` for the black theme).
- **Paths**: Always run public asset paths through `getPublicPath`/`PublicImage` so GitHub Pages basePath works.

## Development Workflow
1. **Configure**: Edit `src/data/siteConfig.ts` — add articles, change nav, socials, hero content.
2. **Customize**: Edit components in `src/components/` for branding/styling.
3. **Deploy**: Use Docker or the Makefile for production environment management.

## Key Commands
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Install**: `npm install`
- **Docker**: `docker-compose up --build`
