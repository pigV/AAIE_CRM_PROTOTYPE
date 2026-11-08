/* Compares the prototype student field schema against fields.py (exported to source-schema.json). */
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '..');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'student-data.js'), 'utf8'), ctx);
const source = JSON.parse(fs.readFileSync(path.join(root, 'qa', 'source-schema.json'), 'utf8'));
const proto = vm.runInContext('STU_SECTIONS', ctx);

const diffs = [];
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
if (source.sections.length !== proto.length) diffs.push(`section count ${source.sections.length} vs ${proto.length}`);
source.sections.forEach((sec, i) => {
  const p = proto[i] || [];
  if (sec[0] !== p[0]) diffs.push(`section ${i} id ${sec[0]} vs ${p[0]}`);
  if (sec[1] !== p[1]) diffs.push(`section ${i} title ${sec[1]} vs ${p[1]}`);
  if (sec[2].length !== (p[2] || []).length) diffs.push(`section ${sec[0]} field count ${sec[2].length} vs ${(p[2] || []).length}`);
  sec[2].forEach((f, j) => {
    const q = (p[2] || [])[j] || [];
    if (!same(f, q)) diffs.push(`section ${sec[0]} field ${j} ${JSON.stringify(f)} vs ${JSON.stringify(q)}`);
  });
});
const mapSize = vm.runInContext('Object.keys(STU_FIELD_MAP).length', ctx);
const sourceCount = source.sections.reduce((n, s) => n + s[2].length, 0);
if (mapSize !== sourceCount) diffs.push(`FIELD_MAP ${mapSize} vs ${sourceCount}`);

const consts = {
  year: ['STU_YEAR_LEVELS', source.year],
  applying: ['STU_APPLYING_YEAR_LEVELS', source.applying],
};
Object.entries(consts).forEach(([name, [expr, expected]]) => {
  const actual = vm.runInContext(expr, ctx);
  if (!same(actual, expected)) diffs.push(`${name} differs: ${JSON.stringify(actual)} vs ${JSON.stringify(expected)}`);
});

console.log(`source sections: ${source.sections.length}, fields: ${sourceCount}`);
console.log(`prototype sections: ${proto.length}, fields: ${mapSize}`);
console.log(diffs.length ? 'DIFFS:\n' + diffs.join('\n') : 'FIELD SCHEMA EXACT MATCH');
fs.writeFileSync(path.join(root, 'qa', 'field-parity-results.json'), JSON.stringify({ sourceCount, mapSize, diffs }, null, 2), 'utf8');
process.exit(diffs.length ? 1 : 0);
