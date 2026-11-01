import type { Metadata } from "next";
import NewsBody from "@/components/rainScreen/newsList";
import TextScreen from "@/components/rainScreen/textScreen";
import { getNewsItems, newsScreen, site } from "@/data/siteConfig";

export const metadata: Metadata = {
  title: `${site.name} - News`,
};

export default function NewsPage() {
  return (
    <TextScreen title={newsScreen.title}>
      <NewsBody screen={newsScreen} items={getNewsItems()} />
    </TextScreen>
  );
}
