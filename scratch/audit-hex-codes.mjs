import fs from 'node:fs';
import path from 'node:path';

function findFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'theme') {
        results = results.concat(findFiles(full));
      }
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      results.push(full);
    }
  }
  return results;
}

const files = findFiles('./src');
const hexRegex = /#([0-9a-fA-F]{3,8})\b/g;

console.log("Auditing hardcoded hex colors across src/ (outside theme)...");
const findings = [];

for (const file of files) {
  // skip mock data or test files
  if (file.includes('src/data/') || file.includes('sheet-test')) continue;
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // If the line defines a style or color
    const matches = line.match(hexRegex);
    if (matches) {
      findings.push({ file, lineNum: idx + 1, line: line.trim(), matches });
    }
  });
}

console.log(`Found ${findings.length} occurrences of hex codes in src/`);
findings.forEach(f => console.log(`${f.file}:${f.lineNum} -> ${f.matches.join(', ')} | ${f.line}`));
