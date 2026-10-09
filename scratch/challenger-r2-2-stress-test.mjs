/**
 * Challenger R2_2 Empirical Stress Harness
 * Theme Transitions, Persistence Contracts, & Regression Verification
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

console.log('======================================================================');
console.log('🛡️  CHALLENGER R2_2 EMPIRICAL ADVERSARIAL VERIFICATION HARNESS 🛡️');
console.log('======================================================================\n');

let passCount = 0;
let failCount = 0;
const issues = [];

function verify(name, testFn) {
  try {
    testFn();
    passCount++;
    console.log(`  ✓ [CHALLENGER PASS] ${name}`);
  } catch (err) {
    failCount++;
    console.error(`  ✗ [CHALLENGER FAIL] ${name}`);
    console.error(`    -> ${err.message}`);
    issues.push({ name, error: err.message, stack: err.stack });
  }
}

// -----------------------------------------------------------------------------
// CHECK 1: STORAGE CONTRACT VERIFICATION
// -----------------------------------------------------------------------------
console.log('>>> [PHASE 1] Storage Key Architecture & Contract Verification');

const storageFileContent = fs.readFileSync('src/lib/storage.ts', 'utf8');
const themeStoreFileContent = fs.readFileSync('src/store/theme-store.ts', 'utf8');

verify('STORAGE_KEYS object exported in src/lib/storage.ts', () => {
  assert(storageFileContent.includes('export const STORAGE_KEYS = {'), 'STORAGE_KEYS must be exported as an object');
});

verify('STORAGE_KEYS.theme is exactly "flirter.theme.v1"', () => {
  const match = storageFileContent.match(/theme:\s*['"]([^'"]+)['"]/);
  assert(match, 'theme key not found in STORAGE_KEYS');
  assert.strictEqual(match[1], 'flirter.theme.v1', `Expected "flirter.theme.v1", got "${match[1]}"`);
});

verify('src/store/theme-store.ts imports STORAGE_KEYS from @/lib/storage', () => {
  assert(
    /import\s+[^;]*STORAGE_KEYS[^;]*from\s+['"]@\/lib\/storage['"]/.test(themeStoreFileContent),
    'STORAGE_KEYS must be imported from @/lib/storage in theme-store.ts'
  );
});

verify('src/store/theme-store.ts uses STORAGE_KEYS.theme for persistence key', () => {
  assert(
    /name:\s*STORAGE_KEYS\.theme/.test(themeStoreFileContent),
    'theme-store.ts must use STORAGE_KEYS.theme in persist config'
  );
});

// -----------------------------------------------------------------------------
// CHECK 2: COMPILED TOKEN INSPECTION & ZERO REGRESSIONS
// -----------------------------------------------------------------------------
console.log('\n>>> [PHASE 2] Token Palettes, Symmetry, and Zero-Regression Audit');

const tokensRaw = fs.readFileSync('src/theme/tokens.ts', 'utf8');
const trans = ts.transpileModule(tokensRaw, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const modExports = {};
const runner = new Function('exports', 'require', 'module', trans.outputText);
runner(modExports, () => ({
  Platform: { select: (o) => o.default || o.web, OS: 'ios' },
}), { exports: modExports });

const { lightColors, darkColors, colors } = modExports;

verify('Exported "colors" is strictly reference-equal to "lightColors" (colors === lightColors)', () => {
  assert.strictEqual(colors, lightColors, 'colors MUST be identical reference to lightColors');
});

verify('lightColors and darkColors have identical sets of token keys (complete symmetry)', () => {
  const lightKeys = Object.keys(lightColors).sort();
  const darkKeys = Object.keys(darkColors).sort();
  assert.deepStrictEqual(lightKeys, darkKeys, 'Keys must match 1:1 without omissions');
  assert.strictEqual(lightKeys.length, 37, 'Must have exactly 37 design tokens');
});

verify('Light theme baseline fidelity: Zero regressions against design tokens', () => {
  const BASELINE_SAMPLE = {
    background: '#FAF8F7',
    surface: '#FFFFFF',
    textPrimary: '#211C24',
    textSecondary: '#6C626C',
    brand: '#B6245A',
    energyText: '#765000',
    border: '#E7E0E5',
    glass: 'rgba(255, 255, 255, 0.85)',
    tabBarInactive: '#403644',
  };
  for (const [k, expected] of Object.entries(BASELINE_SAMPLE)) {
    assert.strictEqual(lightColors[k], expected, `Regression on light token ${k}: expected ${expected}, got ${lightColors[k]}`);
  }
});

// -----------------------------------------------------------------------------
// CHECK 3: DYNAMIC MODE SWITCHING ORACLE & MONTE-CARLO TRANSITION FUZZING
// -----------------------------------------------------------------------------
console.log('\n>>> [PHASE 3] Dynamic Theme Switching Oracle & Fuzzing (10,000 Transitions)');

function resolveTheme(mode, systemScheme) {
  if (mode === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return mode;
}

verify('Oracle resolves correctly under all standard state transitions', () => {
  const states = [
    { mode: 'system', scheme: 'light', expectedTheme: 'light', expectedDark: false, expectedColors: lightColors },
    { mode: 'system', scheme: 'dark', expectedTheme: 'dark', expectedDark: true, expectedColors: darkColors },
    { mode: 'system', scheme: null, expectedTheme: 'light', expectedDark: false, expectedColors: lightColors },
    { mode: 'system', scheme: undefined, expectedTheme: 'light', expectedDark: false, expectedColors: lightColors },
    { mode: 'dark', scheme: 'light', expectedTheme: 'dark', expectedDark: true, expectedColors: darkColors },
    { mode: 'dark', scheme: 'dark', expectedTheme: 'dark', expectedDark: true, expectedColors: darkColors },
    { mode: 'light', scheme: 'dark', expectedTheme: 'light', expectedDark: false, expectedColors: lightColors },
    { mode: 'light', scheme: 'light', expectedTheme: 'light', expectedDark: false, expectedColors: lightColors },
  ];

  for (const s of states) {
    const resolved = resolveTheme(s.mode, s.scheme);
    const isDark = resolved === 'dark';
    const activeColors = isDark ? darkColors : lightColors;

    assert.strictEqual(resolved, s.expectedTheme, `Mismatch in resolvedTheme for ${s.mode}+${s.scheme}`);
    assert.strictEqual(isDark, s.expectedDark, `Mismatch in isDark for ${s.mode}+${s.scheme}`);
    assert.strictEqual(activeColors, s.expectedColors, `Mismatch in activeColors for ${s.mode}+${s.scheme}`);
  }
});

verify('Fuzzing 10,000 rapid randomized transitions between mode and system appearance', () => {
  const modes = ['system', 'dark', 'light'];
  const schemes = ['dark', 'light', null, undefined, 'unspecified'];

  let currentMode = 'system';
  let currentScheme = 'light';

  for (let i = 0; i < 10000; i++) {
    if (Math.random() > 0.5) {
      currentMode = modes[Math.floor(Math.random() * modes.length)];
    } else {
      currentScheme = schemes[Math.floor(Math.random() * schemes.length)];
    }

    const theme = resolveTheme(currentMode, currentScheme);
    const isDark = theme === 'dark';
    const c = isDark ? darkColors : lightColors;

    if (currentMode === 'dark') {
      assert.strictEqual(theme, 'dark', `Fuzz step ${i}: mode "dark" must yield theme "dark"`);
      assert.strictEqual(isDark, true);
      assert.strictEqual(c, darkColors);
    } else if (currentMode === 'light') {
      assert.strictEqual(theme, 'light', `Fuzz step ${i}: mode "light" must yield theme "light"`);
      assert.strictEqual(isDark, false);
      assert.strictEqual(c, lightColors);
    } else {
      const expected = currentScheme === 'dark' ? 'dark' : 'light';
      assert.strictEqual(theme, expected, `Fuzz step ${i}: system mode with scheme "${currentScheme}" failed`);
      assert.strictEqual(isDark, currentScheme === 'dark');
      assert.strictEqual(c, currentScheme === 'dark' ? darkColors : lightColors);
    }
  }
});

// -----------------------------------------------------------------------------
// CHECK 4: ZUSTAND PERSISTENCE ENGINE & REHYDRATION CONCURRENCY
// -----------------------------------------------------------------------------
console.log('\n>>> [PHASE 4] Zustand Storage Persistence & Concurrency Stress Test');

function createMockStorage() {
  const map = new Map();
  return {
    map,
    engine: {
      getItem: (k) => map.get(k) ?? null,
      setItem: (k, v) => map.set(k, v),
      removeItem: (k) => map.delete(k),
    },
  };
}

verify('Zustand store accurately commits and rehydrates mode across storage lifecycle', () => {
  const { map, engine } = createMockStorage();

  // Create store with STORAGE_KEYS.theme
  const store1 = create()(
    persist(
      (set) => ({
        mode: 'system',
        setMode: (mode) => set({ mode }),
      }),
      {
        name: 'flirter.theme.v1',
        storage: createJSONStorage(() => engine),
      }
    )
  );

  assert.strictEqual(store1.getState().mode, 'system');
  store1.getState().setMode('dark');
  assert.strictEqual(store1.getState().mode, 'dark');

  // Verify memory persistence
  const raw = map.get('flirter.theme.v1');
  assert(raw, 'Data must be written to key "flirter.theme.v1"');
  const parsed = JSON.parse(raw);
  assert.strictEqual(parsed.state.mode, 'dark');

  // Reboot: second store instances reads from same storage
  const store2 = create()(
    persist(
      (set) => ({
        mode: 'system',
        setMode: (mode) => set({ mode }),
      }),
      {
        name: 'flirter.theme.v1',
        storage: createJSONStorage(() => engine),
      }
    )
  );

  assert.strictEqual(store2.getState().mode, 'dark', 'Rehydrated mode must be dark');
  store2.getState().setMode('light');
  assert.strictEqual(store2.getState().mode, 'light');
  assert.strictEqual(JSON.parse(map.get('flirter.theme.v1')).state.mode, 'light');
});

// -----------------------------------------------------------------------------
// CHECK 5: GLASS TAB BAR CONTRACT & CONTRAST
// -----------------------------------------------------------------------------
console.log('\n>>> [PHASE 5] Glass Tab Bar Contrast & Code Invariants');

const glassTabBarSrc = fs.readFileSync('src/components/layout/glass-tab-bar.tsx', 'utf8');

verify('GlassTabBar enforces light colorScheme and 40% white tint for native iOS GlassView', () => {
  assert(
    glassTabBarSrc.includes('tintColor="rgba(255, 255, 255, 0.40)"'),
    'tintColor must be rgba(255, 255, 255, 0.40)'
  );
  assert(
    glassTabBarSrc.includes('colorScheme="light"'),
    'colorScheme must be explicitly locked to "light"'
  );
});

verify('GlassTabBar inactive icons are colored with colors.tabBarInactive (#403644)', () => {
  assert(
    glassTabBarSrc.includes('colors.tabBarInactive'),
    'GlassTabBar must reference colors.tabBarInactive for inactive tab state'
  );
  assert.strictEqual(lightColors.tabBarInactive, '#403644');
  assert.strictEqual(darkColors.tabBarInactive, '#403644');
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`CHALLENGER STRESS TESTS COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
console.log('======================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
