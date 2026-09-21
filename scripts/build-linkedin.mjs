// Build LinkedIn assets from SVG sources.
//   - qualiber-linkedin-logo.png : 1000×1000 full-bleed square company logo (dark ground)
//   - qualiber-linkedin-logo-light.png : same on a light ground, for light contexts
// Run: node scripts/build-linkedin.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { INK_ON_LIGHT, INK_ON_DARK, gradient, stackedBody } from '../src/lib/logo.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const pub = join(here, '..', 'public');

// Full-bleed square (LinkedIn rounds it itself); stacked lockup, 300 of 400 units wide.
const k = 300 / 865;
const square = (ground, ink) => Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs>${gradient('li')}</defs>` +
  `<rect width="400" height="400" fill="${ground}"/>` +
  `<g transform="translate(50 ${(400 - 846 * k) / 2}) scale(${k}) translate(-195 -214)">${stackedBody(ink, 'li')}</g></svg>`,
);

// Dark version (recommended default).
await sharp(square('#171F29', INK_ON_DARK), { density: 400 })
  .resize(1000, 1000)
  .png()
  .toFile(join(pub, 'qualiber-linkedin-logo.png'));

// Light version for light contexts.
await sharp(square('#FFFFFF', INK_ON_LIGHT), { density: 400 })
  .resize(1000, 1000)
  .png()
  .toFile(join(pub, 'qualiber-linkedin-logo-light.png'));

// Company page cover / banner — LinkedIn spec 1128×191 (rendered 2× for retina).
const bannerSvg = readFileSync(join(here, 'linkedin-banner.svg'));
await sharp(bannerSvg, { density: 220 })
  .resize(2256, 382)
  .png()
  .toFile(join(pub, 'qualiber-linkedin-banner.png'));

console.log('wrote qualiber-linkedin-logo.png + qualiber-linkedin-logo-light.png + qualiber-linkedin-banner.png');
