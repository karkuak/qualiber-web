# Qualiber — website

Marketing site for **Qualiber LLC** and its first product, **Qualgraph**. Live at
[qualiber.ai](https://qualiber.ai).

Built with [Astro](https://astro.build). Single landing page + a privacy page,
statically generated, no server required.

---

## Local development

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output → ./dist
npm run preview    # serve the built ./dist locally
```

## Project structure

```
src/
  layouts/Base.astro     # <head>, SEO/OpenGraph meta, no-flash theme script
  pages/
    index.astro          # the landing page (all sections + client scripts)
    privacy.astro        # privacy policy (required — the form collects emails)
    404.astro
  styles/global.css      # design tokens + all component styles (light + dark)
public/
  favicon.svg
  robots.txt
  og.png                 # 1200×630 social share image  ← ADD THIS (see below)
```

## Design system — "Instrument for quality"

- **Neutrals:** cool slate, biased toward the accent (not default grey).
- **Accent:** a single jade — `#35D0A5` (dark) / `#0F9E7C` (light). Used sparingly.
- **Type:** Georgia serif (display) + monospace (utility/telemetry) + system sans (body).
- Fully themed for light & dark via CSS custom properties; user toggle persists in
  `localStorage` and applies before paint.

---

## Go-live runbook (the account/DNS steps)

These require your own accounts and the domain registrar login, so they're done by
hand. Everything is free unless noted.

### 1. Wire up the form (Formspree)

1. Create a free account at [formspree.io](https://formspree.io).
2. New form → copy its endpoint, e.g. `https://formspree.io/f/abcdwxyz`.
3. In `src/pages/index.astro`, replace `FORMSPREE_ENDPOINT`'s
   `https://formspree.io/f/YOUR_FORM_ID` with your endpoint.
4. In Formspree, set the notification email to **hello@qualiber.ai** (step 4 below).

The form submits via AJAX and stays on-page; a honeypot field (`_gotcha`) filters bots.

### 2. Push to GitHub

```bash
git init && git add -A && git commit -m "Qualiber site — initial"
gh repo create qualiber-web --private --source=. --push   # or create via github.com
```

### 3. Deploy on Cloudflare Pages

1. Create a [Cloudflare](https://dash.cloudflare.com) account.
2. **Add a site** → `qualiber.ai`. Cloudflare gives you two nameservers — set these
   at your domain registrar (where you bought qualiber.ai). Propagation: minutes–hours.
3. **Workers & Pages → Create → Pages → Connect to Git** → pick `qualiber-web`.
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy. You'll get a `*.pages.dev` preview URL immediately.
5. **Custom domains** (in the Pages project) → add `qualiber.ai` and `www.qualiber.ai`.
   Cloudflare wires the DNS automatically since the domain is on your account.

Every `git push` to the main branch now redeploys automatically.

### 4. Email — hello@qualiber.ai (Cloudflare Email Routing)

1. In Cloudflare → **Email → Email Routing** → enable.
2. Add a route: `hello@qualiber.ai` → your personal inbox (e.g. Gmail). Confirm the
   verification email Cloudflare sends to that inbox.
3. (Optional, for sending *as* hello@qualiber.ai) set up Gmail "Send mail as" with an
   app password, or upgrade to Google Workspace later.

### 5. Social share image (og.png)

Drop a **1200×630 PNG** at `public/og.png` so links unfurl with a branded card on
Slack / X / LinkedIn. (Ask and this can be generated to match the site.)

---

## Company / legal notes

- Footer attributes the product to **Qualiber LLC** and marks **Qualgraph™** (™ is fine
  pre-registration; use ® only after a granted USPTO mark).
- Register/hold `qualiber.ai` under the LLC with WHOIS privacy.
- **Do not** add a "Patent pending" line until a provisional is actually filed.
