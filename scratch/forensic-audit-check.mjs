import fs from 'node:fs';
import path from 'node:path';

console.log('=== FORENSIC INTEGRITY AUDIT SCRIPT ===');

// 1. Recursive file collector
function getFiles(dir, exts = ['.ts', '.tsx']) {
  let res = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '.agents', '.expo', 'scratch'].includes(item)) {
        res = res.concat(getFiles(full, exts));
      }
    } else if (exts.some(e => full.endsWith(e))) {
      res.push(full);
    }
  }
  return res;
}

const allSrcFiles = getFiles('./src');
console.log(`Auditing ${allSrcFiles.length} source files in src/...`);

// 2. Facade and Dummy implementation detection
const facadeViolations = [];
for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Check for NotImplementedError or similar placeholders
  if (content.includes('NotImplementedError') || content.includes('throw new Error("Not implemented') || content.includes('TODO: implement')) {
    facadeViolations.push({ file, reason: 'Contains NotImplemented placeholder' });
  }

  // Check for empty functions that return dummy constant in place of real logic
  const dummyReturns = content.match(/function\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*:\s*[a-zA-Z0-9_]+\s*\{\s*return\s+(true|false|null|undefined|0|""|'');?\s*\}/g);
  if (dummyReturns) {
    facadeViolations.push({ file, reason: `Potential dummy function: ${dummyReturns.join(', ')}` });
  }
}
console.log(`Facade violations found: ${facadeViolations.length}`);

// 3. Check theme reactivity in UI components and screens
const screensAndComponents = allSrcFiles.filter(f => 
  (f.includes('/components/') || f.includes('/app/')) &&
  !f.includes('+html') &&
  !f.endsWith('tokens.ts')
);

const missingThemeFiles = [];
for (const file of screensAndComponents) {
  const content = fs.readFileSync(file, 'utf8');
  const hasUseTheme = content.includes('useTheme(') || content.includes('useThemeColor(') || content.includes('useThemedStyles(');
  const importsStaticColors = /import\s*\{[^}]*\bcolors\b[^}]*\}\s*from\s*['"]@\/theme\/tokens['"]/.test(content);
  
  if (importsStaticColors && !hasUseTheme) {
    missingThemeFiles.push(file);
  }
}
console.log(`Components/Screens importing static colors without dynamic theme: ${missingThemeFiles.length}`);
missingThemeFiles.forEach(f => console.log(`  - ${f}`));

// 4. Check GlassTabBar R1 implementation
const glassTabBarContent = fs.readFileSync('./src/components/layout/glass-tab-bar.tsx', 'utf8');
const glassSurfaceContent = fs.readFileSync('./src/components/ui/glass-surface.tsx', 'utf8');

const r1Checks = {
  tabBarUsesDynamicTheme: glassTabBarContent.includes('useTheme()'),
  tabBarUsesInactiveToken: glassTabBarContent.includes('colors.tabBarInactive'),
  tabBarGlassSurfaceLightScheme: glassTabBarContent.includes('colorScheme="light"') || glassTabBarContent.includes("colorScheme={'light'}"),
  tabBarGlassSurfaceWhiteTint: glassTabBarContent.includes('tintColor="rgba(255, 255, 255, 0.40)"'),
  glassSurfaceHasLightDefault: glassSurfaceContent.includes("colorScheme = 'light'") || glassSurfaceContent.includes("colorScheme={colorScheme ?? 'light'}"),
  glassSurfaceHasWhiteTintDefault: glassSurfaceContent.includes("tintColor = 'rgba(255, 255, 255, 0.40)'") || glassSurfaceContent.includes("tintColor={tintColor ?? 'rgba(255, 255, 255, 0.40)'}"),
  darkColorsGlassOpacity: fs.readFileSync('./src/theme/tokens.ts', 'utf8').includes("glass: 'rgba(255, 255, 255, 0.88)'"),
};

console.log('\nR1 Glass Tab Bar Checks:', r1Checks);

// 5. Check Profile Switcher
const profileContent = fs.readFileSync('./src/app/(app)/(tabs)/profile.tsx', 'utf8');
const profileChecks = {
  hasModeState: profileContent.includes('mode') && profileContent.includes('setMode'),
  hasThreeModes: profileContent.includes("'system'") && profileContent.includes("'light'") && profileContent.includes("'dark'"),
  callsSetMode: profileContent.includes('setMode('),
};
console.log('\nProfile Switcher Checks:', profileChecks);

console.log('\n=== AUDIT FINISHED ===');
