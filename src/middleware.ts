import { defineMiddleware } from 'astro:middleware';
import { COOKIE_MAX_AGE_SECONDS, cookieName, signSession, verifySession } from './lib/gallery-auth';

const GALLERY_PATH = /^\/(pt|en)\/gallery\/([^/]+)\/?$/;

interface GalleryRow {
  id: number;
  token: string;
  passcode_hash: string | null;
  expires_at: string | null;
  revoked_at: string | null;
}

// Centralizes the token/passcode/cookie gate for every gallery route so any
// future gallery-adjacent route (e.g. a signed media URL endpoint) inherits
// the same check automatically, instead of re-implementing it per page.
export const onRequest = defineMiddleware(async (context, next) => {
  const match = GALLERY_PATH.exec(context.url.pathname);
  if (!match) return next();

  const token = match[2];
  const env = context.locals.runtime.env;

  const gallery = await env.SITE_DB.prepare(
    'SELECT id, token, passcode_hash, expires_at, revoked_at FROM galleries WHERE token = ?'
  )
    .bind(token)
    .first<GalleryRow>();

  if (!gallery || gallery.revoked_at) {
    return new Response('Not found', { status: 404 });
  }
  if (gallery.expires_at && new Date(gallery.expires_at).getTime() < Date.now()) {
    return new Response('Not found', { status: 404 });
  }

  const name = cookieName(gallery.id);
  const existingCookie = context.cookies.get(name)?.value;

  if (existingCookie) {
    const session = await verifySession(env.GALLERY_HMAC_SECRET, existingCookie);
    if (session && session.gid === gallery.id && session.exp > Date.now()) {
      context.locals.gallery = { id: gallery.id, token: gallery.token };
      return next();
    }
  }

  if (!gallery.passcode_hash) {
    // No passcode configured — the unguessable token alone is sufficient
    // (passcode is optional, per CLAUDE.md). Issue the cookie now.
    const session = await signSession(env.GALLERY_HMAC_SECRET, {
      gid: gallery.id,
      exp: Date.now() + COOKIE_MAX_AGE_SECONDS * 1000,
    });
    context.cookies.set(name, session, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      // Routes are /[lang]/gallery/[token] — "/gallery" is never a real path
      // prefix (the lang segment comes first), so Path must be "/" for the
      // cookie to be sent back on either /pt/gallery/... or /en/gallery/....
      path: '/',
      maxAge: COOKIE_MAX_AGE_SECONDS,
    });
    context.locals.gallery = { id: gallery.id, token: gallery.token };
    return next();
  }

  // Passcode required and not yet satisfied. Let the request through
  // unauthenticated — the gallery page renders the passcode form since
  // `Astro.locals.gallery` is unset, and no media data flows past this point.
  return next();
});
