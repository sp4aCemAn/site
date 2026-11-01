'use client'

import { useEffect, useRef, useState } from 'react'
import {
  layoutWithLines,
  measureLineStats,
  prepareWithSegments,
  type LayoutLine
} from '@chenglou/pretext'

// Must stay in sync with `--font-sans` in globals.css so canvas measurement
// matches what the browser paints.
const FAMILY =
  '"ui-monospace", "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", "DejaVu Sans Mono", monospace'

export interface PretextBlockProps {
  text: string
  weight?: number
  /** Fixed font size in px (ignored when `scale` is set). */
  fontSize?: number
  /** Font size = container width * scale, clamped by min/maxFontSize. */
  scale?: number
  minFontSize?: number
  maxFontSize?: number
  lineHeightRatio?: number
  letterSpacing?: number
  /** Shrink-wrap to the tightest width that still keeps the same line count. */
  shrink?: boolean
  /** Clamp to N lines with a measured ellipsis. */
  maxLines?: number
  /** Cap the wrap width in px. */
  maxWidth?: number
  /** Staggered per-line reveal animation. */
  reveal?: boolean
  className?: string
}

interface View {
  size: number
  lineHeight: number
  width: number
  lines: LayoutLine[]
}

export default function PretextBlock({
  text,
  weight = 400,
  fontSize = 16,
  scale,
  minFontSize = 14,
  maxFontSize = 400,
  lineHeightRatio = 1.1,
  letterSpacing = 0,
  shrink = false,
  maxLines,
  maxWidth,
  reveal = false,
  className = ''
}: PretextBlockProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [avail, setAvail] = useState(0)
  const [view, setView] = useState<View | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    setAvail(host.clientWidth)
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setAvail(entry.contentRect.width)
    })
    ro.observe(host)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (avail <= 0 || !text) return
    let cancelled = false

    const cap = Math.min(avail, maxWidth ?? Infinity)
    const size = scale
      ? Math.round(Math.min(maxFontSize, Math.max(minFontSize, cap * scale)))
      : fontSize
    const lineHeight = Math.round(size * lineHeightRatio)
    const fontKey = `${weight} ${size}px ${FAMILY}`

    const run = async () => {
      try {
        await document.fonts.load(fontKey, text)
      } catch {
        // Font loading issues shouldn't block measurement.
      }
      if (cancelled) return

      try {
        const prepared = prepareWithSegments(text, fontKey, { letterSpacing })

        let width = cap
        if (shrink) {
          // Find the smallest width that produces the same line count as `cap`,
          // then shrink-wrap to its widest line.
          const target = measureLineStats(prepared, cap).lineCount
          let lo = 1
          let hi = cap
          while (lo < hi) {
            const mid = Math.floor((lo + hi) / 2)
            if (measureLineStats(prepared, mid).lineCount > target) lo = mid + 1
            else hi = mid
          }
          width = Math.min(cap, Math.ceil(measureLineStats(prepared, lo).maxLineWidth))
        }

        let lines = layoutWithLines(prepared, width, lineHeight).lines

        if (maxLines !== undefined && lines.length > maxLines) {
          // Re-measure the truncated text with the ellipsis so the painted
          // lines stay exact.
          const ellipsized =
            lines.slice(0, maxLines).map((l) => l.text).join(' ') + '…'
          const clamped = prepareWithSegments(ellipsized, fontKey, { letterSpacing })
          lines = layoutWithLines(clamped, width, lineHeight).lines
        }

        if (!cancelled) setView({ size, lineHeight, width, lines })
      } catch {
        // Non-grapheme edge cases: fall back to natural browser wrapping.
        if (!cancelled) setView({ size, lineHeight, width: cap, lines: [] })
      }
    }

    void run()
    return () => { cancelled = true }
  }, [text, avail, weight, fontSize, scale, minFontSize, maxFontSize, lineHeightRatio, letterSpacing, shrink, maxLines, maxWidth])

  const baseStyle: React.CSSProperties = {
    fontFamily: FAMILY,
    fontWeight: weight,
    fontSize: view ? view.size : fontSize,
    lineHeight: view ? `${view.lineHeight}px` : lineHeightRatio,
    letterSpacing: letterSpacing || undefined,
    overflowWrap: 'break-word'
  }

  return (
    <div ref={hostRef} className="w-full">
      <div
        className={`whitespace-normal ${className}`}
        style={{ ...baseStyle, width: view ? view.width : undefined }}
      >
        {view && view.lines.length > 0 ? (
          view.lines.map((line, i) => (
            <span
              key={i}
              className={reveal ? 'pt-line-reveal block' : 'block'}
              style={reveal ? { animationDelay: `${i * 60}ms` } : undefined}
            >
              {line.text}
            </span>
          ))
        ) : (
          text
        )}
      </div>
    </div>
  )
}
