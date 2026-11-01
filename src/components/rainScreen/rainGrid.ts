import type { Cell } from '@/components/text/monoGrid'
import { inkClass } from '@/components/text/monoGrid'
import type { Rect } from '@/components/text/monoSurface'

export type Run = { text: string; cls: string }

function runsEqual(a: Run[], b: Run[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i].text !== b[i].text || a[i].cls !== b[i].cls) return false
  }
  return true
}

/**
 * Two-layer character grid for a monospace screen.
 *
 * `base` holds the stable ink (frame, labels) and is only rebuilt when the
 * screen geometry or a region's state changes. `ink` holds the rain and is
 * repainted per frame, but only for the rows the drops actually touched — the
 * rows in between keep their previous run arrays by reference so React can skip
 * them entirely.
 */
export class RainGrid {
  cols = 0
  rows = 0

  private base: Cell[][] = []
  private ink: (Cell[] | null)[] = []
  private blocked = new Uint8Array(0)
  private dirty = new Uint8Array(0)
  private lastDirty: number[] = []
  private out: Run[][] = []

  resize(cols: number, rows: number) {
    this.cols = cols
    this.rows = rows
    this.base = Array.from({ length: rows }, () => new Array(cols).fill(null))
    this.ink = new Array(rows).fill(null)
    this.blocked = new Uint8Array(cols * rows)
    this.dirty = new Uint8Array(rows)
    this.lastDirty = []
    this.out = Array.from({ length: rows }, () => [])
  }

  /**
   * Stable ink: frame ring plus every region. The region rects become the
   * keep-out mask, so rain never paints inside a label, box or embed.
   */
  setBase(cells: Cell[][], rects: Rect[]) {
    this.base = cells
    this.blocked.fill(0)
    for (const rect of rects) {
      for (let r = rect.row; r < rect.row + rect.rows; r++) {
        if (r < 0 || r >= this.rows) continue
        for (let c = rect.col; c < rect.col + rect.cols; c++) {
          if (c < 0 || c >= this.cols) continue
          this.blocked[r * this.cols + c] = 1
        }
      }
    }
    for (let r = 0; r < this.rows; r++) this.dirty[r] = 1
  }

  isBlocked(row: number, col: number): boolean {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return true
    return this.blocked[row * this.cols + col] === 1
  }

  /** Brightest glyph wins the cell, like a terminal redraw. */
  setInk(row: number, col: number, glyph: string, opacity: number, bold = false) {
    if (this.isBlocked(row, col)) return
    let cells = this.ink[row]
    if (!cells) {
      cells = new Array(this.cols).fill(null)
      this.ink[row] = cells
    }
    const prev = cells[col]
    if (!prev || prev.opacity < opacity) {
      cells[col] = { glyph, opacity, bold }
      this.dirty[row] = 1
    }
  }

  /** Drop every rain cell from the rows painted last frame. */
  clearInk() {
    for (const r of this.lastDirty) {
      const cells = this.ink[r]
      if (!cells) continue
      cells.fill(null)
      this.dirty[r] = 1
    }
  }

  /** Compose the marked rows into runs; unchanged rows keep their array. */
  commit(): Run[][] {
    for (let r = 0; r < this.rows; r++) {
      if (!this.dirty[r]) continue
      const runs = this.buildRow(r)
      this.out[r] = runsEqual(runs, this.out[r]) ? this.out[r] : runs
      this.dirty[r] = 0
    }
    this.lastDirty = this.out.reduce<number[]>((acc, _runs, r) => {
      if (this.ink[r]) acc.push(r)
      return acc
    }, [])
    return this.out.slice()
  }

  private buildRow(r: number): Run[] {
    const inkRow = this.ink[r]
    const baseRow = this.base[r]
    const runs: Run[] = []
    let text = ''
    let cls = ''
    let gap = 0

    for (let c = 0; c < this.cols; c++) {
      const cell = (inkRow ? inkRow[c] : null) ?? baseRow[c]
      if (!cell || cell.glyph === ' ') {
        if (text) {
          runs.push({ text, cls })
          text = ''
          cls = ''
        }
        gap++
        continue
      }
      const next = inkClass(cell.opacity, Boolean(cell.bold))
      if (text && next !== cls) {
        runs.push({ text, cls })
        text = ''
        cls = ''
      }
      // Blanks are invisible, so they ride along inside the neighbouring run
      // instead of getting a span of their own.
      if (gap > 0) {
        text += ' '.repeat(gap)
        gap = 0
      }
      if (!cls) cls = next
      text += cell.glyph
    }
    if (text) runs.push({ text, cls })
    return runs
  }
}
