import fs from 'node:fs';
import path from 'node:path';

function findTsxFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findTsxFiles(full));
    } else if (entry.name.endsWith('.tsx')) {
      results.push(full);
    }
  }
  return results;
}

const allTsx = findTsxFiles('./src');
console.log(`Total TSX files in src/: ${allTsx.length}`);

let themed = 0;
let unthemed = [];

for (const file of allTsx) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('useTheme(') || content.includes('useThemeColor(') || content.includes('useThemedStyles(')) {
    themed++;
  } else {
    unthemed.push(file);
  }
}

console.log(`Themed components/screens: ${themed}`);
console.log(`Unthemed TSX files: ${unthemed.length}`);
console.log('List of unthemed files:');
unthemed.forEach(f => console.log(' - ' + f));
