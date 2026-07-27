// Deterministic golden-angle phyllotaxis spiral layout for the scattered
// cluster display of project tiles (cipher.tv-inspired, see project plan
// notes). No randomness — the same project count always produces the same
// layout, so it's stable across rebuilds/deploys.
const GOLDEN_ANGLE = 2.399963; // radians (~137.5°)

// Cycle of {width, aspect ratio} presets for visual variety, rather than
// every tile being a uniform 16:9 rectangle. Values are in vmin so the
// whole cluster scales with viewport size instead of needing JS resize
// handling.
const SIZE_PRESETS: { width: number; ratio: number }[] = [
  { width: 19, ratio: 16 / 9 },
  { width: 14, ratio: 1 },
  { width: 21, ratio: 4 / 3 },
  { width: 16, ratio: 16 / 10 },
  { width: 13, ratio: 3 / 4 },
  { width: 18, ratio: 16 / 9 },
];

// Returns one ready-to-use inline `style` string per project index, each
// setting --x/--y/--w/--h custom properties consumed by the `.cluster`
// media-query CSS in src/pages/[lang]/index.astro.
export function computeClusterLayout(count: number, maxRadius = 30): string[] {
  return Array.from({ length: count }, (_, i) => {
    const r = maxRadius * Math.sqrt((i + 0.5) / count);
    const theta = i * GOLDEN_ANGLE;
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    const preset = SIZE_PRESETS[i % SIZE_PRESETS.length];
    const height = preset.width / preset.ratio;
    return `--x:${x.toFixed(2)}vmin;--y:${y.toFixed(2)}vmin;--w:${preset.width}vmin;--h:${height.toFixed(2)}vmin;`;
  });
}
