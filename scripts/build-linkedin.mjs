// Build LinkedIn assets from SVG sources.
//   - qualiber-linkedin-logo.png : 1000×1000 full-bleed square company logo (dark ground)
//   - qualiber-linkedin-logo-light.png : same on a light ground, for light contexts
// Run: node scripts/build-linkedin.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const pub = join(here, '..', 'public');
const darkSvg = readFileSync(join(here, 'linkedin-logo.svg'));

// Dark version (recommended default).
await sharp(darkSvg, { density: 400 })
  .resize(1000, 1000)
  .png()
  .toFile(join(pub, 'qualiber-linkedin-logo.png'));

// Light version: swap the ground + ink ring for light contexts.
const lightSvg = Buffer.from(
  darkSvg
    .toString()
    .replace('fill="#171F29"', 'fill="#F1F4F4"')      // ground
    .replace('stroke="#EDF1F4"', 'stroke="#12181F"')  // ring -> ink
    .replace('stroke="#35D0A5"', 'stroke="#0F9E7C"')  // tail -> deeper jade
    .replace('fill="#35D0A5"', 'fill="#0F9E7C"'),     // node -> deeper jade
);
await sharp(lightSvg, { density: 400 })
  .resize(1000, 1000)
  .png()
  .toFile(join(pub, 'qualiber-linkedin-logo-light.png'));

console.log('wrote qualiber-linkedin-logo.png + qualiber-linkedin-logo-light.png');
