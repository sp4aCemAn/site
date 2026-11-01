'use client'

import type { ReactNode } from 'react'
import BigText, { pickBigFont, type BigFont } from '@/components/text/bigText'
import GridText from '@/components/text/gridText'
import { useMonoSurface } from '@/components/text/monoSurface'
import RainScreen from '@/components/rainScreen/rainScreen'
import ScreenControls from '@/components/rainScreen/screenControls'
import { gothic } from '@/data/fonts/gothic'
import { site, socials, type NavLink } from '@/data/siteConfig'

/** Social links become an extra row of buttons when they are configured. */
function socialLinks(): NavLink[] {
  const entries: [string, string | undefined][] = [
    ['Email', socials.email ? `mailto:${socials.email}` : undefined],
    ['GitHub', socials.githubUrl],
    ['Twitter', socials.twitterUrl],
    ['LinkedIn', socials.linkedinUrl],
    ['Instagram', socials.instagramUrl],
    ['Bluesky', socials.blueskyUrl],
    ['Facebook', socials.facebookUrl],
    ['TikTok', socials.tiktokUrl],
  ]
  return entries
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([label, href]) => ({ label, href }))
}

/** Paints the screen title in the first glyph font that fits the screen. */
function ScreenTitle({ title, fonts }: { title: string; fonts: BigFont[] }) {
  const { metrics } = useMonoSurface()
  const font = pickBigFont(fonts, title, metrics.cols, { gap: 1, lower: true, pad: 2 })

  if (font) {
    return (
      <BigText font={font} text={title} align="center" row={3} gap={1} lower border pad={2} />
    )
  }
  if (metrics.cols <= 0) return null
  // No glyph font fits: plain bold text keeps the title readable.
  return <GridText id="screen-title" text={title.toUpperCase()} row={4} bold cols={Math.max(title.length, 12)} />
}

export interface TextScreenProps {
  /** Painted as big glyphs at the top of the screen. */
  title: string
  /** Glyph fonts, largest first; the first that fits is painted. */
  fonts?: BigFont[]
  /** Grid regions belonging to this screen: GridText, GridEmbed, … */
  children?: ReactNode
  /** Draw the `+-+` frame around the screen. */
  frame?: boolean
  className?: string
}

/**
 * One full-viewport text screen: rain in a character grid, a big glyph title,
 * whatever regions the page adds, and the shared `MENU` / `RAIN` controls.
 */
export default function TextScreen({
  title,
  fonts = [gothic],
  children,
  frame = true,
  className = '',
}: TextScreenProps) {
  return (
    <section
      aria-label={`${site.name} — ${title}`}
      // min-h-screen, not h-screen: the surface grows past one windowful when
      // the page's regions need more rows, and the document scrolls.
      className={`relative min-h-screen w-full overflow-hidden bg-black text-white ${className}`}
    >
      <RainScreen border={frame}>
        <ScreenTitle title={title} fonts={fonts} />
        {children}
        <ScreenControls nav={site.navLinks} links={socialLinks()} />
      </RainScreen>
    </section>
  )
}
