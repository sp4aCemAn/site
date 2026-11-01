import type { Metadata } from "next";
import Home from "@/components/pageType/homePage1";
import { site } from "@/data/siteConfig";

export const metadata: Metadata = {
  title: `${site.name} - Home`,
};

export default function HomePageRoute() {
  return <Home />;
}
