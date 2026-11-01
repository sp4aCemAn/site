import React from 'react';

export interface ArticleHeaderProps {
  title: string;
  date: string;
  category?: string;
}

export default function ArticleHeader({ title, date, category = "News" }: ArticleHeaderProps) {
  return (
    <header className="max-w-4xl mx-auto text-center space-y-6 mb-12">
      <div className="flex items-center justify-center gap-3">
        <span className="px-3 py-1 text-xs font-bold tracking-widest text-white border-t-inferno border-t-2 uppercase  ">
          {category}
        </span>
        <span className="text-sm font-bold tracking-widest text-white uppercase">
          {date}
        </span>
      </div>

      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
        {title}
      </h1>

    </header>
  );
}
