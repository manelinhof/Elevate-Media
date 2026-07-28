// Browser-only helper shared by every component that autoplays a silent
// loop (grid tiles, hero). Never fetch or play a loop video unless this
// returns true — reduced-motion and saveData users get a static poster only.
export function shouldAutoplay(): boolean {
  return !prefersReducedMotion() && !saveDataEnabled();
}

function saveDataEnabled(): boolean {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return nav.connection?.saveData === true;
}

// Gates JS-driven animation (GSAP, Lenis) that CSS's `animation-duration`/
// `transition-duration` override (see global.css) can't reach, since those
// libraries animate via inline styles on a requestAnimationFrame loop, not
// real CSS animation/transition properties. Deliberately does NOT fold in
// saveData like shouldAutoplay() does — saveData is about network bytes,
// which JS animation doesn't consume, so a data-saver user with no motion
// sensitivity shouldn't lose these effects.
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
