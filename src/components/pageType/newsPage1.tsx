import React from 'react';
import NewsPanel from '@/components/subcomponents/newsPanel';
import { PublicImage } from '@/utils/getImage';
// 1. Define the shape of a single news item
export interface NewsItem {
  key: string;
  date: string;
  title: string;
  summary: string;
  linkHref: string;
}

// 2. Define the Page Props
// These fields will now appear in "Tab 2: Page Builder" so you can edit them.
interface NewsPageProps {
  pageTitle: string;
  pageSubtitle: string;
  pageImage: string;
  items: NewsItem[];
}

export default function NewsPage1({
  pageTitle,
  pageSubtitle,
  items,
  pageImage
}: NewsPageProps) {
  return (
    <main className="min-h-screen bg-brand-color2">
      {/* 1. Header Section */}
      <div className="bg-black relative w-full py-16 px-6 text-center border-b-2 border-inferno overflow-hidden">
        <PublicImage
          src={pageImage}
          alt="Background header"
          fill
          className="object-cover object-center opacity-30"
        />
        <div className=' relative z-10'>
          <div className="max-w-4xl mx-auto space-y-4 ">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight bg-transparent mx-auto py-5 ">
              {pageTitle || "News"}
            </h1>
            {pageSubtitle && (
              <p className="text-white/80 text-lg">{pageSubtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. News Vertical Stack (Dynamic List) */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex flex-col gap-8">

          {/* Automatically map over the list of articles */}
          {items && items.length > 0 ? (
            items.map((item) => (
              <NewsPanel
                key={item.key}
                date={item.date}
                title={item.title}
                summary={item.summary}
                linkHref={item.linkHref}
              />
            ))
          ) : (
            <p className="text-center text-white/40 italic">
              No news articles have been published yet.
            </p>
          )}

        </div>
      </div>
    </main>
  );
}
