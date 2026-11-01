// snapshot the painted screen (rain off = structure only, rain on = ink count)
// npm install --no-save puppeteer-core
//   node scripts/dump-screen.mjs http://localhost:3470/ /tmp/screen.txt
import puppeteer from 'puppeteer-core'
import { writeFileSync } from 'node:fs'

const [url, out] = [process.argv[2] ?? 'http://localhost:3470/', process.argv[3] ?? 'dump.txt']
const b = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
})
const p = await b.newPage()
await p.setViewport({ width: 1200, height: 800 })
await p.goto(url, { waitUntil: 'load' })
await p.waitForFunction(() => document.querySelector('button[aria-label^="RAIN"]'), { timeout: 60000 })

const rowsText = () =>
  p.evaluate(() => {
    const host = document.querySelector('div[style*="ui-monospace"]')
    return [...host.children].map((el) => el.textContent).join('\n')
  })

// Rain off: the dump captures only the stable structure (frame, wordmark, boxes).
await p.click('button[aria-label^="RAIN"]')
await new Promise((r) => setTimeout(r, 600))
const text = await rowsText()
writeFileSync(out, text + '\n')

// Rain on: how much ink is falling.
await p.goto(url, { waitUntil: 'load' })
await p.waitForFunction(() => document.querySelector('button[aria-label^="RAIN"]'), { timeout: 60000 })
await new Promise((r) => setTimeout(r, 1500))
const ink = await p.evaluate(() => {
  const host = document.querySelector('div[style*="ui-monospace"]')
  const rows = [...host.children]
  const joined = rows.map((el) => el.textContent).join('')
  return {
    rows: rows.length,
    spans: host.querySelectorAll('span').length,
    classes: new Set([...host.querySelectorAll('span')].map((s) => s.className.trim())).size,
    ink: (joined.match(/[|·~]/g) || []).length,
  }
})
console.log(out, JSON.stringify(ink))
await b.close()
