import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsArticlePage1 from "@/components/pageType/newsArticlePage1";
import { site, articles } from "@/data/siteConfig";

interface ArticleRouteProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return articles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ArticleRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  return { title: `${site.name} - ${article?.title || "News"}` };
}

export default async function ArticleRoute({ params }: ArticleRouteProps) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  return (
    <NewsArticlePage1
      articleTitle={article.title}
      publishDate={article.date}
      articleSummary={article.summary}
      articleContent={article.content}
      backLinkText="Back to News"
    />
  );
}
