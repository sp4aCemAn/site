# Text Screen

A personal site where the whole interface is one measured monospace character grid. The rain,

## Tools used

- [pretext](https://github.com/chenglou/pretext) — the text measurement library this whole site is
  built on: it decides how many columns fit and how every block wraps
- [Next.js](https://nextjs.org) + React + TypeScript, exported to static files
- [Tailwind CSS](https://tailwindcss.com) v4 — only for the black/white theme and the ink classes
- [FIGlet](http://www.figlet.org) `Gothic` — the big-letter font; `assets/figlet/` holds the samples
- Docker — reproducible dev environment

## personal config

- Editor:
  [Neovim](https://neovim.io),
  [nvim config](https://github.com/sp4acemanwork/nvimConfig),
  [nvimterminals](https://github.com/sp4aCemAn/nvimterminals),
  [nvimcp](https://github.com/sp4aCemAn/nvimcp), and
  [opencode](https://opencode.ai)

## Screens

`/` · `/news` · `/news/[slug]` · `/projects` · `/coolstuff`

`MENU` opens the nav, the social links and the `RAIN ON` / `RAIN OFF` toggle, so a closed screen
shows nothing but `MENU`. The controls are real links and buttons with their chrome removed —
hovering or tabbing to one just makes its label and box bold.

## Where things are

- `src/components/rainScreen/` — the grid, the rain, the screen shell and controls
- `src/components/text/` — measurement, buttons, glyph headings, prose, embeds, markdown
- `src/data/` — all content and the glyph fonts (`assets/figlet/` has the samples they came from)
- `docs/` and `AGENTS.md` — how it renders, how to add a region, supported markdown, deployment
