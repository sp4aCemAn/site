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
  description: ".",
  navLinks: [
    { label: "Home", href: "/" },
    { label: "News", href: "/news" },
    { label: "Projects", href: "/projects" },
    { label: "Cool Stuff", href: "/coolstuff" }
  ] satisfies NavLink[]
};

export const socials: Socials = {
  email: "you@example.com",
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
    "## Things I have built and shipped",
    "Replace this with your own work. A heading like the one above is a `##`; a single `#` would come out in the big glyph font instead.",
    "- nvterminals — terminal buffers as Neovim buffers, with an agent-facing MCP surface around them",
    "- site — this screen: rain, headings, buttons and prose in one measured grid",
    "> Quote blocks get a rail down the left so they read apart from the body text.",
    "```\nnpm run dev      # http://localhost:3000\nmake run         # same thing, in Docker\n```",
    "![Project screenshot](/image3.jpg \"40x12\")",
    "Read the [build log](/news/text-screen) or the [pretext source](https://github.com/chenglou/pretext)."
  ]
};

export const coolStuffScreen: ScreenContent = {
  title: "Cool Stuff",
  blurb: [
    "## Links, videos and oddments",
    "A video link on its own line becomes an embedded player box:",
    "[ TOOL - Schism (Official Video) ](https://www.youtube.com/watch?v=MM62wjLrgmA)",
    "1. Boxes are real links and real iframes\n2. Nothing here is an image of text\n3. The rain just routes around them",
    "## Type big letters",
    "The banners on this site are FIGlet fonts, which have been making text out of text since 1991 — grab the program, the JS port our glyphs came from, or just play with the generator:",
    "[FIGlet](https://www.figlet.org/)",
    "[figlet.js](https://github.com/patorjk/figlet.js)",
    "[TAAG](https://patorjk.com/software/taag/)",
    "See the [news list](/news) for the writing."
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
