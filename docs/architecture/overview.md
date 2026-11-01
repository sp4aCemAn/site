# Project Overview
This project is a modern web application built with **Next.js** and **TypeScript**, designed for modular content delivery. It follows an **App Router** architecture and utilizes a component-based approach to render diverse page types.

## Tech Stack
- **Framework**: Next.js (v16.2.6)
- **Language**: TypeScript
- **UI Library**: React (v19.2.0)
- **Styling**: Tailwind CSS (v4) with `@tailwindcss/typography`
- **Content Rendering**: `react-markdown`
- **Icons**: `lucide-react`, `react-icons`

## Architecture
The application is organized into a modular structure:
- `src/app/`: Routing logic and page entries.
- `src/components/`: UI building blocks.
- `src/components/pageType/`: Core content templates (Home, News, About, Volunteer, etc.).
- `src/components/article/`: Components for detailed content rendering.
- `src/components/subcomponents/`: Atomic UI elements (Buttons, Image frames, etc.).

## Entry Points
- **Landing Page**: `src/app/page.tsx`
- **Layout**: `src/app/layout.tsx`
- **News Section**: `src/app/news/page.tsx`
