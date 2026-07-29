# Production deployment

Circle Clash Ultimate deploys from `main` to the linked Vercel project:

- Production URL: <https://zx-puce.vercel.app>
- Framework preset: Next.js
- Install command: `npm ci`
- Build command: `npm run build`
- Runtime: Vercel CDN plus one Edge route for sanitized client error reports

## Release pipeline

Run the complete local gate before pushing:

```bash
npm run verify
git push
```

`verify` runs lint, strict TypeScript, all tests, the asset budget, the production
build, the bundle budget, and the dependency security audit. Vercel repeats
`npm ci` and `npm run build` from the lockfile.

## Performance budgets

- Landing and `/play` initial JavaScript: at most 500 KB raw / 140 KB gzip each
- Total initial and lazy client JavaScript: at most 2.25 MB raw / 700 KB gzip
- `public/`: at most 12 MB
- One `.glb`: at most 5 MB
- Uncompressed `.wav`, `.gltf`, `.bmp`, and TIFF files fail the build
- Raster images above their budget fail the build; prefer AVIF or WebP

The Three.js experience is a client-only chunk. Post-processing is a second lazy
chunk requested after the browser becomes idle. The development FPS meter is
removed from production rendering.

Use `npm run analyze` to generate private bundle reports under `.next/analyze/`.
Use `/play?profile=1` for a 10-second frame-pacing sample after a 2-second warmup.
The result is logged as `CCU_PERFORMANCE` and stored on the root HTML element as
`data-ccu-profile`.

## Observability

Vercel Web Analytics records page views without custom personal data. Speed
Insights records real-user Core Web Vitals. Both are enabled on the linked
project and mounted once in the root layout.

Client exceptions, rejected promises, App Router errors, and server request
errors are sanitized and written as structured JSON. Find them in Vercel:

1. Open the project’s **Logs** tab.
2. Filter by error level.
3. Search for `client_error` or `server_error`.

No cookies, user IDs, query strings, or form values are included. Error reporting
is fail-safe and never interrupts gameplay.

## SEO and security

Next.js generates the canonical metadata, social preview image, icon, web
manifest, `robots.txt`, and `sitemap.xml`. Override the public origin with
`NEXT_PUBLIC_SITE_URL` when attaching a custom domain.

`vercel.json` adds a content security policy, clickjacking protection, MIME
sniffing protection, a strict referrer policy, and a restrictive browser
permissions policy. Versioned files under `/assets/` receive immutable caching.

## Post-deploy checks

1. Confirm the newest production deployment is **Ready**.
2. Open `/`, `/play`, `/robots.txt`, `/sitemap.xml`, and `/manifest.webmanifest`.
3. Confirm `/play` displays the WebGL scene and the impact button works.
4. Check that security headers are present.
5. Check Analytics and Speed Insights after the first production visits.
