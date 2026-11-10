# Site Configurator

A terminal UI (built with [Textual](https://textual.textualize.io/)) that edits this
site's single source of truth — `src/data/siteConfig.ts` — instead of hand-editing the
file. It reads the live config, lets you change identity, screens, navigation and news
articles, then writes only the TypeScript export blocks you touched.

This is the personal-site port of the older *NextJsSite Builder*. That tool *generated*
Next.js pages and a `builder_config.json`; this one **does not generate the app** — the
routes already exist and read from `siteConfig.ts`. The configurator edits that file in
place, and the only code it will ever write is a `page.tsx` route for a **new screen you
add through the tool** (and only that file is ever eligible for removal again).

## Install & run

From this directory (`tools/configurator`):

```bash
./build.sh          # creates venv/, installs textual, writes ./cfg
./cfg               # edit this repo's src/data/siteConfig.ts
./cfg /path/to/site # or point it at another checkout
```

Inside the app: keys `1`/`2`/`3` switch tabs, **Menu** opens the sidebar, `Ctrl-L` toggles
the status log, `Ctrl-Q` quits.

## Tabs

1. **Identity** — `site` (`name`, `tagline`, `description`) and the `socials` links. Save
   writes those two exports.
2. **Screens** — one pane per `*Screen` export (title + markdown blurb), a **nav links**
   editor over `site.navLinks` (edit / reorder / remove), and **+ Add page** which creates
   a new `<label>Screen` export, a matching nav link, and a scaffolded
   `src/app/<slug>/page.tsx` (the standard `TextScreen` + `ScreenBody` pattern).
3. **Articles** — news posts written to the `articles` export. Saving an article is all
   that is needed: `/news/<slug>` is prerendered from it by the existing route.

## How it writes (safety)

- `siteConfig.ts` is parsed as the source of truth; your hand-written content and the file
  are the state. There is no separate config file.
- **Only the export blocks you changed** are re-spliced; everything else (header comments,
  the `interface` definitions, `getNewsItems`, blank lines between blocks) stays byte-for-byte.
- Markdown blurbs/bodies are joined with a blank line; a block that references another
  export (e.g. `site.tagline` in the home blurb) is preserved verbatim and is only turned
  into a literal string if you actually edit that line.
- Saves are atomic (temp file + `os.replace`). If an export block can no longer be
  recognised the tool raises and leaves the file untouched rather than guessing.
- It never deletes a route you did not add through it: only a `page.tsx` carrying the
  `AUTO-GENERATED` marker it wrote can be removed.

## Layout

```
builderScript/
  main.py                 # Textual app: tabs, buttons -> state edits -> persist
  site_config_io.py       # parse/splice src/data/siteConfig.ts (the core)
  site_state.py           # validated edits: nav links, add/remove page, article CRUD
  route_scaffold.py       # create/delete scaffolded page.tsx (marker-guarded)
  IdentityTab.py / ScreenEditor.py / ArticleEditor.py   # the three tabs
  slugs.py theme.py textual_log_handler.py              # carried over helpers
tests/                    # stdlib unittest; python -m unittest discover -s tests
```

## Tests

```bash
./venv/bin/python -m unittest discover -s tests
```

`test_config_io.py` round-trips the **real** `siteConfig.ts` and asserts a clean save is
byte-identical; `test_app.py` drives the full TUI against a throwaway copy, so it never
touches the live site content.
