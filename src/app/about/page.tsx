import type { Metadata } from "next";
import AboutMeEditorial from "@/components/pageType/aboutMePage1";
import { site, aboutData } from "@/data/siteConfig";

export const metadata: Metadata = {
  title: `${site.name} - About`,
};

export default function AboutRoute() {
  return <AboutMeEditorial {...aboutData} />;
}
