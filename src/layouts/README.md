# src/layouts

One layout: **`BaseLayout.astro`**. Every page wraps its content in it —
`<BaseLayout lang={lang} title={...}><slot /></BaseLayout>` — so header, nav,
footer, and the shared `<head>` only exist in one place.

## Header / nav

A 3-column CSS grid: brand (logo + wordmark, links to `/[lang]/`) on the
left, Works in the center, Services/About/language-switch/"Get in touch" on
the right. Every nav destination is a **real page**, not an anchor — active
state is computed server-side from `Astro.url.pathname` (e.g. `isWorkActive
= pathname.includes('/work')`), not tracked client-side. Below 640px, the
center/right groups collapse behind a hamburger button (`astro-icon`
menu/x icons swapped via `aria-expanded`).

The "Get in touch" button links to `wa.me/${OPERATOR.whatsapp}` —
`OPERATOR.whatsapp` is still the placeholder value from `src/data/site.ts`
(CLAUDE.md open task 5), so the link renders but isn't functional yet.

## Motion: Lenis + GSAP

- **Lenis** (smooth scroll) initializes once here, gated behind
  `prefersReducedMotion()`. It's exposed on `window.__lenis` (plus a
  `lenis:ready` event) specifically so the Home page's own `<script>` — a
  separate module, can't see this file's module-scoped `lenis` variable
  otherwise — can call `lenis.stop()` to hand scroll input over to the
  spiral cluster instead. See `src/pages/[lang]/index.astro`.
- **GSAP** drives a staggered header entrance on load and a magnetic
  cursor-follow effect on nav links (pointer-capable devices only). Both
  skip entirely under reduced motion — the CSS blanket rule in
  `global.css` can neutralize *CSS* animation/transition, but not JS-driven
  `requestAnimationFrame` work like this, so it needs its own explicit gate.

## Mobile menu

Plain state toggle (`header.dataset.menuOpen`, `aria-expanded`), no
animation library needed for the open/close itself. Escape key and the
toggle button both close it.
