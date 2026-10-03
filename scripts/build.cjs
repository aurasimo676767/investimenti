const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });
for (const name of ['index.html', 'styles.css', 'favicon.svg', 'tr-import.js', 'research.js', 'experience.js', 'catalogue.js', 'charts.js', 'app.js']) {
  fs.copyFileSync(path.join(root, name), path.join(dist, name));
}
fs.copyFileSync(path.join(root, 'node_modules/lightweight-charts/dist/lightweight-charts.standalone.production.js'), path.join(dist, 'chart-library.js'));
fs.copyFileSync(path.join(root, 'node_modules/lightweight-charts/LICENSE'), path.join(dist, 'chart-library-LICENSE.txt'));
console.log('Built static site in dist/.');
