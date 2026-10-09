/**
 * Adversarial Transitions, State Persistence & Theme Integrity Test Harness
 * Challenger 2 (Theme Transitions & State Persistence Verifier)
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import ts from 'typescript';

console.log('======================================================================');
console.log('⚡ STARTING ADVERSARIAL THEME TRANSITIONS & PERSISTENCE TEST HARNESS ⚡');
console.log('======================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const findings = [];

function testCase(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
    findings.push({ test: name, error: err.message, stack: err.stack });
  }
}

// -----------------------------------------------------------------------------
// STEP 1: Parse and Load Tokens directly from src/theme/tokens.ts
// -----------------------------------------------------------------------------
console.log('--- 1. LOADING & COMPILING TOKENS (src/theme/tokens.ts) ---');

const tokensFilePath = path.resolve('src/theme/tokens.ts');
const tokensSource = fs.readFileSync(tokensFilePath, 'utf8');

// Transpile tokens.ts to CommonJS/ESM executable in node
const transpiledTokens = ts.transpileModule(tokensSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
});

// Create mock module execution environment
const tokensModuleExports = {};
const mockTokensFn = new Function('exports', 'require', 'module', transpiledTokens.outputText);
mockTokensFn(tokensModuleExports, (mod) => {
  if (mod === 'react-native') {
    return {
      Platform: {
        select: (obj) => obj.default || obj.web || null,
        OS: 'ios',
      },
    };
  }
  throw new Error(`Unexpected import in tokens.ts: ${mod}`);
}, { exports: tokensModuleExports });

const { lightColors, darkColors, colors, spacing, radius, sizes, typography, shadows } = tokensModuleExports;

// -----------------------------------------------------------------------------
// SUITE 1: Dynamic Mode Switching & Resolution Logic (Oracle Test)
// -----------------------------------------------------------------------------
console.log('\n--- 2. DYNAMIC MODE SWITCHING & THEME RESOLUTION ORACLE ---');

// Pure resolution function modeled directly after src/theme/use-theme.ts
function resolveTheme(mode, systemScheme) {
  if (mode === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return mode;
}

function getThemeResult(mode, systemScheme) {
  const theme = resolveTheme(mode, systemScheme);
  const isDark = theme === 'dark';
  const resolvedColors = isDark ? darkColors : lightColors;
  return { mode, theme, isDark, colors: resolvedColors };
}

testCase('System mode with systemScheme="light" resolves to light theme', () => {
  const res = getThemeResult('system', 'light');
  assert.strictEqual(res.theme, 'light');
  assert.strictEqual(res.isDark, false);
  assert.strictEqual(res.colors, lightColors);
});

testCase('System mode with systemScheme="dark" resolves to dark theme', () => {
  const res = getThemeResult('system', 'dark');
  assert.strictEqual(res.theme, 'dark');
  assert.strictEqual(res.isDark, true);
  assert.strictEqual(res.colors, darkColors);
});

testCase('System mode with undefined/null systemScheme safely falls back to light', () => {
  const resNull = getThemeResult('system', null);
  assert.strictEqual(resNull.theme, 'light');
  assert.strictEqual(resNull.isDark, false);
  assert.strictEqual(resNull.colors, lightColors);

  const resUndef = getThemeResult('system', undefined);
  assert.strictEqual(resUndef.theme, 'light');
  assert.strictEqual(resUndef.isDark, false);
  assert.strictEqual(resUndef.colors, lightColors);
});

testCase('User override "light" strictly overrides systemScheme="dark"', () => {
  const res = getThemeResult('light', 'dark');
  assert.strictEqual(res.theme, 'light');
  assert.strictEqual(res.isDark, false);
  assert.strictEqual(res.colors, lightColors);
});

testCase('User override "dark" strictly overrides systemScheme="light"', () => {
  const res = getThemeResult('dark', 'light');
  assert.strictEqual(res.theme, 'dark');
  assert.strictEqual(res.isDark, true);
  assert.strictEqual(res.colors, darkColors);
});

testCase('Cyclic transition sequence (system[L] -> dark -> light -> system[D] -> system[L])', () => {
  let mode = 'system';
  let systemScheme = 'light';

  // 1. Initial system light
  let res = getThemeResult(mode, systemScheme);
  assert.strictEqual(res.theme, 'light');

  // 2. User switches to dark
  mode = 'dark';
  res = getThemeResult(mode, systemScheme);
  assert.strictEqual(res.theme, 'dark');
  assert.strictEqual(res.isDark, true);

  // 3. User switches to light
  mode = 'light';
  res = getThemeResult(mode, systemScheme);
  assert.strictEqual(res.theme, 'light');
  assert.strictEqual(res.isDark, false);

  // 4. Time passes, system becomes dark, user reverts to system mode
  systemScheme = 'dark';
  mode = 'system';
  res = getThemeResult(mode, systemScheme);
  assert.strictEqual(res.theme, 'dark');
  assert.strictEqual(res.isDark, true);

  // 5. System transitions back to light while in system mode
  systemScheme = 'light';
  res = getThemeResult(mode, systemScheme);
  assert.strictEqual(res.theme, 'light');
  assert.strictEqual(res.isDark, false);
});

testCase('Adversarial mode input resilience (unexpected mode values safely fallback)', () => {
  // If an unexpected or corrupted mode string slips through
  const resCorrupted = getThemeResult('high-contrast', 'dark');
  assert.strictEqual(resCorrupted.isDark, false);
  assert.strictEqual(resCorrupted.colors, lightColors);
});

// -----------------------------------------------------------------------------
// SUITE 2: Storage Persistence & Contract Verification (Zustand Persist)
// -----------------------------------------------------------------------------
console.log('\n--- 3. STORAGE PERSISTENCE & CONTRACT INTEGRITY ---');

// Contract check: STORAGE_KEYS in src/lib/storage.ts
const storageTsPath = path.resolve('src/lib/storage.ts');
const storageTsContent = fs.readFileSync(storageTsPath, 'utf8');

testCase('Contract Audit: STORAGE_KEYS.theme constant presence in storage.ts', () => {
  const hasThemeKey = /theme\s*:\s*['"]flirter\.theme\.v1['"]/.test(storageTsContent);
  if (!hasThemeKey) {
    throw new Error(
      'MISSING_KEY: STORAGE_KEYS in src/lib/storage.ts does NOT contain "theme: \'flirter.theme.v1\'". ' +
      'PROJECT.md requires STORAGE_KEYS.theme = \'flirter.theme.v1\'.'
    );
  }
});

// Emulated storage test
function createMockStorageEngine() {
  const memory = new Map();
  return {
    memory,
    storage: {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, val) => memory.set(key, val),
      removeItem: (key) => memory.delete(key),
    },
  };
}

testCase('Zustand persist store saves mode correctly under "flirter.theme.v1"', async () => {
  const { memory, storage } = createMockStorageEngine();

  const store = create()(
    persist(
      (set) => ({
        mode: 'system',
        setMode: (mode) => set({ mode }),
      }),
      {
        name: 'flirter.theme.v1',
        storage: createJSONStorage(() => storage),
      }
    )
  );

  // Initially system
  assert.strictEqual(store.getState().mode, 'system');

  // Change to dark
  store.getState().setMode('dark');
  assert.strictEqual(store.getState().mode, 'dark');

  // Check serialized storage value
  const rawSaved = memory.get('flirter.theme.v1');
  assert(rawSaved, 'Storage must contain saved entry for flirter.theme.v1');
  const parsed = JSON.parse(rawSaved);
  assert.strictEqual(parsed.state.mode, 'dark');
  assert.strictEqual(parsed.version, 0);

  // Change to light
  store.getState().setMode('light');
  assert.strictEqual(store.getState().mode, 'light');
  const updatedParsed = JSON.parse(memory.get('flirter.theme.v1'));
  assert.strictEqual(updatedParsed.state.mode, 'light');
});

testCase('Zustand persist store restores state across separate instances', async () => {
  const { memory, storage } = createMockStorageEngine();

  // Populate pre-existing storage (user previously chose 'dark')
  memory.set('flirter.theme.v1', JSON.stringify({
    state: { mode: 'dark' },
    version: 0,
  }));

  // Create new store instance (app reboot)
  const store = create()(
    persist(
      (set) => ({
        mode: 'system',
        setMode: (mode) => set({ mode }),
      }),
      {
        name: 'flirter.theme.v1',
        storage: createJSONStorage(() => storage),
      }
    )
  );

  assert.strictEqual(
    store.getState().mode,
    'dark',
    'State must rehydrate with "dark" from storage on boot'
  );
});

testCase('Adversarial Persistence: corrupted JSON in storage gracefully handled', async () => {
  const { memory, storage } = createMockStorageEngine();

  // Malformed JSON data in storage
  memory.set('flirter.theme.v1', '{malformed_json: true, ...');

  let store;
  let didCrash = false;
  try {
    store = create()(
      persist(
        (set) => ({
          mode: 'system',
          setMode: (mode) => set({ mode }),
        }),
        {
          name: 'flirter.theme.v1',
          storage: createJSONStorage(() => storage),
        }
      )
    );
  } catch (err) {
    didCrash = true;
  }

  assert.strictEqual(didCrash, false, 'Store instantiation must not crash on malformed storage JSON');
  assert.strictEqual(store.getState().mode, 'system', 'Mode must fall back to default "system"');
});

testCase('Adversarial Persistence: invalid state object in storage gracefully handled', async () => {
  const { memory, storage } = createMockStorageEngine();

  // Valid JSON, but state is null or missing mode
  memory.set('flirter.theme.v1', JSON.stringify({ state: null }));

  const store = create()(
    persist(
      (set) => ({
        mode: 'system',
        setMode: (mode) => set({ mode }),
      }),
      {
        name: 'flirter.theme.v1',
        storage: createJSONStorage(() => storage),
      }
    )
  );

  assert.strictEqual(store.getState().mode, 'system', 'Mode must safely fallback to default "system"');
});

testCase('Adversarial Persistence: throwing storage engine handled in storage.ts', () => {
  assert(
    storageTsContent.includes('catch') && storageTsContent.includes('return memoryStorage'),
    'resolveWebStorage must catch storage access exceptions and fall back to memoryStorage'
  );
});

// -----------------------------------------------------------------------------
// SUITE 3: Token Integrity & Comprehensive Component Token Usage Audit
// -----------------------------------------------------------------------------
console.log('\n--- 4. TOKEN INTEGRITY & 1:1 SYMMETRY ---');

const REQUIRED_TOKENS = [
  'background',
  'surface',
  'surfaceMuted',
  'textPrimary',
  'textSecondary',
  'textOnBrand',
  'textOnMedia',
  'brand',
  'brandPressed',
  'brandSubtle',
  'energyText',
  'energySurface',
  'border',
  'cardBorderSubtle',
  'danger',
  'success',
  'pass',
  'premiumDeep',
  'premiumGold',
  'textOnPremiumMuted',
  'premiumTrack',
  'premiumInk',
  'energyPlusCardBg',
  'energyPlusCardBorder',
  'energyPlusCardText',
  'energyPlusBadgeBg',
  'energyPlusBadgeText',
  'energyTrackBg',
  'glass',
  'glassBorder',
  'glassEdge',
  'glassLens',
  'tabBarInactive',
  'overlay',
  'mediaScrim',
  'transparent',
  'fadeTransparent',
];

testCase('ThemeColors interface defines exactly the expected tokens (37 tokens)', () => {
  const lightKeys = Object.keys(lightColors);
  const darkKeys = Object.keys(darkColors);

  assert.strictEqual(lightKeys.length, REQUIRED_TOKENS.length, `lightColors has ${lightKeys.length} keys, expected ${REQUIRED_TOKENS.length}`);
  assert.strictEqual(darkKeys.length, REQUIRED_TOKENS.length, `darkColors has ${darkKeys.length} keys, expected ${REQUIRED_TOKENS.length}`);

  for (const token of REQUIRED_TOKENS) {
    assert(token in lightColors, `Token "${token}" missing from lightColors`);
    assert(token in darkColors, `Token "${token}" missing from darkColors`);
  }
});

testCase('Exact 1:1 symmetry between lightColors and darkColors keys', () => {
  const lightKeys = Object.keys(lightColors).sort();
  const darkKeys = Object.keys(darkColors).sort();
  assert.deepStrictEqual(lightKeys, darkKeys, 'Keys of lightColors and darkColors must be identical');
});

testCase('No undefined, null, or empty string values in any color tokens', () => {
  for (const [key, val] of Object.entries(lightColors)) {
    assert(typeof val === 'string' && val.length > 0, `lightColors.${key} is invalid: "${val}"`);
  }
  for (const [key, val] of Object.entries(darkColors)) {
    assert(typeof val === 'string' && val.length > 0, `darkColors.${key} is invalid: "${val}"`);
  }
});

testCase('All tokens follow valid color patterns (hex, rgb, rgba, transparent)', () => {
  const colorPattern = /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|transparent)$/;
  for (const [key, val] of Object.entries(lightColors)) {
    assert(colorPattern.test(val), `lightColors.${key} has invalid CSS color syntax: "${val}"`);
  }
  for (const [key, val] of Object.entries(darkColors)) {
    assert(colorPattern.test(val), `darkColors.${key} has invalid CSS color syntax: "${val}"`);
  }
});

// Component token usage audit
console.log('\n--- 5. SCANNING ALL COMPONENTS & SCREENS FOR TOKEN ACCESS INTEGRITY ---');

function getAllSourceFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllSourceFiles(fullPath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const componentFiles = [
  ...getAllSourceFiles(path.resolve('src/components')),
  ...getAllSourceFiles(path.resolve('src/app')),
];

testCase(`Audit all ${componentFiles.length} UI components and screens for undefined token access`, () => {
  const tokenSet = new Set(REQUIRED_TOKENS);
  const invalidAccesses = [];

  const colorsDotPattern = /\bcolors\.([a-zA-Z0-9_]+)\b/g;
  const useThemeColorPattern = /useThemeColor\(\s*['"]([a-zA-Z0-9_]+)['"]\s*\)/g;

  for (const filePath of componentFiles) {
    const content = fs.readFileSync(filePath, 'utf8');

    let match;
    while ((match = colorsDotPattern.exec(content)) !== null) {
      const accessedToken = match[1];
      if (['mode', 'theme', 'isDark', 'setMode'].includes(accessedToken)) continue;

      if (!tokenSet.has(accessedToken)) {
        invalidAccesses.push({
          file: path.relative(process.cwd(), filePath),
          token: accessedToken,
          expression: match[0],
        });
      }
    }

    while ((match = useThemeColorPattern.exec(content)) !== null) {
      const accessedToken = match[1];
      if (!tokenSet.has(accessedToken)) {
        invalidAccesses.push({
          file: path.relative(process.cwd(), filePath),
          token: accessedToken,
          expression: match[0],
        });
      }
    }
  }

  if (invalidAccesses.length > 0) {
    const details = invalidAccesses.map((a) => `${a.file}: accessed unknown token "${a.token}"`).join('\n');
    throw new Error(`Found ${invalidAccesses.length} invalid token access(es):\n${details}`);
  }
});

// -----------------------------------------------------------------------------
// SUITE 4: Zero-Regression Test for Light Theme Baseline
// -----------------------------------------------------------------------------
console.log('\n--- 6. ZERO-REGRESSION TEST FOR LIGHT THEME BASELINE (1:1 MATCH) ---');

const CODEX_BASELINE = {
  background: '#FAF8F7',
  surface: '#FFFFFF',
  surfaceMuted: '#F3EEF1',
  textPrimary: '#211C24',
  textSecondary: '#6C626C',
  textOnBrand: '#FFFFFF',
  textOnMedia: '#FFFFFF',
  brand: '#B6245A',
  brandPressed: '#9A1D4B',
  brandSubtle: '#F9E7EE',
  energyText: '#765000',
  energySurface: '#FFF1D1',
  border: '#E7E0E5',
  cardBorderSubtle: 'rgba(33, 28, 36, 0.06)',
  danger: '#B3261E',
  success: '#1E7A46',
  pass: '#6C626C',
  premiumDeep: '#3B1232',
  premiumGold: '#F6C445',
  textOnPremiumMuted: 'rgba(255, 255, 255, 0.72)',
  premiumTrack: 'rgba(255, 255, 255, 0.18)',
  premiumInk: '#1C0A18',
  energyPlusCardBg: '#FDF2F6',
  energyPlusCardBorder: '#F3D2DF',
  energyPlusCardText: '#5A122D',
  energyPlusBadgeBg: '#F7DDE6',
  energyPlusBadgeText: '#9A1D4B',
  energyTrackBg: '#EAE5E8',
  glass: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.95)',
  glassEdge: 'rgba(33, 28, 36, 0.07)',
  glassLens: 'rgba(255, 255, 255, 0.96)',
  tabBarInactive: '#403644',
  overlay: 'rgba(33, 28, 36, 0.55)',
  mediaScrim: 'rgba(0, 0, 0, 0.62)',
  transparent: 'transparent',
  fadeTransparent: 'rgba(250, 248, 247, 0)',
};

testCase('Light theme colors match the Codex and design baseline 1:1', () => {
  for (const [key, expectedValue] of Object.entries(CODEX_BASELINE)) {
    const actualValue = lightColors[key];
    assert.strictEqual(
      actualValue,
      expectedValue,
      `Regression in lightColors.${key}: expected "${expectedValue}", got "${actualValue}"`
    );
  }
});

testCase('Exported "colors" is an exact 1:1 alias of "lightColors"', () => {
  assert.strictEqual(
    colors,
    lightColors,
    'Exported "colors" must be identical reference to "lightColors"'
  );
  assert.deepStrictEqual(
    colors,
    CODEX_BASELINE,
    'Exported "colors" must deeply match baseline light colors'
  );
});

testCase('Glass Tab Bar tokens maintain high contrast white frosted glass in both themes', () => {
  assert.strictEqual(lightColors.glass, 'rgba(255, 255, 255, 0.85)');
  assert.strictEqual(lightColors.tabBarInactive, '#403644');
  assert.strictEqual(darkColors.glass, 'rgba(255, 255, 255, 0.88)');
  assert.strictEqual(darkColors.tabBarInactive, '#403644');
  assert.strictEqual(darkColors.glassLens, '#FFFFFF');
});

// -----------------------------------------------------------------------------
// SUITE 5: Theme Hooks Contract & Implementation Verification
// -----------------------------------------------------------------------------
console.log('\n--- 7. THEME HOOKS & CONTRACT EXECUTION VERIFICATION ---');

const useThemeSource = fs.readFileSync(path.resolve('src/theme/use-theme.ts'), 'utf8');

testCase('use-theme.ts exports useTheme, useThemeColor, useThemedStyles', () => {
  assert(useThemeSource.includes('export function useTheme()'), 'useTheme must be exported');
  assert(useThemeSource.includes('export function useThemeColor('), 'useThemeColor must be exported');
  assert(useThemeSource.includes('export function useThemedStyles<T>('), 'useThemedStyles must be exported');
});

testCase('useThemeColor resolves colors dynamically based on useTheme()', () => {
  assert(
    useThemeSource.includes('const { colors } = useTheme();') &&
    useThemeSource.includes('return colors[token];'),
    'useThemeColor must delegate to useTheme().colors'
  );
});

testCase('useThemedStyles wraps style factory in useMemo with proper dependencies', () => {
  assert(
    useThemeSource.includes('useMemo(() => factory(colors, isDark), [factory, colors, isDark])'),
    'useThemedStyles must memoize factory with [factory, colors, isDark]'
  );
});

testCase('Dynamic Style Factory evaluation test with useThemedStyles simulation', () => {
  const dummyFactory = (col, dark) => ({
    container: { backgroundColor: col.background },
    text: { color: col.textPrimary },
    isDark: dark,
  });

  const lightStyle = dummyFactory(lightColors, false);
  assert.strictEqual(lightStyle.container.backgroundColor, '#FAF8F7');
  assert.strictEqual(lightStyle.text.color, '#211C24');
  assert.strictEqual(lightStyle.isDark, false);

  const darkStyle = dummyFactory(darkColors, true);
  assert.strictEqual(darkStyle.container.backgroundColor, '#121013');
  assert.strictEqual(darkStyle.text.color, '#F6F3F7');
  assert.strictEqual(darkStyle.isDark, true);
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`TOTAL ADVERSARIAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('======================================================================');

if (findings.length > 0) {
  console.log('\n⚠️ ADVERSARIAL FINDINGS / DEFECTS DETECTED:');
  findings.forEach((f, idx) => {
    console.log(`\n[Finding #${idx + 1}] ${f.test}`);
    console.log(`  Details: ${f.error}`);
  });
}

// Exit code based on failures
process.exit(failedTests > 0 ? 1 : 0);
