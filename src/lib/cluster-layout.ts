// Tall-vertical-ellipse layout for the scattered cluster display of project
// tiles (cipher.tv-derived — see project plan notes: their actual scene
// controller was pulled from its JS bundle and re-derived here for a DOM/CSS
// site instead of their WebGL one). No randomness — the same project count
// always produces the same layout, so it's stable across rebuilds/deploys.
//
// Pure math, no DOM — this runs both server-side (SSR resting layout, via
// computeClusterLayout) and client-side (the live rAF loop in
// src/pages/[lang]/index.astro imports buildEllipseLUT/getEllipsePoint
// directly to move tiles every frame).
//
// Every tile travels the *same* elliptical path, parametrized by arc length
// rather than angle. A plain "equal angle steps" parametrization looks fine
// on a circle but breaks on a tall, narrow ellipse like this one: the arc is
// much longer per degree at the top/bottom than at the sides, so equal-angle
// steps would visibly move some tiles faster than others — the exact bug we
// already hit and fixed once for the flat ring, recurring here because the
// path is no longer circular. Arc-length parametrization (build a lookup
// table, walk it by normalized distance) fixes it the same way.

const TILE_WIDTH = 18; // vmin — same fixed size for every tile, see prior fix notes
const TILE_RATIO = 16 / 9;

// Tall and narrow — mostly vertical travel with a little horizontal sway,
// per the "spiral, but only on the y axis" request — then tilted 45° so the
// path reads as a diagonal spiral rather than a flat vertical oval. Radii in
// vmin. Exported so the client-side script (src/pages/[lang]/index.astro)
// reuses these exact values instead of re-declaring its own copies.
export const RX = 12;
export const RY = 32;
export const TILT = Math.PI / 4;
const LUT_SEGMENTS = 720;

export interface EllipsePoint {
  x: number;
  y: number;
  t: number;
}

export function buildEllipseLUT(
  rx: number,
  ry: number,
  tilt = TILT,
  segments = LUT_SEGMENTS
): EllipsePoint[] {
  const points: EllipsePoint[] = [];
  let length = 0;
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    const rawX = rx * Math.cos(angle);
    const rawY = ry * Math.sin(angle);
    const x = rawX * cosT - rawY * sinT;
    const y = rawX * sinT + rawY * cosT;
    if (i > 0) {
      const prev = points[i - 1];
      length += Math.hypot(x - prev.x, y - prev.y);
    }
    points.push({ x, y, t: length });
  }
  const total = points[points.length - 1].t;
  for (const p of points) p.t /= total;
  return points;
}

// Binary-searches the LUT for the given normalized progress (wraps at 1) and
// linearly interpolates between the two bracketing points.
export function getEllipsePoint(lut: EllipsePoint[], progress: number): { x: number; y: number } {
  const t = ((progress % 1) + 1) % 1;
  let lo = 0;
  let hi = lut.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (lut[mid].t < t) lo = mid;
    else hi = mid;
  }
  const a = lut[lo];
  const b = lut[hi];
  const span = b.t - a.t || 1;
  const frac = (t - a.t) / span;
  return { x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac };
}

// SSR resting layout — one ready-to-use inline `style` string per project
// index, each setting --x/--y/--w/--h custom properties consumed by
// src/pages/[lang]/index.astro. This is the pre-JS/reduced-motion state; the
// live rAF loop overwrites --x/--y every frame once it starts.
export function computeClusterLayout(count: number, rx = RX, ry = RY, tilt = TILT): string[] {
  const lut = buildEllipseLUT(rx, ry, tilt);
  const height = TILE_WIDTH / TILE_RATIO;
  return Array.from({ length: count }, (_, i) => {
    const { x, y } = getEllipsePoint(lut, i / count);
    return `--x:${x.toFixed(2)}vmin;--y:${y.toFixed(2)}vmin;--w:${TILE_WIDTH}vmin;--h:${height.toFixed(2)}vmin;`;
  });
}
