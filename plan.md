# Implementation Plan — SK26 Trip Website (`sk266.tevlen.co.za`)

> A small, fast, static single-page site for the July–August 2026 South Korea trip.
> Built with **Lit** web components, **TypeScript**, and hand-written **semantic HTML/CSS**.
> This document is the build spec for the implementing agent. Follow it top to bottom.
> **Source of truth for all trip data:** `./Itinerary.md` (and `./TNT_South_Korea_Itinerary_2026.xlsx`). Port content from there — do not invent dates/prices.

---

## 1. Goals

1. Show the full **itinerary** (Seoul → Jeju → Busan), grouped by day, with times, costs (₩ + R) and Google/Kakao map links.
2. A **calendar** with every itinerary event loaded, that actively tells us **"what we should be doing right now / next."**
3. A **Photo Inspiration** tab that defaults to **our current location** (city derived from today's date).
4. A **Tips / "look out for"** tab (global + per-city practical advice).
5. Clean, minimal, with a tasteful **South Korean theme**. The background is animated **only on a `<canvas>`** and subtly **recolours to the city we're currently in**.

---

## 2. Hard constraints (do not violate)

| # | Rule | How it's enforced |
|---|------|-------------------|
| C1 | **No `<div>` and no `<span>`** anywhere (templates or index.html). | Use semantic elements (see §10). A CI guard greps `src/` and fails on `<div`/`<span` (§13). |
| C2 | **Lit** is the only runtime UI library. No React/Vue/Svelte/Angular/jQuery/Tailwind/Bootstrap. | `package.json` lists exactly one UI dep: `lit`. |
| C3 | **TypeScript** for all logic; `strict: true`. | `tsconfig` strict; build fails on type errors. |
| C4 | Background animation lives **only in a `<canvas>`**. **No CSS-animated background** (no `@keyframes` driving `background`, no animated gradients). | All motion in `<sk-canvas-bg>`. CSS `transition`/`animation` on *foreground UI* (hover, focus) is allowed. |
| C5 | Plain CSS only (Lit `css\`\`` for component styles + one global tokens stylesheet). No preprocessors, no CSS-in-JS libs. | — |
| C6 | Respect `prefers-reduced-motion` (static canvas frame) and `prefers-color-scheme`. | §6, §5. |
| C7 | Fully static output; deployable to a subdomain docroot with no server-side code. | Hash routing → no SPA rewrite rules needed (§13). |

Vite is permitted: it is a **build tool**, not a framework. (Fallback without a bundler is described in §13.4.)

---

## 3. Tech stack & tooling

- **Lit** `^3` — web components + `html`/`css` templating + reactive properties/controllers.
- **TypeScript** `^5` (`strict`, `useDefineForClassFields: false` for Lit decorators, `experimentalDecorators: true`).
- **Vite** `^5` — dev server + bundler. Template: `vanilla-ts`, then add `lit`.
- **Fonts:** **Pretendard** (Latin+Hangul, self-hosted woff2) for body; **Nanum Myeongjo** (serif, Hangul) for display headings. Self-host in `public/fonts/` to avoid third-party calls; `font-display: swap`.
- **No** state library, **no** router library (hand-rolled hash router, ~30 lines), **no** date library (use `Intl` + small helpers).

`package.json` (scripts):
```jsonc
{
  "name": "sk26-site",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "guard": "node scripts/no-div-guard.mjs"
  },
  "dependencies": { "lit": "^3.1.0" },
  "devDependencies": { "typescript": "^5.4.0", "vite": "^5.2.0" }
}
```

`vite.config.ts`:
```ts
import { defineConfig } from 'vite';
export default defineConfig({
  base: '/',                 // site is at the subdomain root
  build: { target: 'es2022', sourcemap: true },
});
```

`tsconfig.json` (essentials):
```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

---

## 4. Information architecture & routing

Four tabs, hash-routed (no server config required):

| Hash | Tab | Component | Hangul label |
|------|-----|-----------|--------------|
| `#/itinerary` (default) | Itinerary | `<sk-itinerary>` | 일정 |
| `#/calendar` | Calendar | `<sk-calendar>` | 달력 |
| `#/inspo` | Photo Inspiration | `<sk-inspiration>` | 사진 |
| `#/tips` | Tips | `<sk-tips>` | 꿀팁 |

- Router parses `location.hash`, defaults unknown → `#/itinerary`.
- The **Now/Next banner** and **current-city badge** live in the persistent `<header>` (visible on every tab).
- Tabs use the **ARIA tabs pattern**: `<nav role="tablist">` with `<a role="tab" aria-selected>` items; the active tab component carries `role="tabpanel"` on its host element, `aria-labelledby` the tab. Implement left/right arrow-key navigation between tabs.

---

## 5. Design system

### Palette (Obangsaek / Taegukgi-derived, restrained)
Define as CSS custom properties on `:root` (they inherit **through** shadow boundaries, so components can use them directly).

```css
/* src/styles/tokens.css  (imported once in index.html via <link>) */
:root {
  /* base — hanji paper + ink */
  --paper: #f7f3ec;
  --paper-raised: #fffdf8;
  --ink: #1b1b1b;
  --ink-soft: #4a4a4a;
  --line: #e3dccd;

  /* Taegukgi accents */
  --taeguk-red: #cd2e3a;
  --taeguk-blue: #0047a0;
  --gold: #b08d3e;

  /* current-city accent (set by <sk-app> on :root, lerped feel via CSS var swap) */
  --city-accent: var(--taeguk-blue);

  /* type scale */
  --font-body: "Pretendard", system-ui, sans-serif;
  --font-display: "Nanum Myeongjo", serif;
  --step--1: 0.833rem; --step-0: 1rem; --step-1: 1.25rem;
  --step-2: 1.563rem; --step-3: 1.953rem; --step-4: 2.441rem;

  /* spacing / radius / shadow */
  --space-1: .25rem; --space-2: .5rem; --space-3: 1rem;
  --space-4: 1.5rem; --space-5: 2.5rem;
  --radius: 10px;
  --shadow: 0 1px 2px rgba(27,27,27,.06), 0 8px 24px rgba(27,27,27,.06);
}

@media (prefers-color-scheme: dark) {
  :root {
    --paper: #14110d; --paper-raised: #1d1913; --ink: #f1ebdd;
    --ink-soft: #c4bba8; --line: #2c2620;
    --shadow: 0 1px 2px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.4);
  }
}
```

### City accent map
```ts
// seoul = palace blue, jeju = camellia red (동백, Jeju's flower), busan = ocean teal
export const CITY_ACCENT: Record<City, string> = {
  seoul: '#0047a0',
  jeju:  '#c2334d',
  busan: '#0f8a8a',
};
```
`<sk-app>` sets `--city-accent` on `:root` whenever the active/selected city changes; the canvas reads the same value to tint petals.

### Typography & feel
- Display headings: `--font-display` (serif), used sparingly; body: `--font-body`.
- Each tab shows a small Hangul label above its English heading (e.g. `<p lang="ko">일정</p>` styled small/gold).
- Generous whitespace, max content width ~`72ch`, single column on mobile, two-column day cards on wide screens (CSS grid on `<ul>`/`<section>`).
- A faint hanji-paper texture is acceptable **only as a static `background-image`** (no animation) — or skip it; the canvas already carries the texture mood.

---

## 6. Canvas background — `<sk-canvas-bg>` (detailed spec)

A single full-viewport `<canvas>` behind all content. **This is the only place animation happens.**

**Markup/placement**
- Host: `position: fixed; inset: 0; z-index: -1; pointer-events: none;` and `aria-hidden="true"`.
- One `<canvas>` child filling the host.

**Lifecycle**
- `connectedCallback`: size canvas to viewport × `devicePixelRatio`; seed particles; start rAF loop.
- `ResizeObserver` on document element → re-size + re-scale (debounced ~100 ms).
- `document` `visibilitychange` → pause/resume rAF when hidden (perf + battery).
- `disconnectedCallback`: cancel rAF, disconnect observers.
- `matchMedia('(prefers-reduced-motion: reduce)')`: if reduced, render **one static frame** and never start the loop.

**Scene (back → front), all low-opacity so foreground text stays readable**
1. **Sky gradient** — soft vertical gradient between `--paper` and a faint tint of `--city-accent` (read via `getComputedStyle`). Repaint per frame (cheap).
2. **Ink mountains** — 2–3 stylised silhouette ridgelines (sine/segment polylines), `globalAlpha ≈ 0.06`, tinted with `--city-accent`. Optional ±6px parallax following `pointermove` (no scroll in an SPA).
3. **Mist** — 2 translucent horizontal bands near the mountain base, drifting horizontally via slow sine; wrap.
4. **Petals** — `PARTICLE_COUNT = clamp(20, 40)` (fewer on small screens / low DPR). Each: `{x,y,size,rot,vrot,vy,sway,swayPhase,alpha}`. Fall slowly, sway sideways (sine), wrap top/bottom and edges. Shape: a simple petal via two `quadraticCurveTo`; colour = current city tint with per-particle alpha 0.15–0.4.

**City tint transition**
- Store `currentTint` and `targetTint` (RGB). On `city` attribute change, set `targetTint`. Each frame `lerp(currentTint, targetTint, 0.02)` → smooth ~1–1.5 s recolour. Same value tints sky, mountains, petals.

**Public API**
```ts
@customElement('sk-canvas-bg')
export class SkCanvasBg extends LitElement {
  @property({ type: String }) city: City | 'none' = 'none';
  // reflect to attribute; on change → set targetTint
}
```

**Performance budget:** ≤ ~2% CPU idle on a laptop; no allocations inside the rAF loop (pre-allocate particle array; reuse objects). Cap DPR at 2.

---

## 7. Data model (TypeScript) & sourcing

Create `src/types.ts`:
```ts
export type City = 'seoul' | 'jeju' | 'busan';

export type EventCategory =
  | 'travel' | 'food' | 'sightseeing' | 'museum'
  | 'nature' | 'show' | 'shopping' | 'relax' | 'sport';

export interface MapLinks { google?: string; kakao?: string; }

export interface Cost {
  krw: number;        // per person; 0 = free
  zar: number;        // converted at R1 ≈ ₩93
  note?: string;      // "Klook price", "free in hanbok", etc.
}

export interface TripEvent {
  id: string;              // stable slug: "2026-07-20-gyeongbokgung"
  city: City;
  date: string;            // "2026-07-20" (Asia/Seoul local date)
  start?: string;          // "10:00"
  end?: string;            // "12:30"
  title: string;
  summary?: string;
  category: EventCategory;
  location?: { name: string; area?: string } & MapLinks;
  cost?: Cost;
  optional?: boolean;      // optional add-on / "if energy holds"
  tags?: string[];
}

export interface CitySegment {
  city: City;
  nameEn: string;
  nameKo: string;          // 서울 / 제주 / 부산
  arrive: string;          // ISO datetime "2026-07-19T18:00:00+09:00"
  depart: string;          // ISO datetime
  hotel?: { name: string; address: string } & MapLinks;
}

export interface PhotoInspiration {
  id: string; city: City;
  title: string;            // "Hanbok in a Bukchon alley"
  spot: string;             // location name
  tip: string;              // composition / best time / settings
  bestTime?: string;        // "golden hour", "blue hour 20:00"
  image?: string;           // /inspo/seoul/bukchon.jpg  (optional)
  credit?: string;
}

export interface Tip {
  id: string;
  scope: City | 'global';
  category: 'money' | 'transport' | 'etiquette' | 'safety' | 'food' | 'connectivity' | 'weather' | 'booking';
  title: string;
  body: string;
}
```

**Sourcing instructions for the agent:**
- `src/data/itinerary.ts` — **port every dated entry** from `Itinerary.md` (Seoul 19–25 Jul, Jeju 25–28, Busan 28 Jul–1 Aug, plus arrival/departure travel rows). Carry over `start`/`end`, `cost.krw`/`cost.zar`, `location.google`/`location.kakao`, and set a sensible `category`. Mark "optional"/"if energy holds" rows `optional: true`.
- `src/data/cities.ts` — the three `CitySegment`s with hotel names/addresses + map links from `Itinerary.md`. Arrival/departure datetimes drive `currentCity()`. Also `export const TRAVELLERS = 2;` (used to show the Jeju car cost per person: ₩60,000/car ÷ 2).
- `src/data/inspiration.ts` and `src/data/tips.ts` — seed with §7.1 / §7.2 below, then expand.

### 7.1 Seed photo inspiration (expand to ~5–6 per city)
- **Seoul:** Gyeongbokgung — hanbok subject framed under Geunjeongjeon eaves, **10:00 guard ceremony** for colour; Bukchon-ro 11-gil — shoot *down* the alley with hanok rooflines converging, early AM (few crowds); Banpo Rainbow Fountain — long exposure from Banpo Hangang Park, **20:00/20:30**; N Seoul Tower — blue-hour skyline + love-locks foreground; Gwangjang Market — tight, candid food-stall steam, fast shutter; Cheonggyecheon — night reflections of city lights on the stream.
- **Jeju:** Seongsan Ilchulbong — wide from the coastal path at first light; Udo — turquoise water at Seobinbaeksa white-sand beach, polariser; Manjanggul — long exposure of lava-tube textures (tripod, high ISO); Jusangjeolli — hexagonal basalt columns with incoming swell; canola/green fields + stone *harubang* statues; Black Pork Street — neon + grill smoke at night.
- **Busan:** Gamcheon — pastel rooftops layered up the hillside from the main viewpoint, mid-afternoon; Haedong Yonggungsa — temple on the rocks with surf, morning side-light; Haeundae Sky Capsule — pastel capsule + sea backdrop; Gwangalli — Gwangan Bridge at blue hour from the beach; Huinnyeoul — white seaside village alleys; The Bay 101 — Marine City skyline reflection on wet pavement at night.

### 7.2 Seed tips (expand)
- **Global:** Get a **T-money** card (metro/bus/some taxis). Install **KakaoMap + Naver Map** (Google Maps directions are limited in Korea) and **Papago**. Cards widely accepted; carry some cash for markets. Late July = hot, humid, **monsoon/typhoon season** → pack a light rain shell; outdoor shows can cancel for weather. Tipping is **not** customary. Emergency: **112** police, **119** fire/ambulance. Pre-book Everland, Haeundae Sky Capsule, the **1 Aug KTX**, and the Jeju rental car.
- **Seoul:** Many national museums are **free**. **Gyeongbokgung closed Tuesdays**; **MMCA / War Memorial / Leeum / Seoul Museum of History closed Mondays**. **Bukchon** is residential — quiet, Mon–Sat 10:00–17:00. Rent **hanbok** → free palace entry.
- **Jeju:** **Rent a car** — buses are slow; ⚠️ **bring an International Driving Permit obtained in South Africa before you fly.** Check the **last Udo return ferry** before crossing. UNESCO sites: Seongsan (closed 1st Mon/mo), Manjanggul (closed 1st Wed/mo) — neither hits your dates.
- **Busan:** **1 Aug flight leaves from Incheon**, not Busan → it's a travel day (KTX→AREX ≈ 3.5–4 h); hotel is by Busan Station (handy). **Gwangalli drone show is Saturday-only** — not on your dates. Confirm the **Lotte Giants** home schedule before banking on the baseball.

---

## 8. Components

All components are Lit elements with `static styles = [sharedStyles, css\`…\`]`. Create `src/styles/shared.ts` exporting a `css` block (resets, type, helpers) imported by every component. **No div/span in any template.**

| Tag | Role | Key props | Semantic root |
|-----|------|-----------|---------------|
| `sk-app` | Root: router, currentCity, sets `--city-accent`, renders layout | — | `<main>`+`<header>`+`<nav>`+`<footer>` |
| `sk-canvas-bg` | Animated background (§6) | `city` | `<canvas>` |
| `sk-now-banner` | "Right now / Up next / countdown / done" | `now?` (override) | `<aside aria-live="polite">` |
| `sk-city-badge` | Current city pill + Hangul | `city` | `<p>` w/ `<data>` |
| `sk-itinerary` | Full itinerary, grouped by city→day | — | `<section role="tabpanel">` |
| `sk-day-card` | One day | `date`, `events` | `<article>` w/ `<header><time>` |
| `sk-event-item` | One event row | `event` | `<article>` |
| `sk-map-links` | Google+Kakao link pair | `google`, `kakao` | `<nav>`/`<ul>` |
| `sk-calendar` | Month grid(s) + selected day + now/next | `now?` | `<section role="tabpanel">` |
| `sk-inspiration` | Photo ideas for current/selected city | `city` | `<section role="tabpanel">` |
| `sk-tips` | Tips, global + per city | `city` | `<section role="tabpanel">` |

**Reference component (sets the semantic + `<data>`/`<time>` pattern — copy this style):**
```ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared.js';
import type { TripEvent } from '../types.js';

@customElement('sk-event-item')
export class SkEventItem extends LitElement {
  static styles = [sharedStyles, css`
    article { display: grid; grid-template-columns: max-content 1fr; gap: var(--space-3);
      padding: var(--space-3); border-left: 3px solid var(--city-accent);
      background: var(--paper-raised); border-radius: var(--radius); box-shadow: var(--shadow); }
    time { font-variant-numeric: tabular-nums; color: var(--ink-soft); }
    h3 { margin: 0; font-size: var(--step-1); }
    data { color: var(--taeguk-red); font-weight: 600; }
    p { margin: var(--space-1) 0 0; color: var(--ink-soft); }
  `];

  @property({ attribute: false }) event!: TripEvent;

  render() {
    const e = this.event;
    return html`
      <article>
        <time datetime=${`${e.date}T${e.start ?? '00:00'}`}>
          ${e.start ?? '—'}${e.end ? html`–${e.end}` : ''}
        </time>
        <article>
          <h3>${e.title}${e.optional ? html` <small>(optional)</small>` : ''}</h3>
          ${e.summary ? html`<p>${e.summary}</p>` : ''}
          ${e.cost ? html`<p>
            <data value=${e.cost.krw}>${e.cost.krw === 0 ? 'Free'
              : `₩${e.cost.krw.toLocaleString()}`}</data>
            ${e.cost.krw ? html` · <data value=${e.cost.zar}>R${e.cost.zar}</data>` : ''}
            ${e.cost.note ? html` <small>${e.cost.note}</small>` : ''}
          </p>` : ''}
          ${e.location?.google || e.location?.kakao
            ? html`<sk-map-links .google=${e.location.google} .kakao=${e.location.kakao}></sk-map-links>`
            : ''}
        </article>
      </article>`;
  }
}
```
> Note how prices use `<data value>` and times use `<time datetime>` — **these replace the spans** you'd normally reach for.

---

## 9. Date/time & "what should we be doing"

`src/lib/dates.ts`:
```ts
// Always reason in Asia/Seoul so the banner is correct from anywhere.
export function seoulNow(override?: string): Date {
  if (override) return new Date(override);          // ?now=2026-07-22T14:00:00+09:00
  return new Date();                                 // compare using +09:00 offsets in data
}

export function currentCity(now: Date, segments: CitySegment[]): City | 'pre' | 'post' { /* … */ }

// Returns the event happening now, else the next upcoming, else null.
export function nowOrNext(now: Date, events: TripEvent[]):
  { state: 'now' | 'next' | 'pre' | 'post'; event?: TripEvent } { /* … */ }

export function daysUntil(now: Date, iso: string): number { /* … */ }
```

`<sk-now-banner>` rendering states:
- **pre** → `"Seoul in N days — 안녕하세요!"`
- **now** → `"Right now: <title> · until <end>"`
- **next** → `"Up next: <title> · <date/time>"`
- **post** → `"여행 끝! Trip complete 🎉"`

**Override for previewing (since today is June 2026):** read `?now=` from the URL in `<sk-app>` and thread it down as the `now` property to the banner and calendar, so the team can scrub to any trip moment. Update every 60 s with a timer when no override is set.

---

## 10. Semantic HTML cheat-sheet (how to avoid `<div>`/`<span>`)

| You'd normally use… | Use instead |
|---|---|
| `<div>` layout box | `<section>`, `<article>`, `<header>`, `<footer>`, `<aside>`, `<nav>`, `<main>`, `<figure>` |
| `<div>` list of things | `<ul>/<li>`, `<ol>/<li>` |
| `<div>` term/value pairs (tips, facts) | `<dl>/<dt>/<dd>` |
| `<div>` collapsible | `<details>/<summary>` |
| `<div>` calendar grid | `<table>/<thead>/<tbody>/<tr>/<th scope>/<td>` |
| `<span>` a time | `<time datetime>` |
| `<span>` a price/number | `<data value>` |
| `<span>` an abbreviation (KRW, ICN) | `<abbr title>` |
| `<span>` emphasis / label | `<strong>`, `<em>`, `<b>`, `<mark>`, `<small>`, `<cite>` |
| `<span>` for an icon | inline `<svg role="img" aria-label>` |

Apply CSS grid/flex **directly** to `<section>`, `<ul>`, `<article>` — layout does not need divs.

---

## 11. Accessibility

- ARIA tabs pattern with arrow-key support; visible focus rings (do not remove outlines).
- Calendar `<table>` with `<caption>`, `<th scope="col">` weekday headers; day cells contain a `<time>`; event chips are `<button>`/`<a>`.
- `<sk-now-banner>` is `aria-live="polite"`.
- Canvas is `aria-hidden`; site is fully usable with the canvas removed.
- Colour contrast ≥ WCAG AA against `--paper`/`--paper-raised` in both schemes.
- All imagery has meaningful `alt`; decorative imagery `alt=""`.
- Honour `prefers-reduced-motion` (static canvas; no UI auto-motion).

---

## 12. File / folder structure
```
.
├─ index.html                  # <link> tokens.css + fonts; mounts <sk-app>; NO div/span
├─ vite.config.ts
├─ tsconfig.json
├─ package.json
├─ scripts/
│  └─ no-div-guard.mjs         # fails build if <div/<span found in src or index.html
├─ .github/workflows/deploy.yml   # GitHub Pages build + deploy (§13.3)
├─ public/
│  ├─ CNAME                    # one line: sk266.tevlen.co.za
│  ├─ fonts/                   # Pretendard, Nanum Myeongjo (woff2)
│  ├─ inspo/
│  │  ├─ _placeholder.svg      # labelled placeholder used until real photos arrive
│  │  └─ {seoul,jeju,busan}/   # drop the team's own photos here later
│  └─ favicon.svg              # taeguk / Korea-themed mark
└─ src/
   ├─ main.ts                  # imports all components, kicks off router
   ├─ types.ts
   ├─ styles/
   │  ├─ tokens.css            # :root custom properties (global)
   │  └─ shared.ts             # exported `css` shared by components
   ├─ lib/
   │  ├─ router.ts             # hash router
   │  └─ dates.ts              # seoulNow, currentCity, nowOrNext, formatters
   ├─ data/
   │  ├─ itinerary.ts          # TripEvent[]  (port from Itinerary.md)
   │  ├─ cities.ts             # CitySegment[]
   │  ├─ inspiration.ts        # PhotoInspiration[]
   │  └─ tips.ts               # Tip[]
   └─ components/
      ├─ sk-app.ts
      ├─ sk-canvas-bg.ts
      ├─ sk-now-banner.ts
      ├─ sk-city-badge.ts
      ├─ sk-itinerary.ts
      ├─ sk-day-card.ts
      ├─ sk-event-item.ts
      ├─ sk-map-links.ts
      ├─ sk-calendar.ts
      ├─ sk-inspiration.ts
      └─ sk-tips.ts
```

`index.html` (skeleton — note zero divs/spans):
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SK26 · South Korea 2026</title>
    <link rel="icon" href="/favicon.svg" />
    <link rel="stylesheet" href="/src/styles/tokens.css" />
    <meta name="theme-color" content="#cd2e3a" />
  </head>
  <body>
    <sk-app></sk-app>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

---

## 13. Build, guard & deploy

### 13.1 Local
`npm i` → `npm run dev` (http://localhost:5173) → `npm run build` → `dist/`.

### 13.2 No-div guard (`scripts/no-div-guard.mjs`)
Recursively scan `src/**` + `index.html`; if a `<div` or `<span` (word-boundary) is found, print the file/line and `process.exit(1)`. Wire into `build` (`tsc --noEmit && npm run guard && vite build`).

### 13.3 Deploy to `sk266.tevlen.co.za` via **GitHub Pages**

Custom domain at the subdomain root → keep Vite `base: '/'` (do **not** use a `/repo/` base, because the custom domain serves from root).

1. **`public/CNAME`** — a one-line file containing exactly `sk266.tevlen.co.za`. (Lives in `public/` so Vite copies it into `dist/` on every build; this is what tells Pages the custom domain.)
2. **DNS** (tevlen.co.za zone): add `CNAME  sk266 → <github-username>.github.io.` (For an apex you'd use A records, but this is a subdomain, so CNAME is correct.)
3. **GitHub repo → Settings → Pages:** Source = **GitHub Actions**; set the custom domain to `sk266.tevlen.co.za`; tick **Enforce HTTPS** once the cert provisions.
4. **Workflow** `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push: { branches: [main] }
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: true }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build      # runs tsc --noEmit && guard && vite build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.deploy.outputs.page_url }}" }
    steps:
      - id: deploy
        uses: actions/deploy-pages@v4
```

Notes: hash routing means **no 404/SPA rewrite is needed**. The Actions artifact deploy doesn't run Jekyll, so no `.nojekyll` is required. Verify the live site loads at `https://sk266.tevlen.co.za` with HTTPS enforced.

### 13.4 No-bundler fallback (only if Vite is rejected)
Compile with `tsc` to ESM in `dist/`, load `lit` from an ESM CDN via an **import map** in `index.html`, ship `.js` directly. Loses HMR/minification but keeps the stack to TS+Lit+CSS.

---

## 14. Implementation milestones (suggested order)

1. **Scaffold:** Vite vanilla-ts + Lit; `tokens.css`, `shared.ts`; `index.html`; `main.ts`; no-div guard. Render an empty `<sk-app>` shell with header/nav/footer + ARIA tabs + hash router.
2. **Data:** write `types.ts`; port `cities.ts` and the **full** `itinerary.ts` from `Itinerary.md`; stub `inspiration.ts`/`tips.ts` with §7 seeds.
3. **Itinerary tab:** `sk-itinerary` → `sk-day-card` → `sk-event-item` + `sk-map-links`. Verify costs render with `<data>`, times with `<time>`.
4. **Dates engine:** `dates.ts` (`seoulNow`, `currentCity`, `nowOrNext`) + `sk-now-banner` + `sk-city-badge` in header; wire `?now=` override.
5. **Calendar tab:** `sk-calendar` `<table>` month grid(s) for Jul + Aug 2026, event chips per day, selected-day panel, today/now highlight, embedded now/next.
6. **Canvas:** `sk-canvas-bg` per §6; `<sk-app>` sets `city` from currentCity/selectedCity and updates `--city-accent`. Verify reduced-motion + visibility pause.
7. **Inspiration tab:** `sk-inspiration` figure/figcaption gallery, `<select>` city override defaulting to current city; lazy images using `public/inspo/_placeholder.svg` until real team photos land in `public/inspo/<city>/`; graceful no-image state with descriptive `alt`.
8. **Tips tab:** `sk-tips` using `<dl>`/`<details>`, global + per-city filter.
9. **Polish:** dark mode, responsive checks, focus states, Lighthouse pass, fonts self-hosted, favicon/meta/OpenGraph.
10. **Deploy** per §13.3; confirm on `sk266.tevlen.co.za`.

---

## 15. Definition of done

- [ ] All four tabs work via hash routing; arrow-key tab nav; refresh-safe deep links.
- [ ] **Zero `<div>`/`<span>`** in `src/` and `index.html` (guard passes in CI/build).
- [ ] Only runtime UI dep is `lit`; `tsc --noEmit` clean under `strict`.
- [ ] Itinerary shows **every** event from `Itinerary.md` with times, ₩+R costs, and Google+Kakao links.
- [ ] Calendar loads all events and shows a correct **"right now / up next"** state (verified via `?now=` at several trip moments).
- [ ] Inspiration tab defaults to the **current city**; Tips tab shows global + current-city advice.
- [ ] Background animates **only** on `<canvas>`, tints per city, pauses when hidden, and is static under `prefers-reduced-motion`.
- [ ] Works keyboard-only; AA contrast in light & dark; Lighthouse a11y/perf/best-practices ≥ 95.
- [ ] Static `dist/` deploys to the subdomain with no server code.

---

## 16. Stretch goals (optional, after DoD)
- "Today" deep-view that auto-scrolls the itinerary to the current day.
- Per-day **map** (static image or a single embedded KakaoMap) showing the day's pins.
- Offline support: a small service worker (cache-first) so it works without data on the trip; installable PWA via `manifest.webmanifest`.
- Weather strip per city (static seasonal note, or a fetch if an API key is added later).
- A subtle **sound** toggle (off by default) — a single soft 가야금 note on tab change. (Off unless asked.)

---

## 17. Resolved decisions (locked)
1. **Inspiration images → own photos, placeholders for now.** Ship `PhotoInspiration` entries with `image` pointing at a per-city placeholder (`public/inspo/_placeholder.svg`, a tasteful labelled SVG). Real photos drop into `public/inspo/<city>/` later — keep the gallery's graceful state for missing images. Always set descriptive `alt`.
2. **Dark mode → auto via `prefers-color-scheme`** (already in §5). Light-only is an acceptable fallback if dark causes contrast/canvas issues, but build dark first.
3. **Travellers = 2.** Export `export const TRAVELLERS = 2;` from `src/data/cities.ts`. Per-person costs stay as-is; the **Jeju rental car is per-car**, so render it divided: `₩60,000/car ÷ 2 = ₩30,000 pp/day` (and the R equivalent). Surface this on the Jeju arrival/car event and in the Jeju tip.
4. **Hosting → GitHub Pages** (see §13.3, now GitHub-Pages-specific) with custom domain `sk266.tevlen.co.za`.
5. **Canvas motif → drifting petals tinted per city** (Seoul blossom-pink / Jeju camellia-red / Busan ocean-teal), over the faint ink-mountains + mist. Confirmed per §6.
</content>
