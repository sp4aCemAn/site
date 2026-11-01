// Single source of truth for the whole site.
// Edit this file to make the site yours — routes and components read from here.

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

export interface Article {
  slug: string;
  title: string;
  date: string;
  summary: string;
  content: string[];
}

export const site = {
  name: "Your Name",
  tagline: "What you do in five words.",
  description: "Personal site of Your Name — projects, notes and things worth linking to.",
  navLinks: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "News", href: "/news" }
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

export const homeData = {
  // Big intro text rendered below the fold on the home page.
  content: [
    "# Hello",
    "This site is built out of text itself — headings, lines and paragraphs *are* the layout. The blocks are measured and wrapped by [pretext](https://github.com/chenglou/pretext), so every line is exact.",
    "## How this template works",
    "1. **Configure**: All content lives in `src/data/siteConfig.ts`.",
    "2. **Customize**: Edit components in `src/components` to change the look.",
    "3. **Deploy**: Use the `Makefile` or Docker for production."
  ]
};

export const aboutData = {
  title: "About",
  imageSrc: "/image.jpg",
  content: [
    "Replace this with your story. Edit `aboutData.content` in `src/data/siteConfig.ts`.",
    "Markdown works here: **bold**, lists, links, images — anything the markdown field supports.",
    "- A bullet list of things you care about",
    "- Another one",
    "- And one more"
  ]
};

export const newsData = {
  pageTitle: "News & Updates",
  pageSubtitle: "Notes, links and updates.",
  pageImage: "/image.jpg"
};

export const articles: Article[] = [
  {
    slug: "test",
    title: "test",
    date: "2026-6-2",
    summary: "test",
    content: [
      "this is a test article",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam placerat molestie tortor. Maecenas lacinia blandit nisl sed dapibus. Ut vel odio sodales arcu gravida eleifend in eget nibh. Nunc ultricies, risus et mattis blandit, lectus turpis porta lectus, ac facilisis massa odio et mi.",
      "[image1](image.jpg)",
      "Praesent ante est, lacinia sed tincidunt feugiat, euismod non libero. Donec semper sed metus maximus hendrerit. Sed et tellus id erat sollicitudin volutpat. Ut egestas congue risus porta mollis.",
      "[image2](image2.jpg)",
      "Maecenas venenatis interdum lorem, eu condimentum turpis ullamcorper quis. Sed tristique, justo sit amet hendrerit congue, tellus lectus ornare velit, non auctor elit nunc nec dolor."
    ]
  }
];

export const getNewsItems = () =>
  articles.map(({ slug, date, title, summary }) => ({
    key: slug,
    date,
    title,
    summary,
    linkHref: `/news/${slug}`
  }));
