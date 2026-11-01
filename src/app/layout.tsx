import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/data/siteConfig";

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
  // The export has no server to negotiate with crawlers, so say it in the pages
  // too: /robots.txt disallows everything and this repeats it per document.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://sp4aceman.github.io",
  ),
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>
        <div className="min-h-screen bg-black text-white font-sans">{children}</div>
      </body>
    </html>
  );
}
