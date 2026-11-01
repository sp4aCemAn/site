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
    "Notes and updates, written in markdown and painted into the same character grid as everything else.",
    "The boxes below go to the full posts."
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
    "See the [news list](/news) for the writing."
  ]
};

export const articles: Article[] = [
  {
    slug: "text-screen",
    title: "Text Screen",
    date: "2026-11-01",
    summary: "Why this site is one character grid, and what that buys you.",
    body: [
      "# Built with text",
      "## The idea",
      "Every pixel of this page is a cell in a measured monospace grid: the rain, the headings, the boxes you click, and this paragraph. Nothing is positioned with CSS layout, so there is no second system to keep in sync with the text.",
      "### What that buys",
      "- Labels cannot drift out of alignment with the grid\n- Depth is greyscale, so the rain reads as weather rather than noise\n- The canvas grows when a page is taller than the window, and the document scrolls",
      "The buttons are real links with no chrome of their own:",
      "[the news list](/news)",
      "> A terminal is already a layout engine. It just has opinions about columns.",
      "```",
      "const cols = Math.floor(width / measureMonoWidth(14))",
      "const rows = Math.max(windowRows, reserved + footer)",
      "```",
      "See [pretext](https://github.com/chenglou/pretext) for the measurement side."
    ]
  },
  {
    slug: "greyscale",
    title: "Greyscale",
    date: "2026-10-26",
    summary: "Painting depth with 40 opacity steps and no inline styles.",
    body: [
      "## Depth without colour",
      "The theme is black and white, so distance has to come from brightness. Each glyph run gets one of 40 quantised opacity classes, which means a repaint swaps class names instead of rewriting inline styles, and neighbouring cells merge into a single run more often.",
      "#### Why quantise at all",
      "Because a run of identical styles is one DOM node, and fewer nodes is the whole trick when the canvas repaints twelve times a second.",
      "![Test pattern](/image2.jpg \"32x10\")"
    ]
  },
  {
    slug: "keyboard",
    title: "Keyboard",
    date: "2026-10-12",
    summary: "Every control is a real button, even though you only ever see glyphs.",
    body: [
      "## Focus, but painted",
      "The boxes are ordinary links and buttons with their chrome stripped, so tab order, cmd-click and screen readers keep working. The only feedback is typographic: hovering or focusing bolds the label and its box.",
      "1. Tab reaches each box in DOM order",
      "2. The focused label is the one that comes back bold",
      "3. Pressing dims it for the length of the click",
      "> If a control cannot be reached with one key, it is decoration, not an interface."
    ]
  }
];

/** Boxes for the news screen, newest first. */
export const getNewsItems = () =>
  articles.map((article) => ({
    label: `${article.date} · ${article.title}`,
    href: `/news/${article.slug}`,
    summary: article.summary
  }));
