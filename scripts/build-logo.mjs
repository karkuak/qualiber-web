// Write the standalone logo files in /public from the single source in src/lib/logo.mjs.
//   favicon.svg                 — Q mark on a rounded dark tile (feeds build-icons.mjs)
//   qualiber-mark.svg           — mark only, transparent, for light backgrounds
//   qualiber-mark-on-dark.svg   — mark only, transparent, for dark backgrounds
//   qualiber-logo.svg           — stacked lockup (as supplied), for light backgrounds
//   qualiber-logo-on-dark.svg   — stacked lockup, for dark backgrounds
// Run: node scripts/build-logo.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  ON_LIGHT, ON_DARK, VB_MARK, VB_STACKED,
  markBody, stackedBody, svgDoc,
} from '../src/lib/logo.mjs';

const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const write = (name, s) => writeFileSync(join(pub, name), s + '\n');

// Favicon: 64-unit tile, mark ~50 units wide, centred.
const s = 50 / 855;
write('favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
  `<rect width="64" height="64" rx="12" fill="#171F29"/>` +
  `<g transform="translate(7 ${(64 - 622 * s) / 2}) scale(${s}) translate(-200 -214)">${markBody(ON_DARK)}</g></svg>`);

write('qualiber-mark.svg', svgDoc(VB_MARK, markBody(ON_LIGHT)));
write('qualiber-mark-on-dark.svg', svgDoc(VB_MARK, markBody(ON_DARK)));
write('qualiber-logo.svg', svgDoc(VB_STACKED, stackedBody(ON_LIGHT)));
write('qualiber-logo-on-dark.svg', svgDoc(VB_STACKED, stackedBody(ON_DARK)));

console.log('wrote favicon.svg + qualiber-mark(.on-dark).svg + qualiber-logo(-on-dark).svg');
