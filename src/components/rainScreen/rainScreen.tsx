'use client'

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {
  GRID_FONT_VAR,
  MONO,
  emptyRow,
  useMonoMetrics,
  useViewportRows,
  type Cell,
  type Metrics,
} from '@/components/text/monoGrid'
import {
  MonoSurfaceProvider,
  stampRegions,
  type MonoSurface,
  type Region,
  type RegionState,
} from '@/components/text/monoSurface'
import { RainGrid, type Run } from '@/components/rainScreen/rainGrid'

type Active = { id: string | null; state: RegionState }

type Drop = {
  col: number
  row: number
  length: number
  speed: number
  opacity: number
  dot: boolean
}

export interface RainScreenProps {
  fontSize?: number
  lineHeightRatio?: number
  /** Milliseconds between terminal frames. */
  frameMs?: number
  /** Chance per column per frame that a new drop spawns (loop mode only). */
  density?: number
  /** `loop` rains forever; `burst` rains one wave and then settles. */
  mode?: 'loop' | 'burst'
  /** Paint a `+-+ | +-+` text frame on the outer ring; rain stays inside it. */
  border?: boolean
  className?: string
  /** Text controls that live inside this character grid. */
  children?: ReactNode
}

function makeDrop(col: number, rows: number, forcedDot?: boolean): Drop {
  const dot = forcedDot ?? Math.random() < 0.2
  return {
    col,
    row: dot ? -(Math.random() * rows * 2) : -(1 + Math.floor(Math.random() * 6)),
    length: dot ? 1 : 2 + Math.floor(Math.random() * 5),
    speed: dot ? 0.4 + Math.random() * 0.35 : 0.8 + Math.random() * 1.3,
    // Wide opacity range: near drops bright, far drops barely there.
    opacity: dot ? 0.15 + Math.random() * 0.2 : 0.3 + Math.random() * 0.68,
    dot,
  }
}

/** One painted line. Memoized: an unchanged run array means an unchanged row. */
const RainRow = memo(function RainRow({
  runs,
  style,
}: {
  runs: Run[]
  style: CSSProperties
}) {
  return (
    <div className="whitespace-pre" style={style}>
      {runs.map((run, j) => (
        <span key={j} className={run.cls}>
          {run.text}
        </span>
      ))}
    </div>
  )
})

/**
 * Rain on/off is the one piece of visitor state worth keeping, and a static
 * export has no server to read a cookie — so it lives in `localStorage`, which
 * is per-origin and therefore survives moving between screens.
 */
const RAIN_KEY = 'textscreen.rain'

function readRain(): boolean {
  try {
    return window.localStorage.getItem(RAIN_KEY) !== 'off'
  } catch {
    return true // private mode or storage disabled: just default to raining
  }
}

function writeRain(on: boolean) {
  try {
    window.localStorage.setItem(RAIN_KEY, on ? 'on' : 'off')
  } catch {
    // the toggle still works for this page
  }
}

