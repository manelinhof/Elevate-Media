// Shared primitives for gallery auth, used by both src/middleware.ts and
// src/pages/api/gallery/[token]/verify.ts. Runs on the Workers runtime, so
// this uses Web Crypto (crypto.subtle) exclusively — never Node's `crypto`
// module.

export const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const PBKDF2_ITERATIONS = 100_000; // tune up if Workers CPU budget allows

export interface SessionPayload {
  gid: number;
  exp: number; // epoch ms
}

// Per-gallery cookie name (not one fixed name) so a browser can hold
// unlocked sessions for multiple galleries at once — matches "scoped to one
// gallery" in CLAUDE.md.
export function cookieName(galleryId: number): string {
  return `gal_${galleryId}`;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Typed `Uint8Array<ArrayBuffer>` (not the `ArrayBufferLike`-generic default)
// so the result is directly assignable to Web Crypto's `BufferSource` params.
function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const withPadding = padded + '='.repeat((4 - (padded.length % 4)) % 4);
  const binary = atob(withPadding);
  const bytes: Uint8Array<ArrayBuffer> = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signSession(secret: string, payload: SessionPayload): Promise<string> {
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  const sigB64 = toBase64Url(new Uint8Array(signature));
  return `${payloadB64}.${sigB64}`;
}

export async function verifySession(secret: string, cookieValue: string): Promise<SessionPayload | null> {
  const [payloadB64, sigB64] = cookieValue.split('.');
  if (!payloadB64 || !sigB64) return null;

  const key = await hmacKey(secret);
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    fromBase64Url(sigB64),
    new TextEncoder().encode(payloadB64)
  );
  if (!valid) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64)));
    if (typeof payload?.gid === 'number' && typeof payload?.exp === 'number') {
      return payload;
    }
    return null;
  } catch {
    return null;
  }
}

export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

export async function derivePasscodeHash(
  passcode: string,
  saltB64: string,
  iterations: number
): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passcode),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: fromBase64Url(saltB64), iterations, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return toBase64Url(new Uint8Array(bits));
}

// Manual constant-time compare — a plain string `===`/`==` short-circuits on
// the first differing byte, leaking timing information about how much of a
// guessed passcode was correct. This is the actual brute-force target, so it
// matters here even though it wouldn't for most string comparisons.
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
