# Vibe Coding Guidelines

"Vibe Coding" in this project is a collaborative development style where you and the AI work together to build features by focusing on high-level intent, architectural patterns, and the "vibe" of the existing codebase, rather than manual micro-management of every line.

## Core Principles

### 1. The Interface is the Contract
The most critical element for "vibe coding" to work with our config-driven architecture is the **TypeScript Interface**.
- When adding a new feature or page type, always define a clear `interface` for the props. These define the pieces of content on your page, such as image names or raw text content.
- Page types stay prop-driven: the route in `src/app` passes data from `src/data/siteConfig.ts` into the interface.
- If the interface is correct, wiring a new page up is just adding a data block to `siteConfig.ts` and spreading it into the component in the route file.

### 2. Pattern Matching & Context Management
AI excels at prototyping by following established styles, but it can lose focus if the context is too large. Think of "vibe coding" as taking a piece of clay and slowly molding it into the final product.

- **Provide Context**: Start new features or chats by pointing the AI to existing components (e.g., "Build this like `HomePage1`"). 
- **Strategic Development**: While the AI can build components directly in a page during prototyping, it is often more efficient to build them as separate files and then split them out to maintain a clean project structure.
- **Keep Components Granular**: To keep context small and efficient (especially for smaller on-device models like Gemma 12B), avoid putting all custom components into a single Page Type file in `src/components/`. 
- **Split Components**: When prototyping, you can work within a single component or page, but ultimately split it into smaller, modular components so that subsequent chats can work with the code more effectively.

### 3. Component Composition
Avoid monolithic pages by embracing the existing modularity. This is particularly helpful when working with agents to keep context small:
- Build small, reusable sub-components in `src/components/subcomponents/`.
- Compose these into larger sections in `src/components/Midsection/` or `src/components/HeroSection/`.
- Finally, assemble these sections into "Page Types" in `src/components/pageType/`.

### 4. AI Workflow for New Features
To vibe code a new feature efficiently:
1.  **Contextualize**: Describe what you want to build. If using an agent, provide only the relevant snippets of files the agent needs to focus on rather than the entire file to keep the context window clean.
2.  **Define the Shape**: Ask the AI to define the `interface` first. Review and approve the data shape.
3.  **Generate**: Let the AI build the component using that interface.
4.  **Verify**: Check that the component renders correctly and that the props match the interface.
5.  **Set Expectations**: Especially with smaller models, keep your code clean and follow the guidelines above. You can prototype quickly and let the AI handle the "boring stuff" (like centering divs or setting up layouts), but guide it to keep the code clean and separated. Your tokens (and your sanity) will thank you.

## Why this works
By following these guidelines, you allow the AI to handle the heavy lifting of boilerplate and styling while you maintain control over the "vibe"—the actual functionality and user experience. 

**Flexibility**: You are not restricted to AI generation; you can write components yourself or port existing code. As long as you define the interface and correctly pass those props into your component's return statement (e.g., `<Component prop={data.prop} />`), it will work seamlessly with the Next.js environment and the site config.
