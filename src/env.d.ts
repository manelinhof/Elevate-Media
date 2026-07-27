/// <reference types="astro/client" />
import type { Runtime } from '@astrojs/cloudflare';

type CloudflareEnv = {
  SITE_DB: D1Database;
  SITE_MEDIA: R2Bucket;
  SITE_URL: string;
  PUBLIC_MEDIA_BASE: string;
  FROM_EMAIL: string;
  // Real value set via `wrangler pages secret put GALLERY_HMAC_SECRET`;
  // never hardcoded, never present in wrangler.toml.
  GALLERY_HMAC_SECRET: string;
};

type CloudflareRuntime = Runtime<CloudflareEnv>;

declare global {
  namespace App {
    // Runtime<T> already provides the `runtime: { env: Env & T; ... }` shape,
    // so this extends it rather than nesting it under a `runtime` property.
    interface Locals extends CloudflareRuntime {
      gallery?: { id: number; token: string };
    }
  }
}
