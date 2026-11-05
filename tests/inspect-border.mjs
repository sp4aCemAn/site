// Border-bleed probe: looks for rain glyphs on the frame ring.
// Middle rows must start/end with the frame's "|"; top/bottom rows are "+--+".
// A "·" or "~" on those cells — or a "|" appearing inside a +- row — is bleed.
// Runs a static check, then a resize check (suspect: drops keep stale columns
// when the window narrows, and the ring is not part of the blocked mask).
//   node tests/inspect-border.mjs [url]
import puppeteer from 'puppeteer-core'

const url = process.argv[2] ?? 'http://localhost:3000/'

const probe = () => {
  // Row divs only: the host also contains real invisible controls (button/a).
  const host = document.querySelector('[style*="font-family"]')
  const rows = [...host.querySelectorAll(':scope > div')].map((d) => d.textContent)
  const cols = rows[0] ? rows[0].length : 0
  const rain = /[|·~]/g
  let ringBleed = 0
  let marginBleed = 0
  let badFrameRows = 0
  rows.forEach((line, r) => {
    if (r === 0 || r === rows.length - 1) {
      const inner = line.slice(1, cols - 1)
      if (/[+]/.test(inner) || rain.test(inner)) badFrameRows++
      rain.lastIndex = 0
      return
    }
    const left = line.slice(0, 2)
    const right = line.slice(cols - 2)
    rain.lastIndex = 0
    if (rain.test(left.replace(/^\|/, ''))) ringBleed++
    rain.lastIndex = 0
    if (rain.test(right.replace(/\|$/, ''))) ringBleed++
    rain.lastIndex = 0
    if (left[1] === '|' || left[1] === '·' || right[0] === '|' || right[0] === '·') marginBleed++
  })
  let frameIntegrity = 0
  rows.forEach((line, r) => {
    if (r === 0 || r === rows.length - 1) return
    if (line[0] !== '|' || (cols > 0 && line[cols - 1] !== '|')) frameIntegrity++
  })
  return { cols, rows: rows.length, ringBleed, marginBleed, badFrameRows, frameIntegrity }
}

const b = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
})
const p = await b.newPage()
await p.setViewport({ width: 390, height: 844 })
await p.goto(url, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3000))
console.log('static 390px :', JSON.stringify(await p.evaluate(probe)))

await p.setViewport({ width: 300, height: 844 })
await new Promise((r) => setTimeout(r, 800))
console.log('after resize :', JSON.stringify(await p.evaluate(probe)))
await new Promise((r) => setTimeout(r, 2500))
console.log('2.5s later   :', JSON.stringify(await p.evaluate(probe)))
await p.screenshot({ path: '/tmp/border-after-resize.png', clip: { x: 0, y: 0, width: 300, height: 500 } })
await b.close()
