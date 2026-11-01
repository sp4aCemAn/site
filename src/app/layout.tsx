import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import { site, socials } from "@/data/siteConfig";

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
        <div className="flex flex-col min-h-screen bg-black text-white font-sans">

          <Header navLinks={site.navLinks} siteName={site.name} />

          <main className="flex-grow">
            {children}
          </main>

          <Footer siteName={site.name} socials={socials} />

        </div>
      </body>
    </html>
  );
}
