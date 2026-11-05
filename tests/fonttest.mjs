// Font alignment probe: screenshots the home screen at desktop and mobile
// sizes and audits the per-glyph canvas advance ratio (1.000 = every grid
// glyph shares the "0" cell width; anything else = that glyph falls back).
//   npm install --no-save puppeteer-core
//   node tests/fonttest.mjs [url]   (default http://localhost:3000/)
// Requires Chrome; shots land in /tmp/fonttest-*.png.
import puppeteer from 'puppeteer-core'

const url = process.argv[2] ?? 'http://localhost:3000/'
const GLYPHS = ['0', '═', '║', '╔', '╗', '╚', '╝', '│', '·', '›', '→', '~', '|', '+', '-', 'A', 'z']

const b = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
})

for (const [name, width, height, dsf] of [['desktop', 1440, 900, 1], ['mobile', 390, 844, 3]]) {
  const p = await b.newPage()
  await p.setViewport({ width, height, deviceScaleFactor: dsf })
  await p.goto(url, { waitUntil: 'networkidle0' })
  await p.waitForFunction(
    () => document.querySelector('[style*="font-family"]')?.children.length > 0,
    { timeout: 30000 },
  ).catch(() => {})
  await new Promise((r) => setTimeout(r, 1200))
  const audit = await p.evaluate((glyphs) => {
    const stack = getComputedStyle(document.body).fontFamily
    const ctx = document.createElement('canvas').getContext('2d')
    ctx.font = `14px ${stack}`
    const zero = ctx.measureText('0').width
    const ratios = Object.fromEntries(glyphs.map((g) => [g, +(ctx.measureText(g).width / zero).toFixed(3)]))
    const loaded = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`)
    const host = document.querySelector('[style*="font-family"]')
    const row0 = host?.children[0]
    return {
      stack,
      loaded,
      charWidth: +zero.toFixed(3),
      ratios,
      rows: host ? host.children.length : 0,
      rowTextWidth: row0 ? row0.scrollWidth : 0,
      hostWidth: host ? host.clientWidth : 0,
      overflow: row0 ? row0.scrollWidth > host.clientWidth : false,
    }
  }, GLYPHS)
  console.log(`--- ${name} (${width}x${height} dsf ${dsf}) ---`)
  console.log(JSON.stringify(audit))
  await p.screenshot({ path: `/tmp/fonttest-${name}.png` })
  await p.close()
}
await b.close()
console.log('shots: /tmp/fonttest-desktop.png /tmp/fonttest-mobile.png')
