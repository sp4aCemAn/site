import React from 'react';
import PretextBlock from '@/components/text/pretextBlock';
import Mdfield from '@/components/text/mdfield';
import { site, socials, homeData, articles } from '@/data/siteConfig';

export default function Home() {
  const nav = site.navLinks.filter(({ href }) => href !== '/');
  const latest = articles.slice(0, 3);

  return (
    <main className="flex-grow">

      {/* Name as the biggest line on the page */}
      <section className="mx-auto w-full max-w-5xl px-6 pt-20 pb-16 md:pt-28 flex flex-col gap-6">
        <PretextBlock text={site.name} weight={800} scale={0.18} maxFontSize={150} shrink reveal />
        <PretextBlock text={site.tagline} weight={400} fontSize={20} />
      </section>

      {/* Navigation, written as text */}
      <section className="mx-auto w-full max-w-5xl px-6 py-12 border-t border-white/20 flex flex-col gap-3">
        {nav.map(({ label, href }) => (
          <a key={href} href={href} className="group block">
            <PretextBlock
              text={`→ ${label}`}
              weight={700}
              fontSize={34}
              shrink
              className="text-white/60 group-hover:text-white transition-colors"
            />
          </a>
        ))}
        {socials.email && (
          <a href={`mailto:${socials.email}`} className="group block">
            <PretextBlock
              text={`→ ${socials.email}`}
              weight={700}
              fontSize={34}
              shrink
              className="text-white/60 group-hover:text-white transition-colors"
            />
          </a>
        )}
      </section>

      {/* Latest words */}
      {latest.length > 0 && (
        <section className="mx-auto w-full max-w-5xl px-6 py-12 border-t border-white/20 flex flex-col gap-8">
          <PretextBlock text="LATEST WORDS" weight={400} fontSize={13} letterSpacing={6} className="text-white/40" />
          {latest.map(({ slug, title, date, summary }) => (
            <a key={slug} href={`/news/${slug}`} className="group block">
              <PretextBlock
                text={title}
                weight={700}
                fontSize={26}
                shrink
                className="transition-colors group-hover:text-white/70"
              />
              <PretextBlock
                text={`${date} — ${summary}`}
                weight={400}
                fontSize={16}
                maxLines={2}
                className="mt-1 text-white/50"
              />
            </a>
          ))}
        </section>
      )}

      {/* Free-form intro text */}
      <section className="mx-auto w-full max-w-5xl px-6 py-12 border-t border-white/20">
        <Mdfield content={homeData.content} />
      </section>
    </main>
  );
}
