// Rasterize the OG social card (SVG) to a 1200×630 PNG using sharp.
// Run: node scripts/build-og.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(join(here, 'og-card.svg'));
const out = join(here, '..', 'public', 'og.png');

await sharp(svg, { density: 144 })
  .resize(1200, 630)
  .png()
  .toFile(out);

console.log('wrote', out);
