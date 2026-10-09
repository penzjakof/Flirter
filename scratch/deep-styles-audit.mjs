import fs from 'node:fs';
import path from 'node:path';

function findFiles(dir, exts = ['.ts', '.tsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.agents') {
        results = results.concat(findFiles(fullPath, exts));
      }
    } else if (exts.some(ext => file.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = findFiles('./src');
const deepIssues = [];

for (const file of files) {
  if (file.endsWith('tokens.ts')) continue;
  const content = fs.readFileSync(file, 'utf8');

  // Look for StyleSheet.create
  const styleMatch = content.match(/StyleSheet\.create\(\s*\{([\s\S]*)\}\s*\);?\s*$/);
  if (!styleMatch) continue;

  const styleBody = styleMatch[1];
  
  // Find all keys in StyleSheet that reference `colors.`
  // e.g. foo: { backgroundColor: colors.surface }
  const regex = /(\w+)\s*:\s*\{([^}]+)\}/g;
  let match;
  while ((match = regex.exec(styleBody)) !== null) {
    const styleKey = match[1];
    const styleContent = match[2];
    if (styleContent.includes('colors.')) {
      // Check if this styleKey is overridden in the JSX or if it's used as is: style={styles.styleKey}
      // Look for references: styles.styleKey
      // If it's used as `style={styles.styleKey}` without `[styles.styleKey, ...]` or without dynamic style
      const directUse = new RegExp(`style=\\{\\s*styles\\.${styleKey}\\s*\\}`, 'g').test(content);
      const arrayWithoutOverride = new RegExp(`style=\\{\\s*\\[[^\\]]*styles\\.${styleKey}[^\\]]*\\]\\s*\\}`, 'g');
      
      const inJSX = content.includes(`styles.${styleKey}`);
      deepIssues.push({
        file,
        styleKey,
        styleContent: styleContent.trim().replace(/\s+/g, ' '),
        directUse,
        inJSX,
      });
    }
  }
}

console.log(`Checking StyleSheet.create usages of static colors: total found ${deepIssues.length}`);
for (const iss of deepIssues) {
  console.log(`${iss.file} -> styles.${iss.styleKey}: ${iss.styleContent} (directUse: ${iss.directUse})`);
}
