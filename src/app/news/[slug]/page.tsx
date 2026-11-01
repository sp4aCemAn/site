import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GridText from "@/components/text/gridText";
import ArticleBody from "@/components/rainScreen/articleBody";
import TextScreen from "@/components/rainScreen/textScreen";
import { articles, site } from "@/data/siteConfig";

export const dynamicParams = false;

// `output: 'export'` refuses to build a dynamic route with zero params, so an
// empty blog still emits this one placeholder page.
const EMPTY_SLUG = "unpublished";

export function generateStaticParams() {
  return articles.length > 0
    ? articles.map((article) => ({ slug: article.slug }))
    : [{ slug: EMPTY_SLUG }];
}

type Params = Promise<{ slug: string }>;

function findArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(slug);
  return {
    title: article ? `${site.name} - ${article.title}` : `${site.name} - News`,
    description: article?.summary,
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const index = articles.findIndex((article) => article.slug === slug);

  if (index < 0) {
    // Reachable only while `articles` is empty; unknown slugs still 404.
    if (articles.length > 0) notFound();
    return (
      <TextScreen title="News">
        <GridText
          id="no-articles"
          text="Nothing is published yet — add entries to `articles` in src/data/siteConfig.ts."
          row={17}
          opacity={0.85}
        />
      </TextScreen>
    );
  }

  const article = articles[index];
  return (
    <TextScreen title={article.title}>
      <ArticleBody article={article} newer={articles[index - 1]} older={articles[index + 1]} />
    </TextScreen>
  );
}
