import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/data/siteConfig";

// The grid font ships with the site (JetBrains Mono, OFL-1.1 — license at
// src/app/fonts/OFL.txt) so every device paints the same glyphs at the same
// cell widths; system mono stacks resolve per-platform and fall back mid-row
// on box-drawing characters, which breaks alignment. next/font/local makes
// the woff2s hashed internal assets, so the URLs survive a Pages basePath.
// adjustFontFallback is off because the grid measures text itself — a
// size-adjusted fallback would misreport cell widths before load.
const gridMono = localFont({
  src: [
    { path: "./fonts/jetbrains-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/jetbrains-mono-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-grid-mono",
  fallback: [
    "ui-monospace",
    "SF Mono",
    "SFMono-Regular",
    "Menlo",
    "Consolas",
    "Liberation Mono",
    "DejaVu Sans Mono",
    "monospace",
  ],
  adjustFontFallback: false,
});

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
    <html lang="en" className={`${gridMono.variable} scroll-smooth`}>
      <body>
        <div className="min-h-screen bg-black text-white font-sans">{children}</div>
      </body>
    </html>
  );
}
