import type { Metadata } from "next";
import ScreenBody from "@/components/rainScreen/screenBody";
import TextScreen from "@/components/rainScreen/textScreen";
import { homeScreen, site } from "@/data/siteConfig";

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
};

export default function Home() {
  return (
    <TextScreen title={site.name}>
      <ScreenBody screen={homeScreen} prefix="home" />
    </TextScreen>
  );
}
