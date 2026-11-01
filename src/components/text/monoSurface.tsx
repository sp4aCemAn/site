'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { Cell, Metrics } from '@/components/text/monoGrid'

export type RegionState = 'idle' | 'hover' | 'focus' | 'press'

export type Rect = {
  col: number
  row: number
  cols: number
  rows: number
}

export type Region = {
  id: string
  rect: Rect
  /** Cells for one state; row 0 of the result is the rect's top row. */
  draw: (state: RegionState) => Cell[][]
  /**
   * Rows this region needs measured from the top of the screen. The surface
   * grows its canvas to the largest reservation, so content taller than the
   * window scrolls instead of disappearing.
   */
  reserve?: number
}

export type MonoSurface = {
  metrics: Metrics
  registerRegion: (region: Region) => () => void
  setActive: (id: string, state: RegionState) => void
  activeId: string | null
  activeState: RegionState
  /** Repaint without advancing the simulation (hover after a burst settled). */
  repaint: () => void
  /** Whether the simulation is currently falling. */
  raining: boolean
  toggleRain: () => void
  /**
   * Rows a bottom-anchored group needs up from the bottom edge. The canvas adds
   * the largest footprint to every top reservation, so flowing content never
   * runs into the controls.
   */
  reserveFooter: (id: string, rows: number) => void
}

const MonoSurfaceContext = createContext<MonoSurface | null>(null)

export function MonoSurfaceProvider({
  value,
  children,
}: {
  value: MonoSurface
  children: ReactNode
}) {
  return (
    <MonoSurfaceContext.Provider value={value}>
      {children}
    </MonoSurfaceContext.Provider>
  )
}

export function useMonoSurface(): MonoSurface {
  const surface = useContext(MonoSurfaceContext)
  if (!surface) {
    throw new Error('useMonoSurface must be used inside a <RainScreen> text surface')
  }
  return surface
}

/**
 * Pack labels into centered lines of `gap`-spaced slots, wrapping when a line
 * would no longer fit between the frame edges. Returns one array per line.
 */
export function layoutLines(
  labels: string[],
  cols: number,
  gap = 3,
  minCol = 1,
): { index: number; col: number; cols: number }[][] {
  if (cols <= 0) return []
  const groups: number[][] = [[]]
  let used = 0
  labels.forEach((label, index) => {
    const need = label.length + (groups[groups.length - 1].length ? gap : 0)
    if (used + need > cols - minCol * 2 && groups[groups.length - 1].length) {
      groups.push([index])
      used = label.length
    } else {
      groups[groups.length - 1].push(index)
      used += need
    }
  })

  return groups.map((group) => {
    const total =
      group.reduce((sum, index) => sum + labels[index].length, 0) + gap * (group.length - 1)
    let col = Math.max(minCol, Math.floor((cols - total) / 2))
    return group.map((index) => {
      const slot = { index, col, cols: labels[index].length }
      col += labels[index].length + gap
      return slot
    })
  })
}

/** Stamp region cells over the grid; the region owns every cell it covers. */
export function stampRegions(
  grid: Cell[][],
  regions: Region[],
  stateOf: (region: Region) => RegionState,
) {
  for (const region of regions) {
    const cells = region.draw(stateOf(region))
    for (let r = 0; r < cells.length; r++) {
      const target = grid[region.rect.row + r]
      if (!target) continue
      for (let c = 0; c < cells[r].length; c++) {
        if (region.rect.col + c < 0 || region.rect.col + c >= target.length) continue
        target[region.rect.col + c] = cells[r][c]
      }
    }
  }
}
