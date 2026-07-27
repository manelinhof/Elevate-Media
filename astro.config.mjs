import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// SSR on Cloudflare Pages. `platformProxy` surfaces the D1/R2 bindings
// declared in wrangler.toml to `astro dev` via Miniflare, so local dev
// talks to the same binding shapes as production.
//
// R2-hosted media (posters/loops/reels) is intentionally NOT wired through
// astro:assets / <Image> here: that would require a build-time-known media
// domain, but PUBLIC_MEDIA_BASE is a runtime env var (see src/data/site.ts),
// never a hardcoded value. Media tags use plain <img>/<video> instead.
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'compile',
    platformProxy: {
      enabled: true,
    },
  }),
});
