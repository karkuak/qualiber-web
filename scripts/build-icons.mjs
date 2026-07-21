// Generate raster favicons + apple-touch-icon from the brand mark SVG.
// Run: node scripts/build-icons.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const pub = join(here, '..', 'public');
const svg = readFileSync(join(pub, 'favicon.svg'));

// Small favicon fallback for browsers that don't take SVG icons.
await sharp(svg, { density: 384 }).resize(32, 32).png().toFile(join(pub, 'favicon-32.png'));

// iOS home-screen icon. Full-bleed on the brand ground — iOS applies its own
// rounding, so a square canvas avoids a double-rounded corner.
await sharp(svg, { density: 768 })
  .resize(180, 180)
  .flatten({ background: '#171F29' })
  .png()
  .toFile(join(pub, 'apple-touch-icon.png'));

console.log('wrote favicon-32.png + apple-touch-icon.png');
