// Convert a few glyphs of a TTF into the typeface JSON that three's FontLoader reads.
// Usage: node scripts/typeface.mjs <font.ttf> <chars> <out.json>
// TrueType outer contours run clockwise (y up), which is what three's toShapes() expects.
import fs from 'node:fs';
import opentype from 'opentype.js';

const [file, chars = 'Joshua', out = 'src/hero/gloock-joshua.json'] = process.argv.slice(2);
if (!file) { console.error('usage: node scripts/typeface.mjs <font.ttf> <chars> <out.json>'); process.exit(1); }
const font = opentype.parse(fs.readFileSync(file).buffer);
const r = (n) => Math.round(n);
const glyphs = {};
for (const ch of new Set(chars)) {
  const g = font.charToGlyph(ch);
  let o = '';
  for (const c of g.path.commands) {
    if (c.type === 'M') o += `m ${r(c.x)} ${r(c.y)} `;
    else if (c.type === 'L') o += `l ${r(c.x)} ${r(c.y)} `;
    else if (c.type === 'Q') o += `q ${r(c.x)} ${r(c.y)} ${r(c.x1)} ${r(c.y1)} `;          // end, control
    else if (c.type === 'C') o += `b ${r(c.x)} ${r(c.y)} ${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)} `; // end, c1, c2
  }
  const bb = g.getBoundingBox();
  glyphs[ch] = { ha: r(g.advanceWidth), x_min: r(bb.x1), x_max: r(bb.x2), o: o.trim() };
}
const json = {
  glyphs,
  familyName: font.names.fontFamily?.en || 'Gloock',
  ascender: font.ascender, descender: font.descender,
  underlinePosition: font.tables.post.underlinePosition, underlineThickness: font.tables.post.underlineThickness,
  boundingBox: { xMin: font.tables.head.xMin, yMin: font.tables.head.yMin, xMax: font.tables.head.xMax, yMax: font.tables.head.yMax },
  resolution: font.unitsPerEm,
  original_font_information: { format: 0, copyright: 'Gloock, SIL Open Font License 1.1', fontFamily: 'Gloock' },
  cssFontWeight: 'normal', cssFontStyle: 'normal',
};
fs.writeFileSync(out, JSON.stringify(json));
console.log(`wrote ${out}: ${Object.keys(glyphs).join('')} (${fs.statSync(out).size} bytes)`);
