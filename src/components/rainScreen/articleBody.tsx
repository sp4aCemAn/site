'use client'

import MarkdownFlow, { flowHeight } from '@/components/text/markdownFlow'
import TextButton from '@/components/text/textButton'
import { useMonoSurface } from '@/components/text/monoSurface'
import type { Article } from '@/data/siteConfig'

/** Rough reading time from the painted words. */
export function readingMinutes(article: Article): number {
  const words = article.body.join(' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/** Body blocks: a meta line first, then the article's own markdown. */
export function articleBlocks(article: Article): string[] {
  return [
    `### ${article.date} · ${readingMinutes(article)} min read`,
    ...article.body,
  ]
}

/**
 * An article: the markdown body flowing down the grid, with newer/older boxes
 * after it. Region reservations grow the canvas, so long posts simply scroll.
 */
export default function ArticleBody({
  article,
  newer,
  older,
  top = 17,
}: {
  article: Article
  newer?: Article | null
  older?: Article | null
  top?: number
}) {
  const { metrics } = useMonoSurface()
  const blocks = articleBlocks(article)
  const rows = flowHeight(blocks, metrics)
  const navRow = top + rows + 2
  const rightLabel = older ? 'OLDER →' : ''
  const rightCol = Math.max(2, metrics.cols - 3 - 2 - rightLabel.length)

  return (
    <>
      <MarkdownFlow id="article" content={blocks} top={top} />
      {newer ? (
        <TextButton
          id="article-newer"
          label="← NEWER"
          href={`/news/${newer.slug}`}
          col={4}
          row={navRow + 1}
          pad={2}
        />
      ) : null}
      {older ? (
        <TextButton
          id="article-older"
          label={rightLabel}
          href={`/news/${older.slug}`}
          col={rightCol}
          row={navRow + 1}
          pad={2}
        />
      ) : null}
    </>
  )
}
