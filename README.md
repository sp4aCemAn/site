# Text Screen

My personal site, basically everything is rendered with text lol wanted to play with [pretext](https://github.com/chenglou/pretext). Pretty dope library

## Tools used

- [pretext](https://github.com/chenglou/pretext) — the text measurement library this whole site is
  built on: it decides how many columns fit and how every block wraps
- [Next.js](https://nextjs.org) + React + TypeScript, exported to static files
- [Tailwind CSS](https://tailwindcss.com) v4 — only for the black/white theme and the ink classes
- [FIGlet](http://www.figlet.org) `Gothic` — the big-letter font; `assets/figlet/` holds the samples
- Docker — reproducible dev environment

## Personal config

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
