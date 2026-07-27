// Fails the build if `ui.pt` and `ui.en` (src/i18n/ui.ts) don't have the
// exact same set of keys. "A key present in one locale only is a bug" —
// CLAUDE.md. Run via `npm run check:i18n` (uses tsx to load this directly).
import { ui } from '../src/i18n/ui.ts';

const ptKeys = new Set(Object.keys(ui.pt));
const enKeys = new Set(Object.keys(ui.en));

const missingInEn = [...ptKeys].filter((k) => !enKeys.has(k));
const missingInPt = [...enKeys].filter((k) => !ptKeys.has(k));

if (missingInEn.length || missingInPt.length) {
  if (missingInEn.length) {
    console.error('Keys present in pt but missing in en:', missingInEn);
  }
  if (missingInPt.length) {
    console.error('Keys present in en but missing in pt:', missingInPt);
  }
  process.exit(1);
}

console.log(`i18n OK — ${ptKeys.size} keys in sync across pt/en.`);
