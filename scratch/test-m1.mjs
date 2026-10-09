import assert from 'node:assert';
import fs from 'node:fs';

// 1. Verify app.json
const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
assert.strictEqual(
  appJson.expo.userInterfaceStyle,
  'automatic',
  'app.json userInterfaceStyle must be "automatic"'
);
console.log('✓ [1/6] app.json has userInterfaceStyle: automatic');

// 2. Read and verify tokens.ts
const tokensSrc = fs.readFileSync('./src/theme/tokens.ts', 'utf8');
assert(tokensSrc.includes('export const lightColors: ThemeColors ='), 'tokens.ts must export lightColors');
assert(tokensSrc.includes('export const darkColors: ThemeColors ='), 'tokens.ts must export darkColors');
assert(tokensSrc.includes('export const colors: ThemeColors = lightColors;'), 'tokens.ts must export colors = lightColors');
assert(tokensSrc.includes('tabBarInactive: \'#403644\''), 'tabBarInactive must be #403644');
assert(tokensSrc.includes('glass: \'rgba(255, 255, 255, 0.85)\''), 'lightColors.glass must have 0.85 opacity');
assert(tokensSrc.includes('glass: \'rgba(255, 255, 255, 0.88)\''), 'darkColors.glass must have 0.88 opacity');
assert(tokensSrc.includes('export type ThemeMode = \'system\' | \'light\' | \'dark\';'), 'tokens.ts must export ThemeMode');
assert(tokensSrc.includes('export type ResolvedTheme = \'light\' | \'dark\';'), 'tokens.ts must export ResolvedTheme');
assert(tokensSrc.includes('export type ColorToken = keyof ThemeColors;'), 'tokens.ts must export ColorToken');
console.log('✓ [2/6] tokens.ts contains all required tokens, contracts, and types');

// 3. Verify theme-store.ts
const storeSrc = fs.readFileSync('./src/store/theme-store.ts', 'utf8');
assert(storeSrc.includes("name: 'flirter.theme.v1'"), 'theme-store must persist with key flirter.theme.v1');
assert(storeSrc.includes('mode: \'system\''), 'default mode must be system');
assert(storeSrc.includes('setMode: (mode: ThemeMode) => set({ mode })'), 'setMode must update mode');
console.log('✓ [3/6] theme-store.ts implements persistent Zustand store');

// 4. Verify use-theme.ts
const useThemeSrc = fs.readFileSync('./src/theme/use-theme.ts', 'utf8');
assert(useThemeSrc.includes('export function useTheme()'), 'useTheme hook must be exported');
assert(useThemeSrc.includes('export function useThemeColor('), 'useThemeColor hook must be exported');
assert(useThemeSrc.includes('export function useThemedStyles<T>('), 'useThemedStyles hook must be exported');
assert(useThemeSrc.includes("systemScheme === 'dark' ? 'dark' : 'light'"), 'useTheme must resolve system scheme');
console.log('✓ [4/6] use-theme.ts implements theme hooks and contracts');

// 5. Verify glass-surface.tsx and glass-tab-bar.tsx
const glassSurfaceSrc = fs.readFileSync('./src/components/ui/glass-surface.tsx', 'utf8');
assert(glassSurfaceSrc.includes('colorScheme={colorScheme ?? \'light\'}'), 'GlassSurface must pass light colorScheme');
assert(glassSurfaceSrc.includes("tintColor={tintColor ?? 'rgba(255, 255, 255, 0.40)'}"), 'GlassSurface must pass white tintColor');
assert(glassSurfaceSrc.includes('blur(24px) saturate(200%) brightness(1.15)'), 'GlassSurface must have enhanced backdrop filter');

const glassTabBarSrc = fs.readFileSync('./src/components/layout/glass-tab-bar.tsx', 'utf8');
assert(glassTabBarSrc.includes('useTheme()'), 'GlassTabBar must use useTheme()');
assert(glassTabBarSrc.includes('colors.tabBarInactive'), 'GlassTabBar must use colors.tabBarInactive for inactive items');
assert(glassTabBarSrc.includes('tintColor="rgba(255, 255, 255, 0.40)"'), 'GlassTabBar must pass tintColor to GlassSurface');
assert(glassTabBarSrc.includes('colorScheme="light"'), 'GlassTabBar must pass colorScheme="light" to GlassSurface');
assert(glassTabBarSrc.includes('colors.glassLens'), 'GlassTabBar must use colors.glassLens');
console.log('✓ [5/6] GlassSurface and GlassTabBar properly configured for white glass contrast');

// 6. Verify RootLayout & Energy TS Fixes
const layoutSrc = fs.readFileSync('./src/app/_layout.tsx', 'utf8');
assert(layoutSrc.includes('const { isDark, colors } = useTheme();'), 'RootLayout must use useTheme()');
assert(layoutSrc.includes("<StatusBar style={isDark ? 'light' : 'dark'} />"), 'RootLayout must use dynamic StatusBar');
assert(layoutSrc.includes('backgroundColor: colors.background'), 'RootLayout must use dynamic background');

const energyPlusCardSrc = fs.readFileSync('./src/components/energy/energy-plus-card.tsx', 'utf8');
assert(!energyPlusCardSrc.includes('textStyle={'), 'energy-plus-card.tsx must not have invalid textStyle prop');

const insufficientEnergySrc = fs.readFileSync('./src/components/energy/insufficient-energy-sheet.tsx', 'utf8');
assert(insufficientEnergySrc.includes('ENERGY_CONFIG.renewableCap'), 'insufficient-energy-sheet.tsx must use ENERGY_CONFIG.renewableCap');
assert(!insufficientEnergySrc.includes('ENERGY_CONFIG.maxFree'), 'insufficient-energy-sheet.tsx must not use maxFree');
console.log('✓ [6/6] RootLayout and Energy TS fixes verified successfully');

console.log('\nAll Milestone 1 programmatic assertions PASSED!');
