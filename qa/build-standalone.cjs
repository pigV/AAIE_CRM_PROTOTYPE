/* Builds the single-file demo by inlining every local asset from index.html. */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

let html = read('index.html');
const css = read('styles.css');
if (css.includes('</style')) throw new Error('styles.css contains </style');

html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>\n' + css + '\n</style>');

const scripts = ['data.js', 'student-data.js', 'app.js', 'student-module.js'];
for (const file of scripts) {
  const tag = '<script src="' + file + '"></script>';
  if (!html.includes(tag)) throw new Error('missing script tag for ' + file);
  const code = read(file);
  if (code.includes('</script')) throw new Error(file + ' contains </script');
  html = html.replace(tag, '<script>\n' + code + '\n</script>');
}

if (/src="|href="styles\.css/.test(html)) {
  const leftovers = html.match(/src="[^"]+"|href="[^"]+\.css"/g) || [];
  if (leftovers.length) throw new Error('external assets remain: ' + leftovers.join(', '));
}

fs.writeFileSync(path.join(root, 'crm-redesign-demo.html'), html, 'utf8');
console.log('built crm-redesign-demo.html (' + html.length + ' bytes)');
