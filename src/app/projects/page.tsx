import type { Metadata } from "next";
import ScreenBody from "@/components/rainScreen/screenBody";
import TextScreen from "@/components/rainScreen/textScreen";
import { projectsScreen, site } from "@/data/siteConfig";

export const metadata: Metadata = {
  title: `${site.name} - Projects`,
};

export default function ProjectsPage() {
  return (
    <TextScreen title={projectsScreen.title}>
      <ScreenBody screen={projectsScreen} prefix="projects" />
    </TextScreen>
  );
}
