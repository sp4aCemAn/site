// measure painted-screen cost under CPU throttling (a stand-in for slower boxes)
// npm install --no-save puppeteer-core   (dev-only; not part of the site)
//   node scripts/perf.mjs http://localhost:3470/ 20
import puppeteer from 'puppeteer-core'

const url = process.argv[2] ?? 'http://localhost:3470/'
const throttle = Number(process.argv[3] ?? 6)
const b = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
})
const p = await b.newPage()
const cdp = await p.createCDPSession()
await p.setViewport({ width: 1200, height: 800 })

await p.goto(url, { waitUntil: 'load', timeout: 120000 })
await p.waitForFunction(
  () => {
    const host = document.querySelector('div[style*="ui-monospace"]')
    return !!host && host.children.length > 5
  },
  { timeout: 60000 },
)
// throttle only once loaded, so the measurement is app work, not page load
await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle })

const metrics = await p.evaluate(
  () =>
    new Promise((resolve) => {
      const host = document.querySelector('div[style*="ui-monospace"]')
      const stamps = []
      const long = []
      let longMs = 0
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) {
          long.push(Math.round(e.duration))
          longMs += e.duration
        }
      }).observe({ entryTypes: ['longtask'] })
      const mo = new MutationObserver(() => stamps.push(performance.now()))
      mo.observe(host, { subtree: true, childList: true, characterData: true })
      setTimeout(() => {
        mo.disconnect()
        const gaps = stamps.slice(1).map((t, i) => t - stamps[i]).sort((a, z) => a - z)
        resolve({
          rows: host.children.length,
          spans: host.querySelectorAll('span').length,
          mutations: stamps.length,
          medianFrameMs: gaps.length ? Number(gaps[Math.floor(gaps.length / 2)].toFixed(1)) : null,
          p95FrameMs: gaps.length ? Number(gaps[Math.floor(gaps.length * 0.95)].toFixed(1)) : null,
          longTasks: long.length,
          longTaskMs: Math.round(longMs),
        })
      }, 4000)
    }),
)
console.log(`throttle ${throttle}x`, JSON.stringify(metrics))
await b.close()
