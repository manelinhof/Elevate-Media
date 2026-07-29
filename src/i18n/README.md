# src/i18n

## `ui.ts`

One object, `ui`, with a `pt` key and an `en` key, each holding the exact
same set of string keys (`nav.home`, `home.heading`, `gallery.locked`, ...).
**A key present in one locale only is a bug** — `npm run check:i18n`
(`scripts/check-i18n.ts`) fails the build if the two key sets ever diverge.
`languages` and `defaultLang` (`'pt'`) are also defined here; `UiKey` is
derived from `en`'s keys so every `t()` call is typo-checked at compile time.

The PT copy was written by a non-native speaker and is pending review by the
site owner. Lines flagged `// TODO(pt-review)` are the ones worth a second
look — don't silently "correct" PT strings without that flag; the owner
wants to review the actual wording, not just have it changed.

## `utils.ts`

- **`isValidLang(value)`** — type guard, `value is Lang`. Every `[lang]`
  page route starts with this to 404 on anything that isn't `pt`/`en`.
- **`getLangFromUrl(url)`** — pulls the lang segment out of a URL's
  pathname, falling back to `defaultLang`.
- **`useTranslations(lang)`** — returns a `t(key)` function scoped to that
  language, falling back to `defaultLang`'s value if a key is somehow
  missing (shouldn't happen given `check:i18n`, but avoids a hard crash if
  it ever does).

Adding a new string: add the key to **both** `pt` and `en` in `ui.ts` in the
same edit — never one without the other.
