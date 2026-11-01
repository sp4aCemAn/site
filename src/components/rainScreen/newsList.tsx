'use client'

import { useMemo } from 'react'
import { Fragment } from 'react'
import GridText from '@/components/text/gridText'
import MarkdownFlow, { flowHeight, flowTextCols } from '@/components/text/markdownFlow'
import TextButton from '@/components/text/textButton'
import { wrapLines } from '@/components/text/markdownGrid'
import { useMonoSurface } from '@/components/text/monoSurface'
import type { ScreenContent } from '@/data/siteConfig'

export interface NewsEntry {
  label: string
  href: string
  summary: string
}

/** One box per article with its summary painted underneath, flowing down. */
export function NewsList({
  items,
  prefix = 'news',
  top = 17,
  gap = 2,
}: {
  items: NewsEntry[]
  prefix?: string
  top?: number
  gap?: number
}) {
  const { metrics } = useMonoSurface()
  const textCols = flowTextCols(metrics)
  const left = Math.max(2, Math.floor((metrics.cols - textCols) / 2))

  const placed = useMemo(() => {
    const entries: { item: NewsEntry; row: number; lines: string[] }[] = []
    let cursor = top
    for (const item of items) {
      const lines = wrapLines(item.summary, Math.max(12, textCols - 2)).map((line) => `  ${line}`)
      entries.push({ item, row: cursor, lines })
      cursor += 3 + 1 + lines.length + gap
    }
    return entries
  }, [items, top, gap, textCols])

  if (metrics.cols <= 0 || textCols <= 0) return null

  return (
    <>
      {placed.map(({ item, row, lines }) => (
        <Fragment key={item.href}>
          <TextButton
            id={`${prefix}-link-${item.href}`}
            label={item.label.toUpperCase()}
            href={item.href}
            col={left}
            row={row + 1}
            pad={2}
          />
          <GridText
            id={`${prefix}-summary-${item.href}`}
            text={lines}
            spacing={0}
            col={left}
            row={row + 4}
            cols={textCols}
            align="start"
            opacity={0.7}
          />
        </Fragment>
      ))}
    </>
  )
}

/** The news screen: intro prose, then one box per article. */
export default function NewsBody({
  screen,
  items,
  top = 17,
}: {
  screen: ScreenContent
  items: NewsEntry[]
  top?: number
}) {
  const { metrics } = useMonoSurface()
  const introRows = flowHeight(screen.blurb, metrics)

  return (
    <>
      <MarkdownFlow id="news-intro" content={screen.blurb} top={top} />
      <NewsList items={items} top={top + introRows + 2} />
    </>
  )
}
