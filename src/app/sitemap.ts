import type { MetadataRoute } from "next";
import { articles, site } from "@/data/siteConfig";

// Absolute URLs need an origin; the default is this repo's GitHub Pages home.
// Override with NEXT_PUBLIC_SITE_URL (and NEXT_PUBLIC_BASE_PATH) elsewhere.
const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sp4aceman.github.io";
const base = `${origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}`.replace(/\/$/, "");

// `output: 'export'` requires metadata routes to be forced static.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = site.navLinks.map((link) => ({
    url: `${base}${link.href === "/" ? "/" : `${link.href}/`}`,
  }));

  const posts = articles.map((article) => ({
    url: `${base}/news/${article.slug}/`,
    lastModified: article.date,
  }));

  return [...pages, ...posts];
}
