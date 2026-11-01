'use client'

import { useEffect } from 'react'
import { useMonoSurface, type MonoSurface, type Region } from '@/components/text/monoSurface'

/**
 * Register a region of the character grid for as long as it is mounted and the
 * screen has been measured. Pass `null` to opt out (e.g. a block too wide for
 * the screen) — the hook unregisters whatever was registered before.
 */
export function useRegion(region: Region | null): MonoSurface {
  const surface = useMonoSurface()
  const { metrics, registerRegion } = surface

  useEffect(() => {
    if (!region || metrics.cols <= 0 || metrics.rows <= 0) return
    return registerRegion(region)
  }, [region, registerRegion, metrics.cols, metrics.rows])

  return surface
}
