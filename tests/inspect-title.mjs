// Why is the screen-title run dim? Finds the painted row containing the title
// and reports the real classes/opacity on it.
//   node tests/inspect-title.mjs [url] [viewportWidth]
import puppeteer from 'puppeteer-core'

const url = process.argv[2] ?? 'http://localhost:3000/'
const width = Number(process.argv[3] ?? 390)

const b = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
})
const p = await b.newPage()
p.on('console', (m) => {
  const t = m.text()
  if (t.includes('[dbg]')) console.log('PAGE:', t)
})
await p.setViewport({ width, height: 844, deviceScaleFactor: 1 })
await p.goto(url, { waitUntil: 'networkidle0' })
await p.waitForFunction(() => [...document.querySelectorAll('[style*="font-family"] > div')].some((d) => d.textContent.includes('SPACEMAN')), { timeout: 30000 }).catch(() => {})
const info = await p.evaluate(() => {
  const host = document.querySelector('[style*="font-family"]')
  const rows = [...host.children]
  const i = rows.findIndex((d) => d.textContent.includes('SPACEMAN'))
  if (i < 0) return { found: false, rowCount: rows.length }
  const row = rows[i]
  const spans = [...row.children].map((s) => ({
    cls: s.className,
    opacity: getComputedStyle(s).opacity,
    text: s.textContent.slice(0, 30),
  }))
  return { found: true, rowIndex: i, spans }
})
console.log(JSON.stringify(info, null, 1))
await b.close()
