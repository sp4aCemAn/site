'use client'

import { useCallback, useMemo } from 'react'
import { layoutWithLines, prepareWithSegments } from '@chenglou/pretext'
import { MONO, ringCells, writeCells, type Cell } from '@/components/text/monoGrid'
import { useMonoSurface } from '@/components/text/monoSurface'
import { useRegion } from '@/components/text/useRegion'

export interface GridTextProps {
  /** Stable id for the region. */
  id: string
  /** One string per paragraph. */
  text: string | string[]
  /** Column width in cells. Omit to derive it from the screen width. */
  cols?: number
  /** Column width as a fraction of the screen, when `cols` is not set. */
  ofWidth?: number
  maxCols?: number
  minCols?: number
  row?: number
  col?: number
  anchor?: 'top' | 'bottom'
  align?: 'start' | 'center' | 'end'
  /** Wrap the block in a `╔═╗` box; `label` is set into the top rail. */
  border?: boolean
  label?: string
  /** Blank rows between paragraphs. */
  spacing?: number
  opacity?: number
  bold?: boolean
}

/** Wrap a paragraph to a cell width using pretext's own line breaking. */
export function wrapParagraph(
  paragraph: string,
  metrics: { charWidth: number; lineHeight: number; fontSize: number },
  cols: number,
): string[] {
  if (!paragraph.trim()) return ['']
  const prepared = prepareWithSegments(paragraph, `${metrics.fontSize}px ${MONO}`)
  const lines = layoutWithLines(prepared, cols * metrics.charWidth, metrics.lineHeight).lines
  return lines.map((line) => {
    const chars = Array.from(line.text)
    if (chars.length <= cols) return line.text
    // A token longer than the column gets clipped with a marker.
    return `${chars.slice(0, cols - 1).join('')}›`
  })
}

/**
 * Normal text inside the rendered screen: prose is wrapped by pretext and
 * painted cell for cell, so paragraphs live in the same grid as the rain, the
 * wordmark and the buttons.
 */
export default function GridText({
  id,
  text,
  cols,
  ofWidth = 0.7,
  maxCols = 80,
  minCols = 28,
  row = 0,
  col = 0,
  anchor = 'top',
  align = 'center',
  border = false,
  label,
  spacing = 1,
  opacity = 1,
  bold = false,
}: GridTextProps) {
  const { metrics } = useMonoSurface()
  const paragraphs = useMemo(() => (Array.isArray(text) ? text : [text]), [text])

  const width = useMemo(() => {
    if (cols !== undefined) return cols
    if (metrics.cols <= 0) return 0
    return Math.max(minCols, Math.min(maxCols, Math.round(metrics.cols * ofWidth)))
  }, [cols, ofWidth, maxCols, minCols, metrics.cols])

  const lines = useMemo(() => {
    if (metrics.charWidth <= 0 || width <= 0) return []
    const out: string[] = []
    paragraphs.forEach((paragraph, i) => {
      if (i > 0 && spacing > 0) out.push(...Array.from({ length: spacing }, () => ''))
      out.push(...wrapParagraph(paragraph, metrics, width))
    })
    return out
  }, [paragraphs, metrics, width, spacing])

  const inner = border ? width + 2 : width
  const height = lines.length + (border ? 2 : 0)

  const startCol =
    align === 'center'
      ? Math.floor((metrics.cols - inner) / 2)
      : align === 'end'
        ? metrics.cols - inner
        : col
  const startRow = anchor === 'bottom' ? metrics.rows - height - row : row

  const draw = useCallback((): Cell[][] => {
    const cells = border
      ? ringCells(height, inner, { opacity: 0.7 }, label)
      : Array.from({ length: height }, () => new Array<Cell | null>(inner).fill(null))
    const offset = border ? 1 : 0
    lines.forEach((line, r) => {
      writeCells(cells, r + offset, offset, line, { opacity, bold })
    })
    return cells
  }, [border, height, inner, label, lines, opacity, bold])

  const region = useMemo(
    () =>
      metrics.cols > 0 &&
      lines.length > 0 &&
      inner <= metrics.cols - 2
        ? {
            id,
            rect: { col: startCol, row: startRow, cols: inner, rows: height },
            reserve: anchor === 'bottom' ? undefined : startRow + height,
            draw,
          }
        : null,
    [id, draw, startCol, startRow, inner, height, lines.length, metrics.cols, anchor],
  )
  useRegion(region)

  return null
}
