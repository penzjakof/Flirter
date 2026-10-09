# Dispatch Task: Worker M2 (UI Primitives & Profile Theme Switcher)

## Mission
Implement Milestone 2: Adapt Core UI Primitives to dynamic theming and implement the Theme Switcher in the Profile screen.
You MUST read:
1. `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/ORIGINAL_REQUEST.md` (mandatory first read)
2. `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/PROJECT.md`
3. `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_survey_3/survey_report.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Owned Files & Scope Boundaries
You have exclusive write ownership of these files:
- `src/components/ui/app-text.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/selectable-chip.tsx`
- `src/components/ui/text-field.tsx`
- `src/components/ui/bottom-sheet.tsx`
- `src/components/ui/checkbox.tsx`
- `src/components/ui/option-group.tsx`
- `src/components/ui/icon-button.tsx`
- `src/components/ui/avatar.tsx`
- `src/components/ui/chip.tsx`
- `src/app/(app)/(tabs)/profile.tsx`

DO NOT modify files outside of this list in this milestone.

## Exact Implementation Requirements

### 1. `src/components/ui/app-text.tsx`
- Import `useTheme` from `@/theme/use-theme`.
- Dynamically resolve `colors[color]` from `useTheme().colors`.
- Ensure default `color="textPrimary"` correctly updates to light text in dark mode and dark text in light mode.

### 2. `src/components/ui/button.tsx`
- Import `useTheme` from `@/theme/use-theme`.
- Adapt `VARIANT_STYLES`:
  - `primary`: background `colors.brand`, text `colors.textOnBrand`, pressed `colors.brandPressed`.
  - `secondary`: background `colors.surface`, border `colors.border`, text `colors.textPrimary`, pressed `colors.surfaceMuted`.
  - `ghost`: transparent background, pressed `colors.brandSubtle`, text `colors.brand`.
  - `danger`: background `colors.surface`, border `colors.border`, text `colors.danger`, pressed `colors.surfaceMuted`.

### 3. `src/components/ui/selectable-chip.tsx` (CRITICAL FIX)
- Import `useTheme` from `@/theme/use-theme`.
- Fix the silent regression where white text appeared on a white background:
  - When `selected`: `backgroundColor: colors.brand`, text: `colors.textOnBrand`.
  - When unselected: `backgroundColor: colors.surfaceMuted`, text: `colors.textPrimary`.
  - Or if using `colors.textPrimary` background, ensure the text color is `colors.background` so it is always 100% visible and high-contrast in both themes.

### 4. `src/components/ui/text-field.tsx`
- Import `useTheme` from `@/theme/use-theme`.
- Input background: `colors.surface`, color: `colors.textPrimary`.
- Border: `isFocused ? colors.brand : colors.border`.
- Placeholder text color: `colors.textSecondary`.

### 5. `src/components/ui/bottom-sheet.tsx`
- Import `useTheme` from `@/theme/use-theme`.
- Sheet container background: `colors.surface`.
- Handle bar: `colors.border`.
- Backdrop: `colors.overlay`.

### 6. `src/components/ui/checkbox.tsx`
- Import `useTheme` from `@/theme/use-theme`.
- Box background: `checked ? colors.brand : colors.surface`.
- Box border: `checked ? colors.brand : colors.textSecondary`.
- Icon color: `colors.textOnBrand`.

### 7. `src/components/ui/option-group.tsx`
- Import `useTheme` from `@/theme/use-theme`.
- Option background: `selected ? colors.brandSubtle : colors.surface`.
- Border: `selected ? colors.brand : colors.border`.
- Text: `selected ? colors.brand : colors.textPrimary`.

### 8. `src/components/ui/icon-button.tsx`
- Import `useTheme` from `@/theme/use-theme`.
- Default icon color: `color ?? colors.textPrimary`.
- Pressed background: `colors.surfaceMuted`.

### 9. `src/components/ui/avatar.tsx`
- Import `useTheme` from `@/theme/use-theme`.
- Default `ringColor = colors.surface`.
- Wrapper placeholder background: `colors.surfaceMuted`.

### 10. `src/components/ui/chip.tsx`
- Import `useTheme` from `@/theme/use-theme`.
- Neutral background: `colors.surfaceMuted`, text: `colors.textPrimary`.
- Brand background: `colors.brandSubtle`, text: `colors.brand`.

### 11. `src/app/(app)/(tabs)/profile.tsx`
- Import `useTheme` from `@/theme/use-theme`.
- Add a new "Тема оформлення" section in Settings:
  - Provide selection for 3 modes: "Як у системі" (`'system'`), "Світла" (`'light'`), "Темна" (`'dark'`).
  - Active selection indicator reflecting current `mode` and calling `setMode(newMode)`.
- Adapt profile layout colors:
  - `safeArea` background: `colors.background`.
  - `profileCard` & `groupCard`: background `colors.surface`, borderColor `colors.border`.
  - `rowPressed`: background `colors.surfaceMuted`.
  - `divider`: background `colors.border`.

## Verification Requirements
You MUST run:
1. `npx tsc --noEmit` — must pass with 0 errors.
2. `npx expo lint` — must pass cleanly.
3. Write a programmatic assertion script (e.g. in `scratch/test-m2.mjs`) to verify theme switching, token resolution in both modes, and proper color assignments.

## Output
Write your implementation report to `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m2/implementation_report.md` and handoff to `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m2/handoff.md`.
Document all verification commands run and their exact console outputs.
When finished, send a message to the orchestrator.


## 2026-10-08T12:07:09Z
You are Worker M2 (UI Primitives & Profile Theme Switcher Specialist).
Your working directory is: /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m2
Your task instructions and mandatory constraints are in: /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m2/DISPATCH.md
Read /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/ORIGINAL_REQUEST.md before starting work.

Implement Milestone 2:
- Adapt core UI primitives: AppText, Button, SelectableChip (fix white-on-white bug), TextField, BottomSheet, Checkbox, OptionGroup, IconButton, Avatar, Chip
- Adapt Profile screen (src/app/(app)/(tabs)/profile.tsx) with theme cards and a Theme Switcher section ("Як у системі" / "Світла" / "Темна") connected to useTheme()

Run `npx tsc --noEmit` and `npx expo lint` to verify your changes.
Write your implementation report to /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m2/implementation_report.md and your handoff to /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m2/handoff.md.
When finished, send a message to the orchestrator.
