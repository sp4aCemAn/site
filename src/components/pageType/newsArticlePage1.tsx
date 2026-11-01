import React from 'react';
import ArticleHeader from '@/components/article/articleHeader';
import ArticleContent from '@/components/text/mdfield';
import ArticleSummary from '@/components/article/articleSummary';
import Button from '@/components/buttons/button';

interface NewsArticlePageProps {
  articleTitle: string;
  publishDate: string;
  articleSummary: string;
  // FIX: Allow string OR string[] so GenPage data passes through
  articleContent: string | string[];
  backLinkText: string;
}

export default function NewsArticlePage1({
  articleTitle,
  publishDate,
  articleSummary,
  articleContent,
  backLinkText,
}: NewsArticlePageProps) {

  return (
    // 1. Added 'flex' here so 'flex-col' and 'items-center' actually work
    <main className="flex flex-col min-h-screen bg-brand-color2 py-20 px-6 items-center ">
      <ArticleHeader title={articleTitle} date={publishDate} />

      <ArticleSummary summary={articleSummary} />

      {/* 2. Addedw-full' and 'mx-auto', removed broken flex classes */}
      <div className="w-full max-w-3xl mx-auto border-t-2 border-t-inferno pt-8">
        <ArticleContent content={articleContent} />
      </div>

      {/* This bottom div was already set up correctly! */}
      <div className="w-full max-w-3xl mx-auto mt-16 pt-8 border-t-2 border-t-inferno flex justify-start items-center">
        <Button
          href="/news"
          className="inline-flex items-center px-3 py-1 text-white text-xs font-bold shadow-sm transition"
          variant="secondary"
        >
          <span className="mr-1 py-2 text-md">&larr;</span>
          {backLinkText || "Back to News"}
        </Button>
      </div>
    </main>
  );
}
