// Single source of truth for the whole site.
// Edit this file to make the site yours — every screen reads its content here.

export interface Socials {
  email?: string;
  githubUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  blueskyUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface ScreenContent {
  title: string;
  /**
   * Markdown, one array element per block. Multi-line blocks (lists, fences) are a
   * single element with `\n` inside it, because elements are joined with a blank line.
   */
  blurb: string[];
}

export interface Article {
  slug: string;
  title: string;
  /** Display date, e.g. 2026-11-01. */
  date: string;
  summary: string;
  /** Markdown, one array element per block (see `ScreenContent.blurb`). */
  body: string[];
}

export const site = {
  name: "spaceman",
  tagline: "coolest man on earth B)",
  description: " ",
  navLinks: [
    { label: "Home", href: "/" },
    { label: "News", href: "/news" },
    { label: "Projects", href: "/projects" },
    { label: "Cool Stuff", href: "/coolstuff" }
  ] satisfies NavLink[]
};

export const socials: Socials = {
  email: "jamesshufeltiii@gmail.com",
  githubUrl: "",
  twitterUrl: "",
  linkedinUrl: "",
  instagramUrl: "",
  blueskyUrl: "",
  facebookUrl: "",
  tiktokUrl: ""
};

export const homeScreen: ScreenContent = {
  title: "Home",
  blurb: [
    site.tagline,
    "Hello welcome to my website. If you like any of my stuff feel free to hmu B)",
    "Open MENU to jump between screens, or toggle RAIN OFF to read in peace."
  ]
};

export const newsScreen: ScreenContent = {
  title: "News",
  blurb: [
    "No news yet... maybe ill start writing about stuff im working on",
    ""
  ]
};
export const projectsScreen: ScreenContent = {
  title: "Projects",
  blurb: [
    "## nvim plugins and personal tools that i made...",
    "-----------------------------------------------------------------------------",
    "a custom mcp server [ model context protocol ] made for nvim that connects with my terminal plugin",
    "[nvimcp](https://github.com/sp4aCemAn/nvimcp)",
    "-----------------------------------------------------------------------------",
    "my custom plugin that i use for separated term buffers + agent support for terminals",
    "[nvimterminals](https://github.com/sp4aCemAn/nvimterminals)",
    "-----------------------------------------------------------------------------",
    "## projects that are in progress. \"working\" proof of concept stuff",
    "check out this project an ai enabled multi user dungeon proof of concept. used cactus lm (self hosted) gemma e2b personally i used lm studio and gemma e4b. for the \"game master\" deets in the readme",
    "[ai mud](https://github.com/sp4aCemAn/ai-mud)"

  ]
};

export const coolStuffScreen: ScreenContent = {
  title: "Cool Stuff",
  blurb: [
    "## heres some cool stuff",
    " I love tool",
    "tool music video",
    "[ TOOL - Schism (Official Video) ](https://www.youtube.com/watch?v=MM62wjLrgmA)",
    "Still deciding what to put here\n",
    "# isint this cool",
    "been playing around with ascii art heres some cool stuff i found to mess around with all ascii art related",
    "[FIGlet](https://www.figlet.org/)",
    "[figlet.js](https://github.com/patorjk/figlet.js)",
    "[TAAG](https://patorjk.com/software/taag/)",
  ]
};

export const articles: Article[] = [

];

/** Boxes for the news screen, newest first. */
export const getNewsItems = () =>
  articles.map((article) => ({
    label: `${article.date} · ${article.title}`,
    href: `/news/${article.slug}`,
    summary: article.summary
  }));
