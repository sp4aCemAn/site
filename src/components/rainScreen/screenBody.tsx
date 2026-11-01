import MarkdownFlow from '@/components/text/markdownFlow'
import type { ScreenContent } from '@/data/siteConfig'

/**
 * The content region shared by the plain screens: one markdown flow, painted
 * down the grid from `top`. Embeds and links inside it become real regions.
 */
export default function ScreenBody({
  screen,
  prefix,
  top = 17,
}: {
  screen: ScreenContent
  prefix: string
  top?: number
}) {
  return <MarkdownFlow id={`${prefix}-body`} content={screen.blurb} top={top} />
}
