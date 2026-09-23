// Cloudflare Pages Function — runs in front of every request.
// Both qualiber.ai and www.qualiber.ai are attached to this Pages project, so
// without this the site is served from two addresses. www permanently (301)
// redirects to the canonical apex (the same host as `site` in astro.config.mjs
// and every <link rel="canonical">), keeping path and query.
// Any other host — the apex, *.pages.dev previews — passes straight through.
const CANONICAL_HOST = 'qualiber.ai';

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === `www.${CANONICAL_HOST}`) {
    url.hostname = CANONICAL_HOST;
    url.protocol = 'https:';
    // Built by hand (not Response.redirect) so the redirect can carry HSTS —
    // Pages' _headers file doesn't apply to Function responses.
    return new Response(null, {
      status: 301,
      headers: {
        Location: url.toString(),
        'Strict-Transport-Security': 'max-age=15552000',
      },
    });
  }
  return next();
}