export default function RainScreen({
  fontSize = 14,
  lineHeightRatio = 1.2,
  frameMs = 80,
  density = 0.05,
  mode = 'loop',
  border = false,
  className = '',
  children,
}: RainScreenProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const dropsRef = useRef<Drop[]>([])
  const puddlesRef = useRef<Map<number, number>>(new Map())
  const regionsRef = useRef<Region[]>([])
  const gridRef = useRef(new RainGrid())
  const renderRef = useRef<(() => void) | null>(null)
  const baseRef = useRef<(() => void) | null>(null)
  const activeRef = useRef<Active>({ id: null, state: 'idle' })
  const [active, setActive] = useState<Active>({ id: null, state: 'idle' })
  // Guarded like this because the prerendered HTML is produced where there is no
  // `window`; nothing visible depends on `raining` until after measurement, so
  // reading the preference on the first client render cannot mismatch.
  const [raining, setRaining] = useState(() =>
    typeof window === 'undefined' ? true : readRain(),
  )
  const [reserved, setReserved] = useState(0)
  const [footer, setFooter] = useState(0)
  const footersRef = useRef<Map<string, number>>(new Map())
  const [awake, setAwake] = useState({ inTab: true, onScreen: true })
  const [painted, setPainted] = useState<Run[][]>([])

  const metrics = useMonoMetrics(hostRef, fontSize, lineHeightRatio)
  const { cols, charWidth, lineHeight, fontStack, ready } = metrics
  // The canvas is at least a windowful of rows tall, and grows to whatever the
  // regions reserve, so content that does not fit scrolls instead of vanishing.
  const viewportRows = useViewportRows(lineHeight)
  const rows = Math.max(viewportRows, reserved + footer + (border ? 2 : 0))
  const grid = useMemo<Metrics>(
    () => ({ cols, rows, charWidth, lineHeight, fontSize, fontStack }),
    [cols, rows, charWidth, lineHeight, fontSize, fontStack],
  )
  const visible = awake.inTab && awake.onScreen

  const applyReserve = useCallback(() => {
    const next = regionsRef.current.reduce(
      (max, region) => Math.max(max, region.reserve ?? 0),
      0,
    )
    setReserved((current) => (current === next ? current : next))
  }, [])

  const registerRegion = useCallback(
    (region: Region) => {
      regionsRef.current = [
        ...regionsRef.current.filter((r) => r.id !== region.id),
        region,
      ]
      applyReserve()
      baseRef.current?.()
      renderRef.current?.()
      return () => {
        const next = regionsRef.current.filter((r) => r.id !== region.id)
        if (next.length === regionsRef.current.length) return
        regionsRef.current = next
        applyReserve()
        baseRef.current?.()
        renderRef.current?.()
      }
    },
    [applyReserve],
  )

  const handleActive = useCallback((id: string, state: RegionState) => {
    const next: Active = { id: state === 'idle' ? null : id, state }
    if (activeRef.current.id === next.id && activeRef.current.state === next.state) return
    activeRef.current = next
    // A label's cells change with its state, so the base layer is rebuilt
    // before the repaint that follows this state update.
    baseRef.current?.()
    setActive(next)
  }, [])

  const reserveFooter = useCallback((id: string, needed: number) => {
    const footers = footersRef.current
    if ((footers.get(id) ?? 0) === needed) return
    footers.set(id, needed)
    setFooter(Math.max(0, ...footers.values()))
  }, [])

  const repaint = useCallback(() => renderRef.current?.(), [])

  const toggleRain = useCallback(() => setRaining((on) => !on), [])

  // Persist the choice, and follow it in other tabs of the same origin.
  useEffect(() => {
    writeRain(raining)
    const onStorage = (event: StorageEvent) => {
      if (event.key === RAIN_KEY) setRaining(event.newValue !== 'off')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [raining])

  const surface = useMemo<MonoSurface>(
    () => ({
      metrics: grid,
      registerRegion,
      setActive: handleActive,
      activeId: active.id,
      activeState: active.state,
      repaint,
      raining,
      toggleRain,
      reserveFooter,
    }),
    [grid, registerRegion, handleActive, active, repaint, raining, toggleRain, reserveFooter],
  )

  // Never paint what nobody is looking at: a background screen in a hidden tab
  // or scrolled out of view costs nothing.
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const onVisibility = () =>
      setAwake((a) => ({ ...a, inTab: !document.hidden }))
    document.addEventListener('visibilitychange', onVisibility)
    const io = new IntersectionObserver(([entry]) =>
      setAwake((a) => ({ ...a, onScreen: entry.isIntersecting })),
    )
    io.observe(host)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      io.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    const g = gridRef.current
    g.resize(cols, rows)

    // The frame is text like everything else, so it lives inside the grid:
    // rain stays a full cell away from the ring, never painting on or beside it.
    const framed = border && cols >= 7 && rows >= 7
    const innerLeft = framed ? 2 : 0
    const innerRight = framed ? cols - 1 : cols - 1
    const innerTop = framed ? 1 : 0
    const innerBottom = framed ? rows - 1 : rows

    const rebuildBase = () => {
      const cells: Cell[][] = Array.from({ length: rows }, () => emptyRow(cols))
      if (framed) {
        for (let col = 1; col < cols - 1; col++) {
          cells[0][col] = { glyph: '-', opacity: 1 }
          cells[rows - 1][col] = { glyph: '-', opacity: 1 }
        }
        for (let row = 1; row < rows - 1; row++) {
          cells[row][0] = { glyph: '|', opacity: 1 }
          cells[row][cols - 1] = { glyph: '|', opacity: 1 }
        }
        cells[0][0] = { glyph: '+', opacity: 1 }
        cells[0][cols - 1] = { glyph: '+', opacity: 1 }
        cells[rows - 1][0] = { glyph: '+', opacity: 1 }
        cells[rows - 1][cols - 1] = { glyph: '+', opacity: 1 }
      }
      // Regions own every cell they cover, blank field included, and the rain
      // cannot paint there (the grid keeps a blocked mask). The ring itself is
      // masked too, so a stale drop from a resize can never overwrite frame ink.
      stampRegions(cells, regionsRef.current, (region) =>
        activeRef.current.id === region.id ? activeRef.current.state : 'idle',
      )
      const mask: Region['rect'][] = regionsRef.current.map((region) => region.rect)
      if (framed) {
        mask.push(
          { col: 0, row: 0, cols, rows: 1 },
          { col: 0, row: rows - 1, cols, rows: 1 },
          { col: 0, row: 0, cols: 1, rows },
          { col: cols - 1, row: 0, cols: 1, rows },
        )
      }
      g.setBase(cells, mask)
    }
    baseRef.current = rebuildBase
    rebuildBase()

    const renderFrame = () => setPainted(g.commit())
    renderRef.current = renderFrame

    if (mode === 'burst' && raining) {
      // One wave: every column may release a drop from above the screen.
      const wave: Drop[] = []
      for (let col = innerLeft; col <= innerRight; col++) {
        if (Math.random() < 0.5) wave.push(makeDrop(col, rows, false))
        else if (Math.random() < 0.2) wave.push(makeDrop(col, rows, true))
      }
      dropsRef.current = wave
      puddlesRef.current = new Map()
    }
    if (!raining) {
      dropsRef.current = []
      puddlesRef.current = new Map()
    }

    // Advances the simulation; returns true once a burst has fully settled.
    const step = () => {
      g.clearInk()
      const drops = dropsRef.current
      for (const drop of drops) drop.row += drop.speed

      if (mode === 'burst') {
        const alive: Drop[] = []
        for (const drop of drops) {
          if (drop.row - drop.length > innerBottom) puddlesRef.current.set(drop.col, 1)
          else alive.push(drop)
        }
        dropsRef.current = alive
        for (const [col, strength] of puddlesRef.current) {
          const nextStrength = strength * 0.82
          if (nextStrength < 0.05) puddlesRef.current.delete(col)
          else puddlesRef.current.set(col, nextStrength)
        }
      } else {
        dropsRef.current = drops.filter(
          (drop) => drop.row - drop.length <= innerBottom + 1,
        )
        for (let col = innerLeft; col <= innerRight; col++) {
          if (Math.random() >= density) continue
          dropsRef.current.push(makeDrop(col, rows))
        }
      }

      for (const drop of dropsRef.current) {
        // Columns survive a window resize; a stale one must not paint into
        // the margin or onto the ring of the narrower grid.
        if (drop.col < innerLeft || drop.col > innerRight) continue
        const tip = Math.floor(drop.row)
        for (let k = 0; k < drop.length; k++) {
          const row = tip - k
          if (row < innerTop) break
          if (row > innerBottom) continue
          // Tail falls off toward the top of the streak, so each drop reads as
          // a receding line instead of a flat bar.
          const fade = drop.dot
            ? drop.opacity
            : drop.opacity * (k === 0 ? 1 : 0.18 + 0.82 * (1 - k / drop.length))
          g.setInk(row, drop.col, drop.dot ? '·' : '|', fade)
        }
      }
      if (mode === 'burst') {
        for (const [col, strength] of puddlesRef.current) {
          if (col < innerLeft || col > innerRight) continue
          g.setInk(innerBottom, col, '~', strength)
        }
      }

      renderFrame()
      return (
        mode === 'burst' &&
        dropsRef.current.length === 0 &&
        puddlesRef.current.size === 0
      )
    }

    // Stopped, or nothing on screen to draw: paint once, run no timer.
    if (!raining || !visible) {
      renderFrame()
      return () => {
        renderRef.current = null
        baseRef.current = null
      }
    }

    let id: ReturnType<typeof setInterval> | null = null
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = () => {
      if (id !== null) clearInterval(id)
      id = null
      if (reduced) return
      id = setInterval(() => {
        if (step() && id !== null) {
          clearInterval(id)
          id = null
        }
      }, frameMs)
    }

    if (!step()) start()

    return () => {
      if (id !== null) clearInterval(id)
      renderRef.current = null
      baseRef.current = null
    }
  }, [grid, ready, cols, rows, density, frameMs, mode, border, raining, visible])

  // A hover or Tab focus must repaint even when nothing is falling.
  useEffect(() => {
    renderRef.current?.()
  }, [active])

  const rowStyle = useMemo<CSSProperties>(
    () => ({ height: lineHeight }),
    [lineHeight],
  )

  return (
    <div
      ref={hostRef}
      // One block the exact size of the grid: rows * lineHeight tall, so the
      // document scrolls when the screen grows past the window.
      className={`relative min-h-[100svh] overflow-hidden bg-black text-white ${className}`}
      style={{
        width: '100%',
        height: rows > 0 ? rows * lineHeight : undefined,
        fontFamily: `var(${GRID_FONT_VAR}, ${MONO})`,
        fontSize,
        lineHeight: `${lineHeight}px`,
        // The screen is a fixed box that repaints itself: keep its layout and
        // paint work from touching the rest of the page.
        contain: 'layout paint',
      }}
    >
      {painted.map((runs, i) => (
        <RainRow key={i} runs={runs} style={rowStyle} />
      ))}
      {ready ? (
        <MonoSurfaceProvider value={surface}>{children}</MonoSurfaceProvider>
      ) : null}
    </div>
  )
}
