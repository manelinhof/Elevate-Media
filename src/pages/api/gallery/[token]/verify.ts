import type { APIRoute } from 'astro';
import {
  COOKIE_MAX_AGE_SECONDS,
  constantTimeEqual,
  cookieName,
  derivePasscodeHash,
  signSession,
} from '../../../../lib/gallery-auth';

const MAX_ATTEMPTS = 10;
const LOCKOUT_MINUTES = 15;

interface GalleryRow {
  id: number;
  token: string;
  passcode_hash: string | null;
  passcode_salt: string | null;
  passcode_iterations: number | null;
  failed_attempts: number;
  locked_until: string | null;
  expires_at: string | null;
  revoked_at: string | null;
}

// Plain form POST (not a fetch/JSON API) so the passcode form works with
// JavaScript disabled — same no-JS-required philosophy as the grid tiles.
export const POST: APIRoute = async (context) => {
  const token = context.params.token;
  if (!token) return new Response('Not found', { status: 404 });

  const env = context.locals.runtime.env;
  const db = env.SITE_DB;

  const gallery = await db
    .prepare(
      `SELECT id, token, passcode_hash, passcode_salt, passcode_iterations,
              failed_attempts, locked_until, expires_at, revoked_at
       FROM galleries WHERE token = ?`
    )
    .bind(token)
    .first<GalleryRow>();

  if (!gallery || gallery.revoked_at) return new Response('Not found', { status: 404 });
  if (gallery.expires_at && new Date(gallery.expires_at).getTime() < Date.now()) {
    return new Response('Not found', { status: 404 });
  }
  if (!gallery.passcode_hash || !gallery.passcode_salt || !gallery.passcode_iterations) {
    // No passcode configured — nothing for this endpoint to verify.
    return new Response('Not found', { status: 404 });
  }

  const form = await context.request.formData();
  const passcode = String(form.get('passcode') ?? '');
  const lang = form.get('lang') === 'en' ? 'en' : 'pt';
  const redirectBase = `/${lang}/gallery/${token}`;

  if (gallery.locked_until && new Date(gallery.locked_until).getTime() > Date.now()) {
    return context.redirect(`${redirectBase}?error=locked`, 303);
  }

  const derived = await derivePasscodeHash(
    passcode,
    gallery.passcode_salt,
    gallery.passcode_iterations
  );
  const ok = constantTimeEqual(derived, gallery.passcode_hash);

  if (!ok) {
    const attempts = gallery.failed_attempts + 1;
    const lockedUntil =
      attempts >= MAX_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000).toISOString()
        : null;
    await db
      .prepare('UPDATE galleries SET failed_attempts = ?, locked_until = ? WHERE id = ?')
      .bind(attempts, lockedUntil, gallery.id)
      .run();
    return context.redirect(`${redirectBase}?error=passcode`, 303);
  }

  await db
    .prepare('UPDATE galleries SET failed_attempts = 0, locked_until = NULL WHERE id = ?')
    .bind(gallery.id)
    .run();

  const session = await signSession(env.GALLERY_HMAC_SECRET, {
    gid: gallery.id,
    exp: Date.now() + COOKIE_MAX_AGE_SECONDS * 1000,
  });
  context.cookies.set(cookieName(gallery.id), session, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    // See middleware.ts — routes are /[lang]/gallery/[token], so "/gallery"
    // is never a real path prefix; Path must be "/" to cover both languages.
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });

  return context.redirect(redirectBase, 303);
};
