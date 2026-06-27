# SK26 — South Korea 2026 trip site

Static single-page site for the July–August 2026 trip. **Lit** web components + **TypeScript** + hand-written semantic **CSS**. No frameworks. Built per [`plan.md`](./plan.md); trip data lives in [`Itinerary.md`](./Itinerary.md) and is ported into `src/data/`.

## Tabs
- **Home** (홈) — landing page: "South Korea 2026 · For Thendral and Tevlen", intro and route.
- **Itinerary** (일정) — full day-by-day plan with ₩/R costs and Google + Kakao map links.
- **Calendar** (달력) — July/August grids with a live **"right now / up next"** banner.
- **Cuisine** (음식) — Korean food bucket-list (tick things off; saved on your device) + Hongdae bar crawl.
- **Photos** (사진) — shot ideas, defaulting to your current city.
- **Tips** (꿀팁) — global + per-city things to look out for.
- **Clocks** (시계) — live world clocks for South Africa, Dubai and South Korea.

The itinerary covers the full routing including the international Emirates legs (JNB↔DXB↔ICN) with check-in times.

The background is animated **only on a `<canvas>`** (drifting petals tinted per city: Seoul blossom-pink / Jeju camellia-red / Busan ocean-teal). It pauses when the tab is hidden and is static under `prefers-reduced-motion`. Auto light/dark via `prefers-color-scheme`.

## Develop
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && no-div guard && vite build  → dist/
npm run preview    # serve the built dist/
```

### Preview a moment mid-trip
Today is before the trip, so the banner shows a countdown. To preview live behaviour, pass a Seoul-time instant:
```
http://localhost:5173/?now=2026-07-22T14:00:00+09:00#/calendar
```

## Constraints (enforced)
- **No `<div>` / `<span>`** — `npm run guard` fails the build if any appear (semantic HTML only: `<section>`, `<article>`, `<table>`, `<dl>`, `<details>`, `<time>`, `<data>`, …).
- Only runtime dependency is `lit`. `tsc` runs in `strict` mode.

## Deploy — GitHub Pages → `sk266.tevlen.co.za`
1. Create a GitHub repo and push this folder (`git init && git add . && git commit && git push`).
2. Repo **Settings → Pages → Source = GitHub Actions** (the workflow in `.github/workflows/deploy.yml` builds and deploys on push to `main`).
3. Set the custom domain to `sk266.tevlen.co.za` and tick **Enforce HTTPS**.
4. DNS (tevlen.co.za): `CNAME  sk266 → <github-username>.github.io.`
   `public/CNAME` already pins the domain so it survives each deploy.

Routing is hash-based, so no SPA rewrite rules are needed.

## Add your own photos
Drop images into `public/inspo/<city>/` matching the filenames in `src/data/inspiration.ts`
(e.g. `public/inspo/seoul/bukchon.jpg`). Until then a placeholder is shown.
