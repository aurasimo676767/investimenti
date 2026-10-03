const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });
for (const name of ['index.html', 'styles.css', 'favicon.svg', 'tr-import.js', 'research.js', 'experience.js', 'app.js']) {
  fs.copyFileSync(path.join(root, name), path.join(dist, name));
}
console.log('Built static site in dist/.');
