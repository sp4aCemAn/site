'use client'

import Link from 'next/link'
import { useCallback, useMemo } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { ringCells, writeCells, type Cell } from '@/components/text/monoGrid'
import { useMonoSurface, type RegionState } from '@/components/text/monoSurface'
import { useRegion } from '@/components/text/useRegion'

export interface TextButtonProps {
  /** Stable id; routes hover/focus state back into the painted grid. */
  id: string
  label: string
  /** Page or URL. Omit for a pure action. */
  href?: string
  onClick?: () => void
  external?: boolean
  /** Column of the label's first character. Ignored when `align` is set. */
  col?: number
  /** Row of the label; counted from `anchor`. */
  row?: number
  anchor?: 'top' | 'bottom'
  /** `end` runs flush to the last column; use `col` to stay inside a frame. */
  align?: 'start' | 'center' | 'end'
  /** Blank cells painted around the label. */
  pad?: number
  /** Extra hit rows above and below the label row. */
  padRows?: number
  /** Draw a `╔═╗ ║ ║ ╚═╝` box around the label. */
  border?: boolean
  className?: string
}

/** `trailingSlash: true` would 308 every bare href, so normalize here. */
function toStaticHref(href: string) {
  if (!href.startsWith('/')) return href
  if (href.includes('?') || href.includes('#')) return href
  return href.endsWith('/') ? href : `${href}/`
}

/**
 * A real, focusable link/button with no chrome of its own: only its label and
 * `╔═╗` box are visible, painted into the surface's character grid. Hover,
 * focus and press bold the glyphs.
 */
export default function TextButton({
  id,
  label,
  href,
  onClick,
  external = false,
  col = 0,
  row = 0,
  anchor = 'top',
  align = 'start',
  pad = 1,
  padRows = 1,
  border = true,
  className = '',
}: TextButtonProps) {
  const { metrics, setActive, repaint } = useMonoSurface()
  const chars = Array.from(label)
  const cellCols = chars.length + pad * 2
  const cellRows = 1 + padRows * 2
  const labelRow = padRows

  const startCol =
    align === 'center'
      ? Math.floor((metrics.cols - cellCols) / 2)
      : align === 'end'
        ? metrics.cols - cellCols
        : col - pad
  const startRow = anchor === 'bottom' ? metrics.rows - cellRows - row : row

  const draw = useCallback(
    (state: RegionState): Cell[][] => {
      const bold = state !== 'idle'
      const edge = border
        ? ringCells(cellRows, cellCols, { opacity: state === 'idle' ? 0.7 : 1, bold })
        : Array.from({ length: cellRows }, () => new Array<Cell | null>(cellCols).fill(null))
      // The rain cannot reach these cells (the rect is masked out), so the
      // label always sits on an empty field.
      return writeCells(edge, labelRow, pad, label, {
        opacity: state === 'press' ? 0.55 : 1,
        bold,
      })
    },
    [border, cellCols, cellRows, labelRow, pad, label],
  )

  const region = useMemo(
    () =>
      metrics.cols > 0
        ? {
            id,
            rect: { col: startCol, row: startRow, cols: cellCols, rows: cellRows },
            reserve: anchor === 'bottom' ? undefined : startRow + cellRows,
            draw,
          }
        : null,
    [id, draw, startCol, startRow, cellCols, cellRows, metrics.cols, anchor],
  )
  useRegion(region)

  if (metrics.cols <= 0 || metrics.rows <= 0) return null

  const boxStyle: CSSProperties = {
    position: 'absolute',
    left: startCol * metrics.charWidth,
    top: startRow * metrics.lineHeight,
    width: cellCols * metrics.charWidth,
    height: cellRows * metrics.lineHeight,
  }

  const activate = (next: RegionState) => () => {
    setActive(id, next)
    repaint()
  }
  const handlers = {
    onMouseEnter: activate('hover'),
    onMouseLeave: activate('idle'),
    onPointerDown: activate('press'),
    onPointerUp: activate('hover'),
    onFocus: activate('focus'),
    onBlur: activate('idle'),
  }

  const chrome =
    `appearance-none block border-0 bg-transparent m-0 p-0 text-left leading-none ` +
    `text-transparent outline-none cursor-pointer select-none ${className}`
  const inner: ReactNode = <span className="sr-only">{label}</span>

  if (href) {
    const isInternal = href.startsWith('/')
    const newTab = external || /^https?:\/\//.test(href)
    if (!isInternal || newTab) {
      return (
        <a
          href={href}
          {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          aria-label={label}
          className={chrome}
          style={boxStyle}
          {...handlers}
        >
          {inner}
        </a>
      )
    }
    return (
      <Link
        href={toStaticHref(href)}
        aria-label={label}
        className={chrome}
        style={boxStyle}
        {...handlers}
      >
        {inner}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={chrome}
      style={boxStyle}
      {...handlers}
    >
      {inner}
    </button>
  )
}
