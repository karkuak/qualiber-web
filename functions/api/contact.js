// POST /api/contact — Cloudflare Pages Function.
//
// The demo-request form posts here (same origin) and this function forwards the
// message to Formspree server-side, so the page never points a form at a third-party
// domain. Formspree stays the processor that emails the submission to us.
//
// Design rules:
//  - Never lose a lead silently: any failure answers non-2xx and the page tells the
//    visitor to email hello@qualiber.ai instead.
//  - Only the four known fields are forwarded (nothing else the client sends).
//  - Same-origin only (Origin must equal this site's origin).
//  - The honeypot field answers "success" without forwarding, so bots learn nothing.

const DEFAULT_ENDPOINT = 'https://formspree.io/f/xeeykpae';
const MAX_BODY_BYTES = 20_000;
const LIMITS = { name: 200, email: 254, company: 200, message: 5000 };
const FIELDS = ['name', 'email', 'company', 'message'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extra,
    },
  });

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);

  if (request.headers.get('Origin') !== url.origin) {
    return json({ ok: false, error: 'forbidden' }, 403);
  }
  const declared = Number(request.headers.get('Content-Length') || 0);
  if (declared > MAX_BODY_BYTES) return json({ ok: false, error: 'too_large' }, 413);

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  // Honeypot: humans never see this field.
  const trap = form.get('_gotcha');
  if (typeof trap === 'string' && trap.trim() !== '') return json({ ok: true });

  const values = {};
  for (const f of FIELDS) {
    const v = form.get(f);
    values[f] = typeof v === 'string' ? v.trim() : '';
    if (values[f].length > LIMITS[f]) return json({ ok: false, error: 'invalid' }, 400);
  }
  if (!values.name || !EMAIL_RE.test(values.email)) {
    return json({ ok: false, error: 'invalid' }, 400);
  }

  const out = new FormData();
  for (const f of FIELDS) if (values[f]) out.append(f, values[f]);

  try {
    const res = await fetch(env?.FORMSPREE_ENDPOINT || DEFAULT_ENDPOINT, {
      method: 'POST',
      body: out,
      headers: { Accept: 'application/json', Origin: url.origin, Referer: `${url.origin}/` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error(`contact: upstream responded ${res.status}`); // status only — never log submitted data
      return json({ ok: false, error: 'upstream' }, 502);
    }
  } catch (err) {
    console.error(`contact: upstream request failed (${err?.name || 'error'})`);
    return json({ ok: false, error: 'upstream' }, 502);
  }
  return json({ ok: true });
}

// Anything other than POST.
export async function onRequest() {
  return json({ ok: false, error: 'method_not_allowed' }, 405, { Allow: 'POST' });
}
