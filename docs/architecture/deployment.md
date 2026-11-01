# Deployment

`next.config.ts` sets `output: 'export'`, so every deploy target is a static tree — there is no
Node server in production and no Server Actions or route handlers to host.

## 1. Docker (self-hosting)
Three stages in `Dockerfile`: `dependencies` → `builder` (`npm run build`, emitting `out/`) →
`runner` (nginx serving `out/` on **8080**, config in `nginx.conf`).

```bash
docker build -t text-screen .
docker run --rm -p 8080:8080 text-screen
```

`docker-compose.yaml` is the **dev** service only (`npm run dev`, port 3000) and mounts
`node_modules`/`.next` as anonymous volumes. After dependency or CSS changes, recreate them:

```bash
make down   # docker compose down -v
make run    # docker compose up
```

## 2. GitHub Pages
`npm run build` produces `out/`. Publish it with the Pages action, and set
`NEXT_PUBLIC_BASE_PATH=/<repo>` at build time so `/image3.jpg`-style asset paths and
`getPublicPath()` resolve under the project subdirectory. `trailingSlash: true` means URLs end
in `/` — which is what `TextButton` normalizes internal hrefs to.

## 3. Vercel or any static host
Point it at `out/` (or let the framework preset run the same build). Dynamic features are
unavailable by design; the only runtime dependency is the browser.

## Not searchable
`out/robots.txt` disallows every path and every page carries
`<meta name="robots" content="noindex, nofollow">` (set once in
`src/app/layout.tsx`). `out/sitemap.xml` is still generated for bookkeeping, but
`robots.txt` deliberately does not advertise it.

## Environment variables
- `NEXT_PUBLIC_BASE_PATH` — subdirectory the export is served from (GitHub Pages
  project sites need `/<repo>`, and it is also what the sitemap URLs are built from).
- `NEXT_PUBLIC_SITE_URL` — origin for `sitemap.xml` and `metadataBase`.
Nothing else is required, and no secrets belong in this project: `next.config.ts` sets
`images.unoptimized` because the export cannot use the Next image optimizer.
