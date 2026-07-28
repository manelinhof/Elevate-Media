// Deterministic single-ring layout for the scattered cluster display of
// project tiles (cipher.tv-inspired, see project plan notes). No
// randomness — the same project count always produces the same layout, so
// it's stable across rebuilds/deploys.
//
// Every tile sits at the *same* radius, evenly spaced by angle. Two earlier
// attempts got this wrong:
//   - A golden-angle phyllotaxis spread (mimicking organic scatter across
//     many points) reads as uneven gaps when count is small (6-10 tiles),
//     since that formula is built for hundreds of points, not a handful.
//   - Varying each tile's radius (an annulus/band) means tiles farther out
//     travel a longer arc per rotation than tiles close in, even though
//     every tile shares the same angular velocity — so they visibly move
//     at different *speeds*, which reads as janky rather than clean.
// A single fixed radius with even angular spacing fixes both: uniform
// gaps, uniform tangential speed for every tile.

// One fixed size for every tile — same radius (above) plus same dimensions
// means the whole ring reads as a uniform, mechanical-feeling wheel rather
// than tiles of varying scale. 16:9, in vmin so the whole cluster scales
// with viewport size instead of needing JS resize handling.
const TILE_WIDTH = 18; // vmin
const TILE_RATIO = 16 / 9;

// Returns one ready-to-use inline `style` string per project index, each
// setting --x/--y/--w/--h custom properties consumed by the `.cluster`
// media-query CSS in src/pages/[lang]/index.astro. `radius` leaves a clear
// circular gap in the middle for the center logo mark.
export function computeClusterLayout(count: number, radius = 17): string[] {
  const height = TILE_WIDTH / TILE_RATIO;
  return Array.from({ length: count }, (_, i) => {
    const theta = (i / count) * 2 * Math.PI;
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta);
    return `--x:${x.toFixed(2)}vmin;--y:${y.toFixed(2)}vmin;--w:${TILE_WIDTH}vmin;--h:${height.toFixed(2)}vmin;`;
  });
}
