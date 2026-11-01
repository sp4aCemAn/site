# Project Overview
A personal-site **Next.js** + **TypeScript** template. All site content (identity, navigation, socials, home/about sections, articles) lives in one config file, `src/data/siteConfig.ts`. Routes are plain files in `src/app` that read from the config — no route configurator, no generated files.

Visual customization is handled by editing the components in `src/components`.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (v4) with `@tailwindcss/typography`
- **Icons**: react-icons, lucide-react
- **Containerization**: Docker & Docker Compose
- **Deployment**: Vercel or GitHub Pages (see docs/architecture/deployment.md)
- **Scripts**: Makefile

## Requirements
- **Node.js**: v18.17.0 or higher
- **npm** or **yarn**
- **Docker** & **Docker Compose** (Optional, but recommended for consistent development)
- **Git**

## Key Features
- **Config-Driven Content**: Edit `src/data/siteConfig.ts` to change everything visitors see.
- **Dynamic Article Routes**: Add an entry to `articles` in the config and `/news/[slug]` is generated at build time.
- **Text-as-Structure Layout**: `PretextBlock` uses [@chenglou/pretext](https://github.com/chenglou/pretext) to measure and wrap text in pure JS — shrink-wrapped headings, measured line clamps, per-line reveal animations, all on a pure black & white theme.
- **Composable Architecture**: Swap sections and layouts by editing files in `src/app`.
- **Component-Driven UI**: Complete control over the look and feel via `src/components`.
- **Dockerized Environment**: Ready for consistent development and deployment.

## Workflow
1. **Configure**: Edit `src/data/siteConfig.ts` — site name, nav, socials, hero content, about text, articles.
2. **Customize**: Edit the UI components in `src/components` to match your branding.
3. **Deploy**: Use Docker or the Makefile to manage your production environment.

## Getting Started
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Run Development Server**:
   ```bash
   npm run dev
   ```
3. **Build for Production**:
   ```bash
   npm run build
   ```
4. **Docker Setup**:
   ```bash
   docker-compose up --build
   ```
