# scripts

## `ingest.sh` — the CMS

There is no CMS and none is wanted (see CLAUDE.md). This script *is* the
publishing pipeline: it takes one finished, already-edited video and turns
it into everything a new `src/data/projects.json` entry needs.

```bash
./scripts/ingest.sh --input path/to/final.mp4 --slug my-project --category real-estate
```

Requires `ffmpeg` and `wrangler` on `PATH`. For the given input it:

1. Extracts a poster JPG (1 second in).
2. Generates a 6-second silent loop (480px wide, CRF 28) for grid previews.
3. Generates 720p and 1080p progressive MP4 reels (`+faststart`, CRF 21 —
   a starting value; coastal footage with water/foliage texture may band at
   this setting and need tuning, per CLAUDE.md open task 8).
4. Uploads all four files to the `site-media` R2 bucket under
   `projects/<slug>/`.
5. Prints a ready-to-paste JSON object shaped like one `projects.json` entry
   (with `title` left as `"TODO"` for both languages — fill those in by
   hand before committing).

The workflow end-to-end: run the script, paste its printed JSON into
`src/data/projects.json`, fill in the `title` fields, commit. See
[src/data/README.md](../src/data/README.md) for the entry shape.

## `check-i18n.ts`

```bash
npm run check:i18n
```

Loads `src/i18n/ui.ts` directly (via `tsx`, no build step) and fails with a
non-zero exit code if `ui.pt` and `ui.en` don't have the exact same set of
keys — printing exactly which keys are missing from which side. Run this
after adding or renaming any translation key.
