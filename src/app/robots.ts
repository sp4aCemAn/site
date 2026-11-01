import type { MetadataRoute } from "next";

// This site asks crawlers to stay away: every path is disallowed. The sitemap
// still exists (so `sitemap.xml` resolves and the page list is machine
// readable), but it is deliberately not advertised here.
//
// `output: 'export'` requires metadata routes to be forced static.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}
