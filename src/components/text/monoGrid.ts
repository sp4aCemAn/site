import { useEffect, useState, type RefObject } from 'react'
import { measureNaturalWidth, prepareWithSegments } from '@chenglou/pretext'

// The exact same string is used as the canvas font key for pretext, so the
// measurement always matches what the browser paints. Kept in sync with
// `--font-sans` in globals.css.
export const MONO =
  '"ui-monospace", "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", "DejaVu Sans Mono", monospace'

export const FALLBACK_CHAR_WIDTH = 0.6

export type Cell = { glyph: string; opacity: number; bold?: boolean } | null

/**
 * Ink depth is quantized to 40 greyscale steps and painted with static
 * classes, so runs merge more often than per-glyph styles would allow and a
 * repaint swaps class names instead of recomputing inline styles. Keep
 * `.pt-i1`…`.pt-i40` in globals.css in sync with this.
 */
export const INK_STEPS = 40

export function inkClass(opacity: number, bold: boolean): string {
  const step = Math.max(1, Math.min(INK_STEPS, Math.round(opacity * INK_STEPS)))
  return bold ? `pt-i${step} pt-b` : `pt-i${step}`
}

export type Metrics = {
  cols: number
  rows: number
  charWidth: number
  lineHeight: number
  /** Font size the cells were measured at, for re-wrapping prose in the grid. */
  fontSize: number
}

/**
 * How many rows fit in the window. The canvas grows past this when regions
 * reserve more, so measurement never depends on the element's own height.
 */
function rowsFor(height: number, lineHeight: number): number {
  return Math.max(1, Math.floor(height / Math.max(1, lineHeight)))
}

export function useViewportRows(lineHeight: number): number {
  // Always start at 0: reading `window` during render would make the prerendered
  // HTML disagree with the first client render, and React then leaves the
  // mismatched inline height in place forever.
  const [rows, setRows] = useState(0)

  useEffect(() => {
    const apply = () => setRows(rowsFor(window.innerHeight, lineHeight))
    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [lineHeight])

  return rows
}

export function emptyRow(cols: number): Cell[] {
  return new Array(cols).fill(null)
}

export type Paint = { opacity?: number; bold?: boolean }

/**
 * A `╔═╗ ║ ║ ╚═╝` ring as its own cell matrix — the same text the rain is made
 * of, so frames, labels and embeds all share one grid. Optional `label` is set
 * into the top rail, brighter than the ring.
 */
export function ringCells(
  rows: number,
  cols: number,
  paint: Paint = {},
  label?: string,
): Cell[][] {
  const cells: Cell[][] = Array.from({ length: rows }, () => new Array(cols).fill(null))
  if (rows < 3 || cols < 4) return cells
  const { opacity = 1, bold = false } = paint
  const corner = (r: number, c: number, glyph: string) =>
    (cells[r][c] = { glyph, opacity, bold })
  corner(0, 0, '╔')
  corner(0, cols - 1, '╗')
  corner(rows - 1, 0, '╚')
  corner(rows - 1, cols - 1, '╝')
  for (let c = 1; c < cols - 1; c++) {
    cells[0][c] = { glyph: '═', opacity, bold }
    cells[rows - 1][c] = { glyph: '═', opacity, bold }
  }
  for (let r = 1; r < rows - 1; r++) {
    cells[r][0] = { glyph: '║', opacity, bold }
    cells[r][cols - 1] = { glyph: '║', opacity, bold }
  }
  if (label) writeCells(cells, 0, 1, ` ${label} `, { opacity: 1, bold: true })
  return cells
}

/** Write text into a cell matrix at (row, col); out-of-range cells are skipped. */
export function writeCells(
  cells: Cell[][],
  row: number,
  col: number,
  text: string,
  paint: Paint = {},
) {
  const { opacity = 1, bold = false } = paint
  const chars = Array.from(text)
  for (let i = 0; i < chars.length; i++) {
    const cell = cells[row]?.[col + i]
    if (cell === undefined) continue
    cells[row][col + i] = chars[i] === ' ' ? null : { glyph: chars[i], opacity, bold }
  }
  return cells
}

/**
 * One monospace advance width, measured by pretext with the shared font key.
 * This is the only measurement the grid needs: in a monospace font every cell
 * is the same width, so `cols`/`rows` derived from it are already an exact line
 * layout — no per-frame re-layout pass is required.
 */
export function measureMonoWidth(fontSize: number): number {
  try {
    const ruler = prepareWithSegments('0'.repeat(64), `${fontSize}px ${MONO}`)
    return measureNaturalWidth(ruler) / 64
  } catch {
    return fontSize * FALLBACK_CHAR_WIDTH
  }
}

/**
 * Character-grid metrics for a host element: the column count is derived from
 * pretext's measurement of the monospace font, so cells always line up.
 */
export function useMonoMetrics(
  hostRef: RefObject<HTMLDivElement | null>,
  fontSize: number,
  lineHeightRatio: number,
): {
  cols: number
  charWidth: number
  lineHeight: number
  fontSize: number
  width: number
  ready: boolean
} {
  const [size, setSize] = useState({ width: 0, charWidth: 0 })
  const lineHeight = Math.round(fontSize * lineHeightRatio)

  // Only the width is measured from the element: the row count is decided by
  // the window plus whatever the regions reserve, so growing the canvas never
  // feeds back into its own measurement.
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const apply = () => setSize((s) => ({ ...s, width: host.clientWidth }))
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(host)
    return () => ro.disconnect()
  }, [hostRef])

  useEffect(() => {
    let cancelled = false
    const fontKey = `${fontSize}px ${MONO}`
    const compute = () => {
      const charWidth = measureMonoWidth(fontSize)
      if (!cancelled) setSize((s) => ({ ...s, charWidth }))
    }
    // Load the regular and bold faces: labels bold on hover must not change
    // the advance width of a cell.
    Promise.all([
      document.fonts.load(fontKey, '0|·+-║═╔╗╚╝'),
      document.fonts.load(`700 ${fontKey}`, '0|·+-║═╔╗╚╝'),
    ])
      .then(compute)
      .catch(compute)
    return () => {
      cancelled = true
    }
  }, [fontSize])

  const ready = size.width > 0 && size.charWidth > 0
  return {
    cols: ready ? Math.max(1, Math.floor(size.width / size.charWidth)) : 0,
    charWidth: size.charWidth,
    lineHeight,
    fontSize,
    width: size.width,
    ready,
  }
}
