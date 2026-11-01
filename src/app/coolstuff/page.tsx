import type { Metadata } from "next";
import ScreenBody from "@/components/rainScreen/screenBody";
import TextScreen from "@/components/rainScreen/textScreen";
import { coolStuffScreen, site } from "@/data/siteConfig";

export const metadata: Metadata = {
  title: `${site.name} - Cool Stuff`,
};

export default function CoolStuffPage() {
  return (
    <TextScreen title={coolStuffScreen.title}>
      <ScreenBody screen={coolStuffScreen} prefix="coolstuff" />
    </TextScreen>
  );
}
