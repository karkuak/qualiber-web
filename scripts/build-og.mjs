// Rasterize the OG social card (SVG) to a 1200×630 PNG using sharp.
// The brand lockup is injected from src/lib/logo.mjs (single source of truth).
// Run: node scripts/build-og.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { INK_ON_DARK, gradient, horizontalBody } from '../src/lib/logo.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'public', 'og.png');

// Lockup 46px tall at (78, 52).
const k = 46 / 622;
const lockup =
  `<defs>${gradient('og')}</defs>` +
  `<g transform="translate(78 52) scale(${k}) translate(-200 -214)">${horizontalBody(INK_ON_DARK, 'og')}</g>`;
const svg = Buffer.from(readFileSync(join(here, 'og-card.svg'), 'utf8').replace('{{LOGO_H}}', lockup));

await sharp(svg, { density: 144 })
  .resize(1200, 630)
  .png()
  .toFile(out);

console.log('wrote', out);
