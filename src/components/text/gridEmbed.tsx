'use client'

import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { ringCells } from '@/components/text/monoGrid'
import { useMonoSurface } from '@/components/text/monoSurface'
import { useRegion } from '@/components/text/useRegion'
import { PublicImage } from '@/utils/getImage'

export type EmbedKind = 'video' | 'image' | 'frame'

export interface GridEmbedProps {
  /** Stable id for the region. */
  id: string
  /** YouTube/Vimeo URL (or bare YouTube id), an image path, or any URL. */
  src: string
  /** Accessible name for the embed and its painted rail. */
  title: string
  kind?: EmbedKind
  /** Box height in cells, including the border. */
  rows: number
  /** Box width in cells. Omit to derive it from `rows` and `aspect`. */
  cols?: number
  /** Width/height ratio used when `cols` is not set. Defaults to 16:9. */
  aspect?: number
  col?: number
  row?: number
  anchor?: 'top' | 'bottom'
  align?: 'start' | 'center' | 'end'
  /** Rail text; defaults to `title`. */
  label?: string
  fit?: 'contain' | 'cover'
}

const IMAGE_RE = /\.(png|jpe?g|gif|webp|avif|svg)$/i
const YOUTUBE_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,20})/
const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/

/** Work out what a `src` is and the URL a browser should actually load. */
export function resolveEmbed(src: string, kind?: EmbedKind): { kind: EmbedKind; url: string } {
  const bareVideoId = /^[\w-]{11}$/.test(src)
  const youtube = bareVideoId ? src : YOUTUBE_RE.exec(src)?.[1]
  const vimeo = VIMEO_RE.exec(src)?.[1]
  const resolved: EmbedKind =
    kind ??
    (youtube || vimeo
      ? 'video'
      : IMAGE_RE.test(src) || src.startsWith('/')
        ? 'image'
        : 'frame')

  if (resolved === 'video') {
    if (youtube) return { kind: 'video', url: `https://www.youtube-nocookie.com/embed/${youtube}` }
    if (vimeo) return { kind: 'video', url: `https://player.vimeo.com/video/${vimeo}` }
  }
  return { kind: resolved, url: src }
}

/**
 * A real web canvas (iframe or image) placed inside the text screen. Its box is
 * painted as `╔═╗` glyph cells with the title in the rail, and the rect is
 * masked so the rain never falls over it.
 */
export default function GridEmbed({
  id,
  src,
  title,
  kind,
  rows,
  cols,
  aspect = 16 / 9,
  col = 0,
  row = 0,
  anchor = 'top',
  align = 'center',
  label,
  fit = 'contain',
}: GridEmbedProps) {
  const { metrics } = useMonoSurface()
  const embed = useMemo(() => resolveEmbed(src, kind), [src, kind])

  // Deriving the width from the row count keeps the canvas at its own aspect
  // ratio no matter which monospace font the visitor's machine resolves.
  const width = useMemo(() => {
    if (cols !== undefined) return cols
    if (metrics.charWidth <= 0) return 0
    const innerRows = Math.max(1, rows - 2)
    const pixels = innerRows * metrics.lineHeight * aspect
    return Math.round(pixels / metrics.charWidth) + 2
  }, [cols, rows, aspect, metrics.charWidth, metrics.lineHeight])

  const startCol =
    align === 'center'
      ? Math.floor((metrics.cols - width) / 2)
      : align === 'end'
        ? metrics.cols - width
        : col
  const startRow = anchor === 'bottom' ? metrics.rows - rows - row : row

  const fits =
    metrics.cols > 0 &&
    width > 3 &&
    rows > 2 &&
    width <= metrics.cols - 2

  const region = useMemo(
    () =>
      fits
        ? {
            id,
            rect: { col: startCol, row: startRow, cols: width, rows },
            reserve: anchor === 'bottom' ? undefined : startRow + rows,
            draw: () =>
              ringCells(rows, width, { opacity: 0.7 }, (label ?? title).toUpperCase()),
          }
        : null,
    [fits, id, startCol, startRow, width, rows, label, title, anchor],
  )
  useRegion(region)

  if (!region || !fits || metrics.charWidth <= 0) return null

  // One cell of clearance inside the border, sized in the grid's own units.
  const canvasStyle: CSSProperties = {
    position: 'absolute',
    left: (startCol + 1) * metrics.charWidth,
    top: (startRow + 1) * metrics.lineHeight,
    width: (width - 2) * metrics.charWidth,
    height: (rows - 2) * metrics.lineHeight,
  }

  if (embed.kind === 'image') {
    return (
      <div style={canvasStyle} className="relative overflow-hidden bg-black">
        <PublicImage src={embed.url} alt={title} fill sizes="100vw" style={{ objectFit: fit }} />
      </div>
    )
  }

  return (
    <iframe
      src={embed.url}
      title={title}
      style={{ ...canvasStyle, border: 0 }}
      className="bg-black"
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
    />
  )
}
