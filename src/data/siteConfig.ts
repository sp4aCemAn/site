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
  description: "my personal website",
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
  {
    slug: "opinons-on-ai",
    title: "first blog lol",
    date: "2026-11-05",
    summary: "My first blog.",
    body: [
      "# Hello ",
      "My name is James although you might know that or you might even know me in person. Tbh I dont think many people are going to read this",
      "a little about me I attend the University of Arkansas for computer science,",
      "I have been programming sense my freshman year of high school.",
      "anyways with the boring stuff out of the way... I want to talk about AI and my take on AI how i use it and what i think will happen to the industry that I would like to get a job in",
      "fisrt and formost I'm not anti AI, far from it. I remember the first time I used what would technically be considered an \"AI\" today Google Deep Dream wayyy back in 2015",
      "[image](placeholder)",
      "as a matter of fact my profile pic is the output of a google deep dream neural network",
      "now google deep dream is way different to the AI image models and text models we have today however, I state this because I have a LOT to say about the state of the AI industry",
      "a industry in which has been entirely proped up by circular funding for so long we where talking about circular funding almost a year ago",
      "as a matter of fact i was interviewed in the travaler about this and I said back then what everyone sees today.",
      "that is the entire AI industry is a glorified ponzi scheme.",
      "which sucks, and the way in which AI has been sold to the public as a tool that would replace everyone and that it would become sentiant and that super intelligence would come or whatever",
      "and kill us all yada yada... basically its a bunch of bull shit. Sold to be people who low key have allegations cough cough sam, cough cough elon... ",
      "and a guy who wants everyone to call him daddy... basically the worst blunt rotation of all time",
      "so I dont blame people for being anti AI, as matter of fact I too think we should probably put a pause on data centers, and regulate like hell.",
      "and I would go further I think that companies who have taken advantage of the system and those who have stolen the work of everyone on the planet",
      "IE every AI company in America aught to be nationalized, Although that might get me on a list for saying that...",
      ""
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
