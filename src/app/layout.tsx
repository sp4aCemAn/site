import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/data/siteConfig";

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
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
