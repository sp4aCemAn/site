import type { Metadata } from "next";
import NewsPage1 from "@/components/pageType/newsPage1";
import { site, newsData, getNewsItems } from "@/data/siteConfig";

export const metadata: Metadata = {
  title: `${site.name} - ${newsData.pageTitle}`,
};

export default function NewsRoute() {
  return <NewsPage1 {...newsData} items={getNewsItems()} />;
}
