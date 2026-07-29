# The Drone Ninja — portfolio site

Aerial cinematography portfolio for the `@the.drone.ninja` Instagram account.
Bilingual PT/EN. Astro 5 SSR on Cloudflare Pages.

Repo: https://github.com/manelinhof/Elevate-Media

## Hard constraints

**Everything must stay on free tiers.** The only accepted recurring cost is the
domain. Do not introduce Mux, Cloudinary, Auth0, Clerk, Sanity, Payload, Vercel,
Supabase, or any service with a paid floor — even if it would simplify the code.
If something seems impossible for free, say so rather than quietly adding a
paid dependency.

**Never suggest Vercel.** Its Hobby plan prohibits commercial use and this is a
commercial site. Cloudflare Pages only.

**The owner uploads footage himself via `scripts/ingest.sh`.** There is no CMS
and none is wanted. New work = run the script, paste the printed JSON into
`src/data/projects.json`, commit.

## Decisions that look wrong but aren't

**No HLS or adaptive bitrate.** Progressive MP4 with `+faststart`, two
renditions, served from R2. R2 has zero egress fees, which is the entire reason
this site is free. Don't "upgrade" to a streaming service.

**Cloudflare resource names are brand-neutral on purpose** (`portfolio-site`,
`site-db`, `site-media`). Neither D1 nor R2 can be renamed in place, and the
brand may become "Elevate Media" later. Do not rename them to match the brand.

**Gallery auth has no identity provider, deliberately.** Unguessable token in
the URL + optional PBKDF2 passcode + HMAC-signed cookie scoped to one gallery.
This is sufficient for delivering client footage. Don't add user accounts.

**Grid tiles never load the full reel.** Poster frame → IntersectionObserver →
short silent loop. The full reel loads only on click. This is what keeps the
site usable on mobile data and is the main thing it does better than the
reference site (ignitemediastudios.com). Any change that autoplays full reels in
the grid is a regression.

## Conventions

- **Brand strings live only in `BRAND` in `src/data/site.ts`.** Never hardcode
  the name, handle, or domain anywhere else. Domain-dependent values are the env
  vars `SITE_URL`, `PUBLIC_MEDIA_BASE`, `FROM_EMAIL`.
- **Every new UI string goes into both `pt` and `en`** in `src/i18n/ui.ts`.
  A key present in one locale only is a bug.
- **The Portuguese copy was written by a non-native speaker** and is pending
  review by the owner. Flag PT strings you're unsure of rather than silently
  rewriting them.
- **Colour is state, never decoration** — with one deliberate exception: the
  brand mark (`--logo-color`), which is yellow in light mode purely as a
  brand accent, not state. It's an exception because the mark is baked at
  `--fg`-grey and was unreadable against the light background otherwise;
  everything else stays monochrome. The two state accents (`--class-e`
  magenta, `--class-b` blue) come from VFR sectional chart airspace
  conventions — don't add further accents or use these two ornamentally.
- Respect `prefers-reduced-motion` and `navigator.connection.saveData` — both
  are already wired into the tile component.

## Never

- Commit `.dev.vars` or any real secret. Secrets go in
  `wrangler pages secret put`.
- Commit video or image files. Media lives in R2; `media-src/` is gitignored.

## Open tasks

1. Create the Cloudflare resources: `wrangler d1 create site-db`,
   `wrangler r2 bucket create site-media`, then paste the database id into
   `wrangler.toml` and apply `schema.sql`.
2. Attach a custom domain to the R2 bucket, set `PUBLIC_MEDIA_BASE`.
3. Replace the two placeholder entries in `src/data/projects.json` with real work.
4. Rename the categories in `src/data/site.ts` once the Instagram back catalogue
   is sorted. Unused categories hide themselves; no other change needed.
5. Fill in `operatorId`, `certificates`, `insuredTo`, `whatsapp` in `site.ts`.
6. Flesh out the remaining stubs: `/[lang]/work/[slug]` and
   `/[lang]/services`. Home, Works, About, Services, `/[lang]/work/[slug]`,
   and `/[lang]/gallery/[token]` are all separate routes — Home is only the
   rotating cluster (plus the shared header/footer), nothing else.
7. Embed Cal.com for booking, configured as *requires confirmation* — drone
   shoots depend on weather, daylight and airspace, so instant-confirm slots
   would create bookings that have to be cancelled.
8. Tune the ffmpeg CRF values against real footage. Coastal material (water
   texture, foliage at altitude) may band at the current CRF 21.
