'use client'

import { useCallback, useMemo } from 'react'
import { ringCells, type Cell } from '@/components/text/monoGrid'
import { useMonoSurface } from '@/components/text/monoSurface'
import { useRegion } from '@/components/text/useRegion'

/**
 * A big-text font is 52 glyph blocks, `A-Z` then `a-z`. Each block is one
 * multi-line string whose rows are padded to that glyph's own width.
 */
export interface BigFont {
  name: string
  rows: number
  glyphs: string[]
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const INDEX = new Map<string, number>()
LETTERS.split('').forEach((char, i) => INDEX.set(char, i))

export interface ComposeOptions {
  /** Blank columns between glyphs; 1 keeps FIGlet's own spacing readable. */
  gap?: number
  /** Blank columns for characters the font does not carry (a space). */
  spaceWidth?: number
  /** Fold lower case onto the upper-case glyphs. */
  upper?: boolean
  /** Fold upper case onto the lower-case glyphs. Wins over `upper`. */
  lower?: boolean
}

export function glyphBlock(
  font: BigFont,
  char: string,
  options: { spaceWidth: number; upper: boolean; lower: boolean },
): string[] {
  const key = options.lower
    ? char.toLowerCase()
    : options.upper
      ? char.toUpperCase()
      : char
  const index = INDEX.get(key)
  if (index === undefined) {
    return Array.from({ length: font.rows }, () => ' '.repeat(options.spaceWidth))
  }
  return font.glyphs[index].split('\n')
}

/** Compose a string into rows of glyphs, side by side. */
export function composeBigText(
  font: BigFont,
  text: string,
  options: ComposeOptions = {},
): string[] {
  const { gap = 1, spaceWidth = 5, upper = false, lower = false } = options
  const chars = Array.from(text)
  const blocks = chars.map((char) =>
    glyphBlock(font, char, { spaceWidth, upper, lower }),
  )

  const out: string[] = []
  for (let r = 0; r < font.rows; r++) {
    let line = ''
    blocks.forEach((block, i) => {
      line += block[r] ?? ''
      if (i < blocks.length - 1) line += ' '.repeat(gap)
    })
    out.push(line.replace(/\s+$/, ''))
  }
  return out
}

export function bigTextSize(rows: string[]): { rows: number; cols: number } {
  return {
    rows: rows.length,
    cols: rows.reduce((max, row) => Math.max(max, Array.from(row).length), 0),
  }
}

/** Width in cells a block would occupy, without touching the DOM. */
export function bigTextWidth(font: BigFont, text: string, options: ComposeOptions = {}): number {
  return bigTextSize(composeBigText(font, text, options)).cols
}

/**
 * First font that fits the given cell width, or `null` when none do. Sizes are
 * pure arithmetic, so this can decide before anything is painted — the hook for
 * swapping in a smaller glyph font on narrow screens.
 */
export function pickBigFont(
  fonts: BigFont[],
  text: string,
  cols: number,
  options: ComposeOptions & { pad?: number } = {},
): BigFont | null {
  const { pad = 2, ...compose } = options
  return (
    fonts.find((font) => bigTextWidth(font, text, compose) + pad * 2 <= cols - 2) ?? null
  )
}

export interface BigTextProps extends ComposeOptions {
  font: BigFont
  text: string
  /** Row in cells; counted from `anchor`. */
  row?: number
  /** Column of the block's first character. */
  col?: number
  anchor?: 'top' | 'bottom'
  align?: 'start' | 'center' | 'end'
  /** Cells painted around the block; with `border` this ring is the frame. */
  pad?: number
  /** Draw a `╔═╗ ║ ║ ╚═╝` box around the block. */
  border?: boolean
  opacity?: number
  bold?: boolean
}

/**
 * Larger text inside the rendered screen: the composed glyph block is painted
 * into the same character grid as the rain, cell for cell.
 */
export default function BigText({
  font,
  text,
  row = 0,
  col = 0,
  anchor = 'top',
  align = 'start',
  pad = 1,
  gap = 1,
  spaceWidth = 5,
  upper = false,
  lower = false,
  border = false,
  opacity = 1,
  bold = false,
}: BigTextProps) {
  const { metrics } = useMonoSurface()

  const lines = useMemo(
    () => composeBigText(font, text, { gap, spaceWidth, upper, lower }),
    [font, text, gap, spaceWidth, upper, lower],
  )
  const size = useMemo(() => bigTextSize(lines), [lines])

  const startCol =
    align === 'center'
      ? Math.floor((metrics.cols - size.cols) / 2)
      : align === 'end'
        ? metrics.cols - size.cols
        : col
  const startRow = anchor === 'bottom' ? metrics.rows - size.rows - row : row

  const draw = useCallback(
    (): Cell[][] => {
      const cellRows = size.rows + pad * 2
      const cellCols = size.cols + pad * 2
      const framed = border && pad >= 1 && cellCols >= 4 && cellRows >= 3
      const cells: Cell[][] = framed
        ? ringCells(cellRows, cellCols, { opacity, bold })
        : Array.from({ length: cellRows }, () => new Array<Cell | null>(cellCols).fill(null))
      // Glyph rows are written inside the ring; blanks leave no cell behind, and
      // the rect is masked so the rain cannot paint over them either way.
      lines.forEach((line, r) => {
        const chars = Array.from(line)
        for (let c = 0; c < chars.length; c++) {
          const target = cells[r + pad]?.[c + pad]
          if (target === undefined || chars[c] === ' ') continue
          cells[r + pad][c + pad] = { glyph: chars[c], opacity, bold }
        }
      })
      return cells
    },
    [lines, size.cols, size.rows, pad, opacity, bold, border],
  )

  const region = useMemo(
    () =>
      metrics.cols > 0 &&
      // Glyph blocks cannot scale, so a block wider than the screen is left
      // unpainted rather than cropped mid-letter. Height is fine: the surface
      // grows the canvas for it.
      size.cols + pad * 2 <= metrics.cols - 2
        ? {
            id: `bigtext-${font.name}-${text}-${row}-${col}-${align}`,
            rect: {
              col: startCol - pad,
              row: startRow - pad,
              cols: size.cols + pad * 2,
              rows: size.rows + pad * 2,
            },
            reserve: anchor === 'bottom' ? undefined : startRow + size.rows + pad,
            draw,
          }
        : null,
    [
      draw,
      font.name,
      text,
      row,
      col,
      align,
      anchor,
      pad,
      size.cols,
      size.rows,
      startCol,
      startRow,
      metrics.cols,
    ],
  )
  useRegion(region)

  return null
}
