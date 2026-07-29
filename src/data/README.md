# src/data

## `site.ts`

- **`BRAND`** — the *only* place the brand name/handle/domain may be
  hardcoded. Never repeat these literals elsewhere in the codebase; import
  `BRAND` instead. Domain-dependent values that aren't the brand itself
  (`SITE_URL`, `PUBLIC_MEDIA_BASE`, `FROM_EMAIL`) are runtime env vars, not
  constants here.
- **`CATEGORIES`** — the fixed category list (currently placeholder
  labels, pending the Instagram back-catalogue sort — CLAUDE.md open task
  4). `activeCategories(projects)` filters this down to only categories with
  at least one matching project, so renaming/pruning `CATEGORIES` never
  requires touching any page that renders the category list.
- **`OPERATOR`** — operator ID, certificates, insurance, WhatsApp number.
  All still `'TODO'` placeholders on purpose (CLAUDE.md open task 5) — don't
  invent plausible-looking values here.
- **`mediaUrl(mediaBase, key)`** — builds a full R2 media URL from a
  relative key. `mediaBase` must always come from the
  `PUBLIC_MEDIA_BASE` runtime env var (`Astro.locals.runtime.env`), never a
  hardcoded domain — R2's bucket domain isn't known at build time.

## `projects.json`

The actual content — this **is** the CMS. Each entry is one project:

```json
{
  "slug": "unique-url-slug",
  "category": "one of src/data/site.ts's CATEGORIES ids",
  "title": { "pt": "...", "en": "..." },
  "poster": "R2 key for the poster JPG",
  "loop": "R2 key for the silent grid-preview loop",
  "reel": { "sd": "R2 key, 720p", "hd": "R2 key, 1080p" },
  "publishedAt": "YYYY-MM-DD",
  "featured": false
}
```

New entries come from running `scripts/ingest.sh` (which uploads the actual
media to R2 and prints exactly this JSON shape) and pasting the result in —
see [scripts/README.md](../../scripts/README.md). Never hand-write R2 keys
or commit video/image files directly; `media-src/` is gitignored for a
reason.
