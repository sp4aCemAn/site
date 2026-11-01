import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleBody from "@/components/rainScreen/articleBody";
import TextScreen from "@/components/rainScreen/textScreen";
import { articles, site } from "@/data/siteConfig";

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

type Params = Promise<{ slug: string }>;

function findArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) return { title: `${site.name} - News` };
  return {
    title: `${site.name} - ${article.title}`,
    description: article.summary,
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const index = articles.findIndex((article) => article.slug === slug);
  if (index < 0) notFound();
  const article = articles[index];

  return (
    <TextScreen title={article.title}>
      <ArticleBody article={article} newer={articles[index - 1]} older={articles[index + 1]} />
    </TextScreen>
  );
}
