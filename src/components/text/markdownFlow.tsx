'use client'

import { Fragment, useMemo } from 'react'
import {
  bigTextSize,
  composeBigText,
  pickBigFont,
  type BigFont,
} from '@/components/text/bigText'
import BigText from '@/components/text/bigText'
import GridEmbed from '@/components/text/gridEmbed'
import GridText from '@/components/text/gridText'
import TextButton from '@/components/text/textButton'
import { gothic } from '@/data/fonts/gothic'
import { parseMarkdown, wrapLines, type Block } from '@/components/text/markdownGrid'
import { useMonoSurface } from '@/components/text/monoSurface'

export interface MarkdownFlowProps {
  /** Prefix for region ids. */
  id: string
  content: string | string[]
  /** First row the flow may occupy. */
  top?: number
  /** Blank rows between blocks. */
  gap?: number
  /** Text column width as a fraction of the screen. */
  ofWidth?: number
  maxCols?: number
  /**
   * Fonts for `#` headings, largest first: the first one wide enough is used,
   * so a smaller companion font takes over on narrow viewports.
   */
  fonts?: BigFont[]
}

const HEADING_PAD = 1

/** Text column used by the flow, in cells. */
export function flowTextCols(metrics: { cols: number }, ofWidth = 0.68, maxCols = 78): number {
  if (metrics.cols <= 0) return 0
  return Math.max(24, Math.min(maxCols, Math.round(metrics.cols * ofWidth)))
}

function headingRows(text: string, font: BigFont | null): number {
  if (!font) return 1
  const size = bigTextSize(composeBigText(font, text, { gap: 1, lower: true }))
  return size.rows + HEADING_PAD * 2
}

function blockRows(
  block: Block,
  ctx: { textCols: number; fontFor: (text: string) => BigFont | null },
): number {
  switch (block.kind) {
    case 'heading':
      return block.level === 1 ? headingRows(block.text, ctx.fontFor(block.text)) : 1
    case 'paragraph':
      return wrapLines(block.text, ctx.textCols).length
    case 'list':
      return block.items.reduce((sum, item) => sum + wrapLines(item, ctx.textCols - 2).length, 0)
    case 'quote':
      return wrapLines(block.text, ctx.textCols - 2).length
    case 'code':
      return block.lines.length + 2
    case 'embed':
      return block.embed.rows
    case 'link':
      return 3
  }
}

export type FlowOptions = {
  gap?: number
  ofWidth?: number
  maxCols?: number
  fonts?: BigFont[]
}

/**
 * Rows a document would occupy, measured without painting anything, so a
 * sibling region can place itself after the flow in the same pass.
 */
export function flowHeight(
  content: string | string[],
  metrics: { cols: number },
  options: FlowOptions = {},
): number {
  const { gap = 2, ofWidth, maxCols, fonts = [gothic] } = options
  const textCols = flowTextCols(metrics, ofWidth, maxCols)
  if (textCols <= 0) return 0
  const blocks = parseMarkdown(Array.isArray(content) ? content.join('\n\n') : content)
  const fontFor = (text: string) =>
    pickBigFont(fonts, text, metrics.cols, { gap: 1, lower: true, pad: HEADING_PAD })
  return blocks.reduce(
    (rows, block, i) =>
      rows + blockRows(block, { textCols, fontFor }) + (i < blocks.length - 1 ? gap : 0),
    0,
  )
}

/**
 * Lay a markdown document out down the character grid: each block is measured in
 * one pass (a monospace cell width is exact arithmetic) and painted by the
 * region it maps to. Regions reserve their own rows, so the canvas grows and the
 * document scrolls when a page is taller than the window.
 */
