# src/components

Two Astro components, both centered on the same rule from
[CLAUDE.md](../../CLAUDE.md): **grid tiles never load the full reel.**
Poster frame → (something triggers playback) → short silent loop. The full
reel only loads on click, through to `/[lang]/work/[slug]`.

## `ProjectTile.astro`

The tile used everywhere a project is listed: the Works page's plain grid,
and — with `spinning` set — the Home page's cluster.

- **Props**: `project`, `lang`, `mediaBase`, optional `spinning` (set by the
  Home page when this tile sits inside the cluster; adds the `.tile--spin`
  class) and `style` (used by the cluster to pass its own `--x`/`--y`/`--w`/
  `--h` positioning, see `src/lib/cluster-layout.ts`).
- **Markup**: an `<a>` wrapping a poster `<img>` (always loaded) and a loop
  `<video>` (`preload="none"`, no `src` until JS decides to play it).
- **Script** (deduped by Astro across every tile instance — one shared
  listener/observer set, not one per tile):
  - `shouldAutoplay()` (from `motion-prefs.ts`) gates everything below it —
    reduced-motion or `saveData` users never get `data-src` promoted to
    `src`, so the loop is never fetched at all, not just paused.
  - Plain-grid tiles: a shared `IntersectionObserver` plays/pauses each tile
    as it scrolls in/out of view.
  - Cluster tiles (`.tile--spin`) on hover-capable devices (`matchMedia
    '(hover: hover) and (pointer: fine)'`) play on `mouseenter`/pause on
    `mouseleave` instead — several tiles are visible at once in the compact
    cluster layout, so visibility-based autoplay would mean multiple videos
    playing simultaneously. On touch, cluster tiles get neither hover-play
    nor intersection-autoplay — poster stays static, tap still navigates.

## `Hero.astro`

A full-bleed poster/loop banner with `home.heading`/`home.tagline` overlaid,
used at the top of the Works listing page. Same poster→loop mechanics as
`ProjectTile`, except the loop can start immediately on load (no
`IntersectionObserver` needed — it's always in the initial viewport).
