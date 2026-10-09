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

const srcFiles = findFiles('./src');
console.log(`Found ${srcFiles.length} files in src/`);

const issues = [];

for (const file of srcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  // Check if it imports colors from tokens
  const importsStaticColors = /import\s*\{[^}]*\bcolors\b[^}]*\}\s*from\s*['"](@\/theme\/tokens|\.\.?\/.*theme\/tokens)['"]/.test(content);
  const usesUseTheme = /useTheme\s*\(/.test(content);
  const usesUseThemeColor = /useThemeColor\s*\(/.test(content);
  const usesUseThemedStyles = /useThemedStyles\s*\(/.test(content);

  const hasDynamicTheme = usesUseTheme || usesUseThemeColor || usesUseThemedStyles;

  // If file defines a component (JSX or export function)
  const isComponentOrScreen = (file.includes('/components/') || file.includes('/app/')) && !file.includes('_layout') && !file.includes('+html');

  if (importsStaticColors && !hasDynamicTheme && isComponentOrScreen) {
    issues.push({
      file,
      type: 'STATIC_COLORS_WITHOUT_USETHEME',
      detail: 'Imports static `colors` from tokens and does NOT use useTheme/useThemeColor/useThemedStyles'
    });
  }

  // Also check if any component has hardcoded colors like #HEX or rgba
  const hexMatches = content.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g) || [];
  // Exclude tokens.ts itself
  if (!file.endsWith('tokens.ts')) {
    // filter out allowed or non-theme hex colors if any
    if (hexMatches.length > 0) {
      // console.log(`[HEX] ${file}: ${hexMatches.join(', ')}`);
    }
  }
}

console.log(`Found ${issues.length} components using static colors without dynamic theme:`);
issues.forEach(iss => console.log(` - ${iss.file}: ${iss.detail}`));