export default function MarkdownFlow({
  id,
  content,
  top = 3,
  gap = 2,
  ofWidth = 0.68,
  maxCols = 78,
  fonts = [gothic],
}: MarkdownFlowProps) {
  const { metrics } = useMonoSurface()
  const md = Array.isArray(content) ? content.join('\n\n') : content
  const blocks = useMemo(() => parseMarkdown(md), [md])
  const textCols = useMemo(
    () => flowTextCols(metrics, ofWidth, maxCols),
    [metrics, ofWidth, maxCols],
  )
  const left = Math.max(2, Math.floor((metrics.cols - textCols) / 2))

  const fontFor = useMemo(
    () => (text: string) =>
      pickBigFont(fonts, text, metrics.cols, { gap: 1, lower: true, pad: HEADING_PAD }),
    [fonts, metrics.cols],
  )

  const placed = useMemo(() => {
    const items: { key: string; row: number; block: Block }[] = []
    let cursor = top
    for (const [index, block] of blocks.entries()) {
      items.push({ key: `${id}-${index}`, row: cursor, block })
      cursor += blockRows(block, { textCols, fontFor }) + gap
    }
    return items
  }, [blocks, fontFor, gap, id, textCols, top])

  if (metrics.cols <= 0 || textCols <= 0) return null

  return (
    <>
      {placed.map(({ key, row, block }) => (
        <Fragment key={key}>
          {renderBlock({ key, block, row, left, textCols, fontFor })}
        </Fragment>
      ))}
    </>
  )
}

function renderBlock({
  key,
  block,
  row,
  left,
  textCols,
  fontFor,
}: {
  key: string
  block: Block
  row: number
  left: number
  textCols: number
  fontFor: (text: string) => BigFont | null
}) {
  switch (block.kind) {
    case 'heading': {
      const font = block.level === 1 ? fontFor(block.text) : null
      if (font) {
        return (
          <BigText
            font={font}
            text={block.text}
            col={left}
            row={row + HEADING_PAD}
            gap={1}
            lower
            border
            pad={HEADING_PAD}
          />
        )
      }
      return (
        <GridText
          id={`${key}-h`}
          text={wrapLines(block.text, textCols)}
          spacing={0}
          col={left}
          row={row}
          cols={textCols}
          align="start"
          bold
          opacity={block.level >= 2 ? (block.level === 2 ? 1 : block.level === 3 ? 0.75 : 0.6) : 1}
        />
      )
    }
    case 'paragraph':
      return (
        <GridText
          id={`${key}-p`}
          text={wrapLines(block.text, textCols)}
          spacing={0}
          col={left}
          row={row}
          cols={textCols}
          align="start"
          opacity={0.85}
        />
      )
    case 'list':
      return (
        <GridText
          id={`${key}-l`}
          text={block.items
            .flatMap((item) => wrapLines(item, textCols - 2))
            .map((line) => `  ${line}`)}
          spacing={0}
          col={left}
          row={row}
          cols={textCols}
          align="start"
          opacity={0.85}
        />
      )
    case 'quote':
      return (
        <GridText
          id={`${key}-q`}
          text={wrapLines(block.text, textCols - 2).map((line) => `│ ${line}`)}
          spacing={0}
          col={left}
          row={row}
          cols={textCols}
          align="start"
          opacity={0.7}
        />
      )
    case 'code':
      return (
        <GridText
          id={`${key}-c`}
          text={block.lines}
          spacing={0}
          col={left}
          row={row}
          cols={textCols}
          align="start"
          border
          label="code"
          opacity={0.8}
        />
      )
    case 'embed':
      return (
        <GridEmbed
          id={`${key}-e`}
          src={block.embed.src}
          title={block.embed.title}
          kind={block.embed.kind}
          cols={block.embed.cols}
          rows={block.embed.rows}
          align="center"
          row={row}
        />
      )
    case 'link':
      return (
        <TextButton
          id={`${key}-a`}
          label={block.link.label.toUpperCase()}
          href={block.link.href}
          external={block.link.external}
          col={left}
          row={row + 1}
          pad={2}
        />
      )
  }
}
