# Dispatch Task: Worker M1 (Foundation & Glass Tab Bar Contrast)

## Mission
Implement Milestone 1: Foundation of Theming System and Glass Tab Bar Contrast.
You MUST read:
1. `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/ORIGINAL_REQUEST.md` (mandatory first read)
2. `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/PROJECT.md`
3. `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_survey_1/survey_report.md`
4. `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_survey_2/survey_report.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Owned Files & Scope Boundaries
You have exclusive write ownership of these files:
- `app.json`
- `src/theme/tokens.ts`
- `src/store/theme-store.ts` (new file)
- `src/theme/use-theme.ts` (new file)
- `src/components/ui/glass-surface.tsx`
- `src/components/layout/glass-tab-bar.tsx`
- `src/app/_layout.tsx`
- `src/components/energy/energy-plus-card.tsx` (only fix TS error at line 54)
- `src/components/energy/insufficient-energy-sheet.tsx` (only fix TS error at line 23)

DO NOT modify other screens or components yet — they belong to subsequent milestones.

## Exact Implementation Requirements

### 1. `app.json`
- Change `"userInterfaceStyle": "light"` to `"userInterfaceStyle": "automatic"`.

### 2. `src/theme/tokens.ts`
- Implement `lightColors` and `darkColors` matching the contract in `PROJECT.md` and Explorer 2's report.
  - Light palette must retain 100% of existing values for zero regression.
  - Dark palette must have deep charcoal/plum background `#121013`, surface `#1C1820`, surfaceMuted `#28232D`, textPrimary `#F6F3F7` (>13:1 contrast), textSecondary `#A59BAA`, border `#332C38`, brand `#DC3B78`, amber energy `#FFD666`, semantic tokens (`energyPlusCardBg`, `energyPlusCardBorder`, `energyPlusCardText`, `energyPlusBadgeBg`, `energyPlusBadgeText`, `energyTrackBg`, `cardBorderSubtle`, `fadeTransparent`).
  - For Glass Tab Bar in both themes:
    - `lightColors.glass = 'rgba(255, 255, 255, 0.85)'`
    - `lightColors.glassBorder = 'rgba(255, 255, 255, 0.95)'`
    - `lightColors.glassLens = 'rgba(255, 255, 255, 0.96)'`
    - `lightColors.tabBarInactive = '#403644'`
    - `darkColors.glass = 'rgba(255, 255, 255, 0.88)'` (white frosted glass, does not blend with black)
    - `darkColors.glassBorder = 'rgba(255, 255, 255, 0.98)'`
    - `darkColors.glassLens = '#FFFFFF'`
    - `darkColors.tabBarInactive = '#403644'` (high contrast on white glass)
  - Retain `export const colors = lightColors;` for complete backward compatibility.
  - Export types `ThemeColors`, `ThemeMode`, `ResolvedTheme`, `ColorToken`.

### 3. `src/store/theme-store.ts`
- Create Zustand store with `persist` middleware using `STORAGE_KEYS.theme` (`'flirter.theme.v1'`) and `persistStorage` from `@/lib/storage`.
- State: `mode: 'system' | 'light' | 'dark'`, `setMode: (mode: ThemeMode) => void`.

### 4. `src/theme/use-theme.ts`
- Create hooks:
  - `useTheme()`: resolves `'system'` using `useColorScheme()`, returns `{ mode, theme, isDark, colors, setMode }`.
  - `useThemeColor(token: keyof ThemeColors): string`.
  - `useThemedStyles<T>(factory: (colors: ThemeColors, isDark: boolean) => T): T`.

### 5. `src/components/ui/glass-surface.tsx`
- Support optional `tintColor?: ColorValue` and `colorScheme?: 'auto' | 'light' | 'dark'`.
- In `HAS_NATIVE_LIQUID_GLASS` (iOS `GlassView`), pass `colorScheme={colorScheme ?? 'light'}` and `tintColor={tintColor ?? 'rgba(255, 255, 255, 0.40)'}` to ensure the glass stays bright and frosted even in dark mode on iOS.
- In Web/Android fallback, use `colors.glass`, `colors.glassBorder`, and enhanced `backdrop-filter: 'blur(24px) saturate(200%) brightness(1.15)'`.

### 6. `src/components/layout/glass-tab-bar.tsx`
- Read active theme via `useTheme()`.
- Use `color = isFocused ? colors.brand : colors.tabBarInactive;` so inactive items have strong contrast on the white glass capsule.
- Use `colors.glassLens` for the highlight pill.
- Pass `tintColor="rgba(255, 255, 255, 0.40)"` and `colorScheme="light"` to `GlassSurface`.

### 7. `src/app/_layout.tsx`
- Read `const { isDark, colors } = useTheme();`.
- Dynamically render `<StatusBar style={isDark ? 'light' : 'dark'} />`.
- Set `Stack` `screenOptions={{ contentStyle: { backgroundColor: colors.background } }}` and frame background dynamically.

### 8. Fix Existing TypeScript Errors
- In `src/components/energy/energy-plus-card.tsx:54`: remove invalid `textStyle` prop from `Button`.
- In `src/components/energy/insufficient-energy-sheet.tsx:23`: fix `ENERGY_CONFIG.maxFree` reference (check what `ENERGY_CONFIG` actually exports in `@/config/energy` or types).

## Verification Requirements
You MUST run:
1. `npx tsc --noEmit` — must pass with 0 errors.
2. `npx expo lint` — must pass cleanly (or report remaining warnings/errors).

## Output
Write your implementation report to `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m1/implementation_report.md` and handoff to `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m1/handoff.md`.
Document all verification commands run and their exact console outputs.
When finished, send a message to the orchestrator.


## 2026-10-08T11:55:57Z
You are Worker M1 (Foundation & Glass Tab Bar Specialist).
Your working directory is: /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m1
Your task instructions and mandatory constraints are in: /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m1/DISPATCH.md
Read /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/ORIGINAL_REQUEST.md before starting work.

Implement Milestone 1:
- app.json (userInterfaceStyle automatic)
- src/theme/tokens.ts (lightColors, darkColors, semantic tokens, backward-compatible colors export)
- src/store/theme-store.ts (Zustand store with persist)
- src/theme/use-theme.ts (useTheme, useThemeColor, useThemedStyles)
- src/components/ui/glass-surface.tsx (white opacity, iOS native GlassView params)
- src/components/layout/glass-tab-bar.tsx (tabBarInactive, contrast on black)
- src/app/_layout.tsx (dynamic StatusBar and background)
- Fix the 2 existing TypeScript errors in energy-plus-card.tsx and insufficient-energy-sheet.tsx

Run `npx tsc --noEmit` and `npx expo lint` to verify your changes.
Write your implementation report to /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m1/implementation_report.md and your handoff to /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m1/handoff.md.
When finished, send a message to the orchestrator.
