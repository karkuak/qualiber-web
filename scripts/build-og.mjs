// Rasterize the OG social card (SVG) to a 1200×630 PNG using sharp.
// The brand lockup is injected from src/lib/logo.mjs (single source of truth).
// Run: node scripts/build-og.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ON_DARK, markBody, horizontalBody } from '../src/lib/logo.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'public', 'og.png');

// Lockup 46px tall at (78, 52).
const k = 46 / 622;
const lockup =
  `<g transform="translate(78 52) scale(${k}) translate(-200 -214)">${horizontalBody(ON_DARK)}</g>`;
// Mark, right side: 840 wide of the 1200 card, centred vertically on the headline block.
const mk = 300 / 855;
const mark = `<g transform="translate(830 ${(630 - 622 * mk) / 2 - 8}) scale(${mk}) translate(-200 -214)">${markBody(ON_DARK)}</g>`;
const svg = Buffer.from(
  readFileSync(join(here, 'og-card.svg'), 'utf8').replace('{{LOGO_H}}', lockup).replace('{{LOGO_MARK}}', mark),
);

await sharp(svg, { density: 144 })
  .resize(1200, 630)
  .png()
  .toFile(out);

console.log('wrote', out);
