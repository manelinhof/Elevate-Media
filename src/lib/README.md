# src/lib

Framework-agnostic logic, kept out of `.astro` files so it's independently
readable/testable. Nothing here touches the DOM except where noted.

## `projects.ts`

Loads `src/data/projects.json`, filters it through a hand-rolled type guard
(`isProject`) rather than a validation library — the shape is small and
stable, and the input is the owner's own `ingest.sh` output being pasted in,
not untrusted external data. Exports `getProjects()` and
`getProjectBySlug(slug)`.

## `cluster-layout.ts`

The math behind Home's spiral cluster — pure trig, no DOM dependency, so it
runs both server-side (the SSR resting layout, before any JS has run) and
client-side (the live per-frame animation in
`src/pages/[lang]/index.astro`). Rebuilt to match **cipher.tv's actual
reference implementation** (its real WebGL scene-controller source was
pulled from its JS bundle and re-derived here for CSS/DOM instead — see git
history for the full story of what that took to get right):

- `buildEllipseLUT(rx, ry, tilt, segments)` walks an ellipse in even angle
  steps, accumulates real arc length between points, and normalizes to `t`
  (0–1). This matters because equal-angle steps on a non-circular ellipse
  move faster at some points on the curve than others — arc-length
  parametrization is what keeps every tile's visual speed constant.
- `getEllipsePoint(lut, progress)` binary-searches that table and
  interpolates a point for any progress value (wraps at 1).
- `computeClusterLayout(count, rx, ry, tilt)` — the SSR entry point: one
  `--x`/`--y`/`--w`/`--h` style string per project, using `t = i/count` at
  `time = 0`. This is what reduced-motion visitors see permanently, and what
  everyone else sees for one frame before the live script takes over.
- `RX_DESKTOP`/`RY_DESKTOP`/`TILT_DESKTOP` and the `_MOBILE` variants plus
  `MOBILE_BREAKPOINT` (768px) are cipher.tv's own exact constants, rescaled
  from their unitless 3D-scene numbers into vmin — same ratios, same tilt
  angles, exported so the client script imports them instead of
  re-declaring copies.

## `motion-prefs.ts`

Two checks, deliberately not merged into one:

- `shouldAutoplay()` — `!prefersReducedMotion() && !saveDataEnabled()`. Used
  anywhere a video loop might autoplay (grid tiles, Hero).
- `prefersReducedMotion()` — used anywhere JS drives animation directly
  (GSAP, Lenis, the cluster's rAF loop). Deliberately does **not** fold in
  `saveData`, since `saveData` is about network bytes and JS-only animation
  (no extra video fetched) doesn't consume any.

## `gallery-auth.ts`

Shared primitives for the client-gallery auth flow, used by both
`src/middleware.ts` and `src/pages/api/gallery/[token]/verify.ts`. Runs on
the Cloudflare Workers runtime, so this is **Web Crypto (`crypto.subtle`)
throughout — never Node's `crypto` module**, which isn't available there.

- `signSession`/`verifySession` — an HMAC-SHA256-signed `{gid, exp}` cookie
  payload, base64url-encoded.
- `derivePasscodeHash` — PBKDF2 (100k iterations) for the optional gallery
  passcode.
- `constantTimeEqual` — manual constant-time string compare for checking
  the derived passcode hash; a plain `===` short-circuits on the first
  differing byte, which leaks timing information about a guessed passcode —
  the actual brute-force target here, unlike most string comparisons in this
  codebase.
