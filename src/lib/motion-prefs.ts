// Browser-only helper shared by every component that autoplays a silent
// loop (grid tiles, hero). Never fetch or play a loop video unless this
// returns true — reduced-motion and saveData users get a static poster only.
export function shouldAutoplay(): boolean {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  const saveData = nav.connection?.saveData === true;
  return !reducedMotion && !saveData;
}
