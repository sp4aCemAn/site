# Component Construction Guidelines

## Core Architectural Principles
- **Atomic Design**: Build components in `src/components/subcomponents/` as reusable, atomic UI elements.
- **Functional approach**: Use functional components with React hooks.
- **TypeScript First**: Always define explicit interfaces for all props and data structures.
- **Tailwind CSS**: Use Tailwind CSS for all styling. Prefer utility classes over custom CSS files.

## File Structure & Exports
- **Naming**: Use PascalCase for component names (e.g., `NewsPanel`, `QuickLinksSection`).
- **File Location**: Place in `src/components/subcomponents/`.
- **Default Export**: Use `export default function ComponentName(...)`.
- **Data Interfaces**: Export interfaces used as props or data models so they can be consumed by the Builder (e.g., `export interface NewsItemData`).

## Styling & Visual Design
- **Spacing**: Use standard Tailwind padding (`p-`, `m-`) and margin classes.
- **Responsiveness**: Ensure layouts are mobile-first (use `md:`, `lg:` prefixes).
- **Transitions**: Use `transition`, `duration-300`, and `transform` for interactive elements like buttons and cards.
- **Visual Consistency**: Use consistent border colors (e.g., `border-gray-100`, `border-gray-200`), shadows (`shadow-lg`, `shadow-sm`), and text colors (`text-slate-900`, `text-gray-500`).
- **Theme Integration**: Use specific brand colors where appropriate (e.g., `bg-color2`, `border-inferno`).

## Component Structure Patterns
- **Containerization**: Wrap major content in a `section` or `div` with a `container mx-auto px-6` class for standard layout centering.
- **Grid Layouts**: Use `grid` and `gap` classes for multi-column layouts (e.g., `grid-cols-1 md:grid-cols-3 gap-6`).
- **Interactive Elements**: 
    - Use `next/link` for all internal navigation.
    - Use custom `Button` components from `@/components/buttons/button` for actions, passing `href` and `variant` props.
- **Accessibility**: Ensure proper semantic HTML (e.g., `h1`-`h6`, `p`, `section`, `span`).

## Example Pattern (The "NewsPanel" pattern)
- **Structure**: [Date Tag] -> [Headline] -> [Summary] -> [Action Link/Button].
- **Spacing**: Consistent vertical spacing between elements (e.g., `mb-4`, `mt-auto`).
- **Flexbox**: Use `flex flex-col h-full` to ensure cards in a grid maintain uniform height.
