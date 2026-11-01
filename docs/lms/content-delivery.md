# Content Delivery

Content is data, screens are functions of that data, and nothing is generated into the tree.

## Sources
- `src/data/siteConfig.ts` — `site` (name, tagline, description, `navLinks`), `socials`,
  one `ScreenContent` per screen (`homeScreen`, `newsScreen`, `projectsScreen`,
  `coolStuffScreen`) and `articles: Article[]`.
- `src/data/fonts/` — glyph block arrays (`BigFont`) used for headings.

## Routes
| route | source | notes |
| --- | --- | --- |
| `/` | `site` + `homeScreen` | wordmark title, intro flow |
| `/news` | `newsScreen` + `getNewsItems()` | one box per article, summary beneath |
| `/news/[slug]` | `articles` | `generateStaticParams`, `dynamicParams = false`: unknown slugs 404 and every post is prerendered by `npm run build` |
| `/projects`, `/coolstuff` | their `ScreenContent` | markdown bodies with image/video embeds |

Each route renders `<TextScreen title=…>` and hands its content to `<MarkdownFlow>` (directly
or via `ScreenBody`/`NewsBody`/`ArticleBody`), so adding a page means adding data plus one
short file in `src/app`.

## Markdown
Body copy is the subset described in `docs/lms/markdown-rendering.md`. One array element is one
block — lists and fences are a single string with `\n` inside, because elements are joined with
a blank line. Links and images inside the text become real regions: `╔═╗` boxes, iframes, images.
