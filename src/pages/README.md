# src/pages

File-based Astro routing. Every real page lives under the `[lang]` dynamic
segment (`pt` or `en`); `isValidLang()` + a `404` response is the first
thing every one of these files does.

```
index.astro                        redirects "/" -> "/{defaultLang}/"
[lang]/
  index.astro                      Home — header + spiral cluster + footer, nothing else
  work/
    index.astro                    Works listing — headline/tagline (Hero), category tags, plain grid
    [slug].astro                   Project detail — STUB, functional but not the final design (CLAUDE.md open task 6)
  about/index.astro                About — bio, services list, equipment list, Instagram follow CTA
  services/index.astro             Services — placeholder copy + a `data-todo` marker for the future Cal.com embed
  gallery/[token].astro            Client delivery gallery — passcode form or unlocked media list
api/
  gallery/[token]/verify.ts        POST target for the gallery passcode form
```

## Why Home, Works, About, and Services are separate routes

Earlier in this project's history these were anchor-scrolled sections of one
page (`/[lang]/#work`, `#about`, `#services`). They were split into real
routes specifically so Home could become *just* the cluster — see the git
history around "Split Home/Works/About/Services into separate routes" for
the full reasoning. Don't reintroduce anchor-based nav for these; the header
in `src/layouts/BaseLayout.astro` computes each nav link's active state from
`Astro.url.pathname`, not from scroll position.

## Gallery auth flow

`src/middleware.ts` intercepts every `/[lang]/gallery/[token]` request
*before* the page component runs: it looks up the token in D1, 404s on
missing/revoked/expired, and either issues a signed cookie immediately (no
passcode configured) or leaves `Astro.locals.gallery` unset so the page
renders its passcode form. The form POSTs to
`api/gallery/[token]/verify.ts` as a plain HTML form submission (not
fetch/JSON) so it works with JavaScript disabled, same philosophy as the
grid tiles never requiring JS to show a poster. See
[src/lib/README.md](../lib/README.md) for the crypto primitives both files
share.

## Work-in-progress pages

`work/[slug].astro` and `services/index.astro` are functional stubs, not
finished designs — see CLAUDE.md's open tasks before assuming their current
layout is intentional.
