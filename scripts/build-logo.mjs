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
  INK_ON_LIGHT, INK_ON_DARK, VB_MARK, VB_STACKED,
  gradient, markBody, stackedBody, svgDoc,
} from '../src/lib/logo.mjs';

const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const write = (name, s) => writeFileSync(join(pub, name), s + '\n');

// Favicon: 64-unit tile, mark ~50 units wide, centred.
const s = 50 / 855;
write('favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs>${gradient('f')}</defs>` +
  `<rect width="64" height="64" rx="12" fill="#171F29"/>` +
  `<g transform="translate(7 ${(64 - 622 * s) / 2}) scale(${s}) translate(-200 -214)">${markBody(INK_ON_DARK, 'f')}</g></svg>`);

write('qualiber-mark.svg', svgDoc(VB_MARK, markBody(INK_ON_LIGHT, 'm'), 'm'));
write('qualiber-mark-on-dark.svg', svgDoc(VB_MARK, markBody(INK_ON_DARK, 'm'), 'm'));
write('qualiber-logo.svg', svgDoc(VB_STACKED, stackedBody(INK_ON_LIGHT, 'l'), 'l'));
write('qualiber-logo-on-dark.svg', svgDoc(VB_STACKED, stackedBody(INK_ON_DARK, 'l'), 'l'));

console.log('wrote favicon.svg + qualiber-mark(.on-dark).svg + qualiber-logo(-on-dark).svg');
