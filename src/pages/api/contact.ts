import type { APIRoute } from 'astro';

// Validates and logs only — no email is actually sent yet. The owner chose
// to build the form itself first and decide on an email service (Resend,
// etc.) later; wire the real send in where the console.log is below once
// that's chosen. The request/response contract (JSON in, {ok:true} /
// {ok:false,error} out) is already what BaseLayout.astro's fetch call
// expects, so the frontend won't need to change when this does.
interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
  // Honeypot field — see the form in BaseLayout.astro. Real visitors never
  // fill this in; anything present here means a bot submitted the form.
  company: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidPayload(value: unknown): value is ContactPayload {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.name === 'string' &&
    p.name.trim().length > 0 &&
    typeof p.email === 'string' &&
    EMAIL_PATTERN.test(p.email) &&
    typeof p.phone === 'string' &&
    typeof p.message === 'string' &&
    p.message.trim().length > 0 &&
    typeof p.company === 'string'
  );
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!isValidPayload(body)) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Honeypot tripped — pretend success so the bot doesn't learn anything,
  // but drop the submission instead of logging/processing it.
  if (body.company.trim().length > 0) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // TODO: send via an email API once one is chosen — see the "Contact form"
  // note in CLAUDE.md's open tasks. Logged for now so submissions are at
  // least visible (via `wrangler pages deployment tail` in production)
  // rather than silently dropped during development.
  console.log('Contact form submission:', {
    name: body.name,
    email: body.email,
    phone: body.phone,
    message: body.message,
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
