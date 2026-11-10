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
    slug: "text-screen",
    title: "my first blog lol",
    date: "2026-11-05",
    summary: "My first blog.",
    body: [
      "# Hello ",
      "My name is James although you might know that or you might even know me in person.",
      "I don't really have to much to say about my self I go to college at the University of Arkansas I am taking computer science. ( yes I know AI prob gonna replace us all (cs majors) at least I take showers )",
      "I do love the act of programming and still code by hand ( ik crazy ) although I have been recently integrating AI into my workflow more in depth.",
      "I have recently been dabbling in making my own tooling like a custom mcp server and terminal plugin for my objectively support editor nvim jk but in all seriousness though",
      "AI has been needless to say controversial and so I just want to put my thoughts down on AI from the perspective of someone whomes entire industry has been altered permanently by this tech",
      "starting off with my first take.",
      "## open ai and anthropic are irrelevant and their products suck",
      "this could be considered cope as I don't personally pay for claud code nor do i pay for open ai's whatever they are selling as a matter of fact i rage deleted my account.",
      "for starters when I created my open ai account originally it was in my intro to engineering class in 2023, back then ai could barely write a for loop. And we were given the assignment to ask it some questions about a possible field of engineering we were thinking of heading into.",
      "and then like Patrick when he pulled the string of the magic kaunt we were to listen to the wisdom it bespoke upon us freshman and talk about it with our classmates",
      "i still remember the mediocre bullet point standard cookie cutter response. And generic writing that was entirely forgettable.",
      "and while I no longer have those chats as I deleted my account. ( to which ill get into later ) at this point this was my first experience that i can remember with chat gpt",
      "I remember continuing to use chatgpt for awhile and even purchased some api credits for an old school project in which i made an \"ai weather man\" ( a ~200 line python script )",
      "in which i learned how to prompt engineer 4o into giving out a relatively speaking consistent json output that acted as a weatherman",
      "",
      "however it sucked at coding... like really sucked at coding. I remember my first time using chat gpt for coding. it was a school assignment in which we had to ask chat gpt to transpile some javescript to",
      "typescript, it completely fucked it up. That want a very good first experience. And the mediocrity followed, i ask it something slightly complicated for example write something in vhdl or explain A,B, and C to me, it gets it wrong but in a sinister only kinda wrong way ( the worst kind of way ) and then it would gas light me. I couldn't take it seriously ",
      "and that is reflected in the way i used it. Ask it joke questions try to get it to say things its not supposed to, ect ect.",
      "but the breaking point for me was one that had me so annoyed so unreasonably angry that i ended up deleting my personal accouont.",
      "## "
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
