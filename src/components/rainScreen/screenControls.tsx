'use client'

import { useEffect, useState } from 'react'
import TextButton from '@/components/text/textButton'
import { layoutLines, useMonoSurface } from '@/components/text/monoSurface'
import type { NavLink } from '@/data/siteConfig'

/** One blank column of margin between a label and its `║ ║` box. */
const PAD = 2
/** Box height (3 rows) plus a blank row, for wrapped lines of links. */
const STRIDE = 4
const BOX_ROWS = 3
const GAP = PAD * 2 + 2

/** One line of link buttons, `baseRow` cells up from the bottom edge. */
function LinkLine({
  links,
  labels,
  slots,
  baseRow,
}: {
  links: NavLink[]
  labels: string[]
  slots: { index: number; col: number }[]
  baseRow: number
}) {
  return (
    <>
      {slots.map((slot) => {
        const link = links[slot.index]
        return (
          <TextButton
            key={`${baseRow}-${link.href}`}
            id={`row${baseRow}-${link.href}`}
            label={labels[slot.index]}
            href={link.href}
            external={/^https?:\/\//.test(link.href)}
            col={slot.col}
            row={baseRow}
            anchor="bottom"
            pad={PAD}
          />
        )
      })}
    </>
  )
}

/**
 * The controls every screen carries: `MENU` opens and closes the nav and social
 * rows, `RAIN ON` / `RAIN OFF` toggles the simulation. They also reserve the
 * rows they occupy, so flowing content stops above them.
 */
export default function ScreenControls({
  nav,
  links = [],
}: {
  nav: NavLink[]
  links?: NavLink[]
}) {
  const { metrics, raining, toggleRain, reserveFooter } = useMonoSurface()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuLabel = menuOpen ? 'CLOSE' : 'MENU'
  const rainLabel = raining ? 'RAIN ON' : 'RAIN OFF'
  // Keep one cell of clearance from the frame on both sides.
  const rightCol = metrics.cols - 3 - PAD - rainLabel.length

  const navLabels = nav.map((link) => link.label.toUpperCase())
  const linkLabels = links.map((link) => link.label.toUpperCase())
  const navLines = layoutLines(navLabels, metrics.cols, GAP, PAD + 1)
  const linkLines = links.length ? layoutLines(linkLabels, metrics.cols, GAP, PAD + 1) : []
  const navBase = 4
  const linksBase = navBase + navLines.length * STRIDE

  // How far up from the bottom edge the open controls reach.
  const footer = menuOpen
    ? Math.max(
        4,
        navBase + (navLines.length - 1) * STRIDE + BOX_ROWS,
        linksBase + Math.max(0, linkLines.length - 1) * STRIDE + BOX_ROWS,
      )
    : 4
  useEffect(() => {
    reserveFooter('controls', footer)
  }, [reserveFooter, footer])

  return (
    <>
      <TextButton
        id="menu"
        label={menuLabel}
        col={PAD + 2}
        row={1}
        anchor="bottom"
        pad={PAD}
        onClick={() => setMenuOpen((open) => !open)}
      />
      <TextButton
        id="rain"
        label={rainLabel}
        col={rightCol}
        row={1}
        anchor="bottom"
        pad={PAD}
        onClick={toggleRain}
      />
      {menuOpen ? (
        <>
          {navLines.map((slots, lineIndex) => (
            <LinkLine
              key={`nav-${lineIndex}`}
              links={nav}
              labels={navLabels}
              slots={slots}
              baseRow={navBase + lineIndex * STRIDE}
            />
          ))}
          {linkLines.map((slots, lineIndex) => (
            <LinkLine
              key={`links-${lineIndex}`}
              links={links}
              labels={linkLabels}
              slots={slots}
              baseRow={linksBase + lineIndex * STRIDE}
            />
          ))}
        </>
      ) : null}
    </>
  )
}
