# Qualiber — website

Marketing site for **Qualiber LLC** and its products — **Qualgraph**, **Warrant** and
**Reality Lab**. Live at [qualiber.ai](https://qualiber.ai).

Built with [Astro](https://astro.build). A single-page company site (About, Our Products, Our Approach,
Our Team, Contact), a Qualgraph product page and a privacy page, statically generated. The only server-side code is one small Cloudflare Pages Function
(the `www` → apex redirect, see [Domains](#domains)).

---

## Local development

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output → ./dist
npm run preview    # serve the built ./dist locally
```

Node 22 (see `.nvmrc`).

## Project structure

```
src/
  layouts/Base.astro          # <head>, SEO/OpenGraph meta, no-flash theme script, logo sprite
  components/
    SiteNav.astro             # sticky nav + mobile menu (home={true} on the home page)
    SiteFooter.astro
    Logo.astro                # the Qualiber logo (<Logo /> lockup, <Logo variant="mark" />)
    LogoSprite.astro          # the logo's shapes, emitted once per page and <use>d by Logo
    home/                     # one component per home-page section, in page order:
      Hero, About, Products, Approach, Team, Contact
  scripts/                    # client behaviour (nav + theme, reveal, demo form, Qualgraph graph)
  lib/logo.mjs                # logo artwork — single source of truth (see "Logo")
  pages/
    index.astro               # home page: assembles the section components
    qualgraph.astro           # Qualgraph product page (hero, principles, "the gap")
    privacy.astro             # privacy policy (required — the form collects emails)
    404.astro
  styles/global.css           # design tokens + all component styles (light + dark)
functions/
  _middleware.js              # Cloudflare Pages Function: www.qualiber.ai → qualiber.ai (301)
public/                       # served as-is; the logo/icon/social files here are generated (below)
scripts/                      # asset generators + their SVG sources
```

## Design system — "Instrument for quality"

- **Neutrals:** cool slate, biased toward the accent (not default grey).
- **Accent:** a single jade — `#35D0A5` (dark) / `#0B7A5F` (light), as `--accent`. Used sparingly.
- **Type:** Georgia serif (display) + monospace (utility/telemetry) + system sans (body).
- Fully themed for light & dark via CSS custom properties; user toggle persists in
  `localStorage` and applies before paint.

## Logo

The logo is vector artwork traced from the brand master, kept in **`src/lib/logo.mjs`**
(ring, zigzag, orbit, sparkle and the "Qualiber" wordmark). Colours are parameters, so one
artwork serves every ground:

- **On the site** the ring/wordmark follow the theme (`currentColor`), the orbit follows
  `--accent`, and the zigzag follows `--ink-faint` — so the logo always matches the page and
  a palette change flows through with no logo edit.
- **In standalone files** (icons, social images) the matching fixed hex colours are used
  (`ON_LIGHT` / `ON_DARK` in `logo.mjs`).

`<LogoSprite />` (in `Base.astro`) emits the shapes once per page; `<Logo />` references them.
Nav/footer use the horizontal lockup at 52px tall (40px on mobile) — the mark's fine detail
blurs below roughly that size, so don't shrink it.

To swap in new artwork, replace the path constants in `src/lib/logo.mjs`.

### Regenerating brand assets

Everything in `public/` derived from the logo is generated from `logo.mjs`; run after changing it:

```bash
node scripts/build-logo.mjs       # favicon.svg + qualiber-mark / qualiber-logo (light + on-dark) SVGs
node scripts/build-icons.mjs      # favicon-32.png, apple-touch-icon.png, icon-512.png
node scripts/build-og.mjs         # og.png (1200×630 social card; source: scripts/og-card.svg)
node scripts/build-linkedin.mjs   # LinkedIn logos (dark + light) and the cover banner
```

These use [`sharp`](https://sharp.pixelplumbing.com), which is installed as a dependency of
Astro — no extra install needed.

---

## Deployment

The site is a **Cloudflare Pages** project named `qualiber-web`, connected to
[`karkuak/qualiber-web`](https://github.com/karkuak/qualiber-web) through Cloudflare's
GitHub integration (there is no GitHub Actions workflow).

- **Production:** every push/merge to `main` builds (`npm run build`, output `dist`) and
  publishes to qualiber.ai.
- **Previews:** every other branch and PR builds automatically. A Cloudflare comment on the PR
  links the branch preview at `https://<branch-with-dashes>.qualiber-web.pages.dev` (e.g.
  `website/logo-update` → `website-logo-update.qualiber-web.pages.dev`) and a per-commit
  snapshot URL. The per-commit URL is frozen to that commit; the branch URL always tracks the
  latest push.
- `main` is not branch-protected — work on a branch and merge via PR.
- If a preview doesn't appear after a push, retrigger it with an empty commit
  (`git commit --allow-empty`); a push has been missed before.

### Domains

- `qualiber.ai` (canonical) and `www.qualiber.ai` are both attached to the Pages project, and
  DNS is on Cloudflare.
- `functions/_middleware.js` 301-redirects `www` → `qualiber.ai` (path and query kept), so the
  site has one address. `astro.config.mjs` `site`, the canonical tags and the sitemap all use
  the apex. Other hosts, including `*.pages.dev` previews, pass straight through.

### Contact form (Formspree)

The demo form in `src/pages/index.astro` (`FORMSPREE_ENDPOINT`) posts to a Formspree form and
stays on-page; a honeypot field (`_gotcha`) filters bots. Submissions are emailed to the
address set in the Formspree form settings. The privacy page names Formspree as the processor —
keep it in sync if the form provider changes.

### Email — hello@qualiber.ai

Mail for `qualiber.ai` is hosted on **Zoho** (the domain's MX, SPF and verification records
point at Zoho). It is *not* Cloudflare Email Routing. Manage the mailbox and any aliases in
Zoho; manage DNS records in Cloudflare.

### Analytics

There is none, and `privacy.astro` says so. If analytics are ever added, update the privacy
policy in the same change.

---

## Company / legal notes

- The footer carries only the © Qualiber LLC line (the Qualgraph™ product attribution was removed
  when the site became a company page). ™ is fine pre-registration; use ® only after a granted USPTO mark.
- Register/hold `qualiber.ai` under the LLC with WHOIS privacy.
- **Do not** add a "Patent pending" line until a provisional is actually filed.
