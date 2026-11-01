# Markdown → painted regions

The screens on this site are one measured monospace character grid, so markdown is
treated as **layout input**, not as markup to render. `src/components/text/markdownGrid.ts`
turns a document into blocks, `markdownFlow.tsx` measures them into rows and paints
each one with the existing region components.

## Why the parser is ours

- **One grid, one source of truth.** A paragraph becomes a `GridText` region, a lone
  image becomes a `GridEmbed`, a lone link becomes a `TextButton`. Every block already
  has to become a cell rect to coexist with the rain, so HTML is an intermediate format
  nobody consumes.
- **No dependencies.** The site's only rendering dependency is
  [@chenglou/pretext](https://github.com/chenglou/pretext), which does the measurement.
  A markdown AST library would be a second layout engine.
- **Measuring is exact, so the flow needs no iteration.** `blockRows()`/`flowHeight()`
  compute a document's height in cells as arithmetic, which lets a heading flow, a news
  list and a nav row place themselves in one pass without `useState` ping-pong.

## Supported grammar

| input | block | painted as |
| --- | --- | --- |
| `#` | heading 1 | `BigText` in the first glyph font that fits (see fonts below) |
| `##` `###` `####` | heading | `GridText` bold, opacity 1 / 0.75 / 0.6 |
| blank-line separated text | paragraph | `GridText`, opacity 0.85 |
| `- ` / `* ` / `1. ` / `1) ` | list | `GridText`, `· ` or `1. ` markers, 2-space indent, indented continuation lines append |
| `> ` | quote | `GridText`, each painted line prefixed `│ ` |
| ` ``` ` fences | code | `GridText border label="code"`, lines verbatim (tabs → 2 spaces) |
| `![alt](src)`, `![alt](src "40x12")` | image | `GridEmbed`, default 40×12 cells, hint is **cells W×H** |
| `[label](youtube/vimeo url)` on its own line | video | `GridEmbed`, default 46×13 (16:9 at a ~0.5 cell ratio) |
| `[label](/img.jpg)` on its own line | image | `GridEmbed` (image extension wins over the path check) |
| `[label](href)` on its own line | link | `TextButton` box; internal via `Link`, external `target=_blank` |
| `[label](url)` inside prose | inline | internal → `label`; external → `label → host` |

Content arrays are joined with a blank line, so **one array element is one block**: a
list or a fenced block has to be a single string with `\n` inside it, or each line becomes
its own block.

Not handled, by design: tables, raw HTML, reference-style links, images inside
paragraphs, lists nested past one level, horizontal rules. Unsupported input is
simply painted as text, so a page never breaks — it just looks literal.

## Two known limits, and the way past them

1. **Emphasis is whole-block only.** `**bold**`/`*em*` are stripped of markers, but a
   line is painted in one style because `GridText` writes one cell-run per style.
   Partial-run styling needs `GridText` to accept runs (`{ text, bold, opacity }[]`)
   instead of lines, then `wrapLines` has to carry style through the wrap. That is the
   single change that unlocks inline bold, italic and links that stay clickable.
2. **One glyph font ships today.** `gothic` is 9 rows tall and needs ~70 columns for a
   page title, so narrow screens fall back to plain bold text. The picker is already
   wired for a family of sizes — `TextScreen`/`MarkdownFlow` take `fonts: BigFont[]`
   and use the first that fits — so adding a `gothicSmall` (or a 5-row font) is just a
   new file in `src/data/fonts/` plus adding it to the array:

   ```bash
   npm install --no-save figlet
   node scripts/extract-big-font.mjs "Gothic" src/data/fonts/gothic.ts
   ```

## The route not taken: react-markdown + typography

An earlier `src/components/text/mdfield.tsx` rendered article bodies as HTML with
`react-markdown` inside Tailwind's `prose prose-invert`. Its semantics are worth
keeping in mind because they are what the table above reproduces:

- `getSafeSrc()` allowed `https://…` and root-relative paths, and routed anything else
  through `getPublicPath()` so images survived a GitHub Pages basePath.
- `getYouTubeId()` matched `youtu.be/`, `watch?v=`, `/embed/`, `/shorts/` and `&v=`,
  accepted only an 11-character id, and turned `[anything](that-url)` into a
  `youtube.com/embed/<id>` iframe — a link doubling as an embed.
- Links ending in `.jpg|.png|.webp|.svg` were swapped for an `<Image>`, so
  `[some alt text](image.jpg)` was valid "markdown" for a figure.

Keeping that path buys real HTML output — useful for an RSS/print view, for search
engines crawling text in the document, and for free support of tables/nesting. It
costs a second rendering system: `react-markdown` (~50 kB of deps) plus
`@tailwindcss/typography`, and every body would need an HTML cascade that fights the
grid's aesthetics. Both packages were removed when the grid flow landed; if we ever
want the HTML view back, the honest shape is a *separate* route (e.g. `/news/[slug].html`
or a print stylesheet) rather than two renderers on one page.
