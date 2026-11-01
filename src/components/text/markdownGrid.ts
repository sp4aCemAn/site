/**
 * A deliberately small markdown reader: it turns the subset this site can paint
 * into blocks, and nothing else. No HTML, no plugins, no dependencies.
 *
 * Supported: `#`–`####` headings, blank-line paragraphs, `- `/`* `/`1. ` lists,
 * `> ` quotes, ``` fences, `![alt](src "COLSxROWS")`, and `[label](src)` on its
 * own line (image, video or link). Everything else is plain text.
 */

const IMAGE_RE = /\.(png|jpe?g|gif|webp|avif|svg)$/i
const YOUTUBE_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,20})/
const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/

export type EmbedSpec = {
  src: string
  title: string
  kind: 'image' | 'video'
  cols: number
  rows: number
}

export type LinkSpec = { label: string; href: string; external: boolean }

export type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'code'; lines: string[] }
  | { kind: 'embed'; embed: EmbedSpec }
  | { kind: 'link'; link: LinkSpec }

/** Defaults in cells; the cell ratio of a 14px mono grid is roughly 1:2. */
export const DEFAULT_VIDEO = { cols: 46, rows: 13 }
export const DEFAULT_IMAGE = { cols: 40, rows: 12 }

export function isVideoSrc(src: string): boolean {
  return Boolean(YOUTUBE_RE.test(src) || VIMEO_RE.test(src))
}

/** Turn a link target into the URL an embed should load. */
export function embedSrcFor(src: string): string {
  const youtube = YOUTUBE_RE.exec(src)?.[1]
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube}`
  const vimeo = VIMEO_RE.exec(src)?.[1]
  if (vimeo) return `https://player.vimeo.com/video/${vimeo}`
  return src
}

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** `"40x12"` sets the box in cells; anything else keeps the default. */
function hintCells(hint: string | undefined, fallback: { cols: number; rows: number }) {
  const match = /^(\d+)x(\d+)$/.exec(hint?.trim() ?? '')
  if (!match) return fallback
  return { cols: Number(match[1]), rows: Number(match[2]) }
}

function imageBlock(alt: string, src: string, hint?: string): Block {
  const { cols, rows } = hintCells(hint, DEFAULT_IMAGE)
  return {
    kind: 'embed',
    embed: { src, title: alt || 'Image', kind: 'image', cols, rows },
  }
}

function videoBlock(label: string, src: string, hint?: string): Block {
  const { cols, rows } = hintCells(hint, DEFAULT_VIDEO)
  return {
    kind: 'embed',
    embed: { src: embedSrcFor(src), title: label, kind: 'video', cols, rows },
  }
}

/** Replace `[a](b)` / `![a](b)` inside a line with readable text. */
export function inlineToText(line: string): string {
  return line
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_all, alt: string) => `${alt || 'image'}`)
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
      (_all, label: string, href: string) =>
        href.startsWith('/') ? label : `${label} → ${hostOf(href)}`,
    )
}

/** One `|`-free markdown document to blocks. */
export function parseMarkdown(md: string): Block[] {
  const blocks: Block[] = []
  let paragraph: string[] = []
  let list: { ordered: boolean; items: string[] } | null = null
  let quote: string[] = []
  let code: string[] | null = null

  const flushParagraph = () => {
    if (paragraph.length === 0) return
    blocks.push({ kind: 'paragraph', text: paragraph.join(' ') })
    paragraph = []
  }
  const flushList = () => {
    if (!list) return
    blocks.push({ kind: 'list', ordered: list.ordered, items: list.items })
    list = null
  }
  const flushQuote = () => {
    if (quote.length === 0) return
    blocks.push({ kind: 'quote', text: quote.join(' ') })
    quote = []
  }
  const flushAll = () => {
    flushParagraph()
    flushList()
    flushQuote()
  }

  for (const raw of md.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trimEnd()

    if (/^\s*```/.test(line)) {
      if (code) {
        blocks.push({ kind: 'code', lines: code })
        code = null
      } else {
        flushAll()
        code = []
      }
      continue
    }
    if (code) {
      code.push(raw.replace(/\t/g, '  '))
      continue
    }

    if (!line.trim()) {
      flushAll()
      continue
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line)
    if (heading) {
      flushAll()
      blocks.push({ kind: 'heading', level: heading[1].length, text: heading[2].trim() })
      continue
    }

    const quoted = /^>\s?(.*)$/.exec(line)
    if (quoted) {
      flushParagraph()
      flushList()
      quote.push(quoted[1].trim())
      continue
    }

    const item = /^\s*(?:([-*+])|(\d+)[.)])\s+(.*)$/.exec(line)
    if (item) {
      flushParagraph()
      flushQuote()
      const ordered = Boolean(item[2])
      if (!list || list.ordered !== ordered) {
        flushList()
        list = { ordered, items: [] }
      }
      list.items.push(ordered ? `${item[2]}. ${item[3].trim()}` : `· ${item[3].trim()}`)
      continue
    }
    // Indented continuation of the previous list item.
    if (list && /^\s{2,}\S/.test(line)) {
      list.items[list.items.length - 1] += ` ${line.trim()}`
      continue
    }

    const figure = /^\s*!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+"([^"]*)")?\s*\)\s*$/.exec(line)
    if (figure) {
      flushAll()
      blocks.push(imageBlock(figure[1], figure[2], figure[3]))
      continue
    }

    const solo = /^\[([^\]]+)\]\(\s*([^)\s]+)(?:\s+"([^"]*)")?\s*\)\s*$/.exec(line)
    if (solo) {
      flushAll()
      const [, label, src, hint] = solo
      if (isVideoSrc(src)) blocks.push(videoBlock(label, src, hint))
      else if (IMAGE_RE.test(src)) blocks.push(imageBlock(label, src, hint))
      else
        blocks.push({
          kind: 'link',
          link: { label, href: src, external: !src.startsWith('/') },
        })
      continue
    }

    flushList()
    flushQuote()
    paragraph.push(inlineToText(line.trim()))
  }

  flushAll()
  if (code) blocks.push({ kind: 'code', lines: code })
  return blocks
}

/** Greedy word wrap, matching what `GridText` will paint for the same width. */
export function wrapLines(text: string, cols: number): string[] {
  if (cols <= 0) return ['']
  const lines: string[] = []
  for (const sentence of text.split('\n')) {
    let current = ''
    for (const word of sentence.split(/\s+/).filter(Boolean)) {
      const next = current ? `${current} ${word}` : word
      if (Array.from(next).length <= cols) {
        current = next
        continue
      }
      if (current) lines.push(current)
      // A single word longer than the column gets clipped with a marker.
      const chars = Array.from(word)
      current = chars.length > cols ? `${chars.slice(0, cols - 1).join('')}›` : word
    }
    lines.push(current)
  }
  return lines.length > 0 ? lines : ['']
}
