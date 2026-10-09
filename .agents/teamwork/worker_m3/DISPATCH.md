# Dispatch Task: Worker M3 (Screens, Chat & Energy Migration)

## Mission
Implement Milestone 3: Adapt ALL remaining screens and feature components across the app to support dynamic Light & Dark themes, eliminating all hardcoded background/text/border colors and linter warnings.
You MUST read:
1. `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/ORIGINAL_REQUEST.md` (mandatory first read)
2. `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/PROJECT.md`
3. `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_survey_3/survey_report.md`
4. `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_survey_2/survey_report.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Owned Files & Scope Boundaries
You have exclusive write ownership of these files:
- Screen Layouts & Routes:
  - `src/app/(onboarding)/_layout.tsx`
  - `src/app/(onboarding)/welcome.tsx`
  - `src/app/(onboarding)/age.tsx`
  - `src/app/(onboarding)/verify.tsx`
  - `src/app/(onboarding)/disclosure.tsx`
  - `src/components/onboarding/onboarding-layout.tsx`
  - `src/app/(app)/_layout.tsx`
  - `src/app/(app)/(tabs)/_layout.tsx`
  - `src/app/(app)/(tabs)/index.tsx`
  - `src/app/(app)/(tabs)/chats.tsx`
  - `src/app/(app)/character/[id].tsx`
  - `src/app/legal/[doc].tsx`
  - `src/app/+not-found.tsx`
  - `src/app/+html.tsx`
- Chat Components & Screen:
  - `src/app/(app)/chat/[id].tsx`
  - `src/components/chat/composer.tsx`
  - `src/components/chat/message-bubble.tsx`
  - `src/components/chat/typing-indicator.tsx`
- Energy Components & Screen:
  - `src/app/(app)/energy.tsx`
  - `src/components/energy/balance-card.tsx`
  - `src/components/energy/energy-chip.tsx`
  - `src/components/energy/energy-packages-list.tsx`
  - `src/components/energy/energy-plus-card.tsx`
  - `src/components/energy/insufficient-energy-sheet.tsx`
  - `src/components/energy/waiting-characters.tsx`
- Discover & Layout Components:
  - `src/components/layout/app-header.tsx`
  - `src/components/layout/boot-screen.tsx`
  - `src/components/layout/brand-mark.tsx`
  - `src/components/layout/install-sheet.tsx`
  - `src/components/discover/character-grid-card.tsx`
  - `src/components/discover/filter-sheet.tsx`
  - `src/components/discover/gender-selector.tsx`

## Exact Implementation Requirements

### 1. Screen Layouts & Routes
- Use `useTheme()` in each layout / screen:
  - `src/app/(onboarding)/_layout.tsx`: `contentStyle: { backgroundColor: colors.background }`.
  - `src/app/(onboarding)/welcome.tsx`: replace hardcoded `['rgba(250,248,247,0)', colors.background]` with `[colors.fadeTransparent, colors.background]`. Dynamic `safeArea` background.
  - `src/app/(onboarding)/age.tsx`: `privacyNote` background `colors.surfaceMuted`.
  - `src/app/(onboarding)/verify.tsx`: `demoNote` background `colors.brandSubtle`.
  - `src/app/(onboarding)/disclosure.tsx`: `facts` card with `colors.surface`, `colors.border`, `factIcon` with `colors.brandSubtle`, `divider` with `colors.border`.
  - `src/components/onboarding/onboarding-layout.tsx`: `safeArea` background `colors.background`, `progressTrack` `colors.border`.
  - `src/app/(app)/_layout.tsx`: `contentStyle: { backgroundColor: colors.background }`.
  - `src/app/(app)/(tabs)/_layout.tsx`: `sceneStyle: { backgroundColor: colors.background }`.
  - `src/app/(app)/(tabs)/index.tsx`: `safeArea` `colors.background`, `emptyIcon` `colors.brandSubtle`.
  - `src/app/(app)/(tabs)/chats.tsx`: `safeArea` `colors.background`, `rowPressed` `colors.surfaceMuted`, `dismiss` `colors.surfaceMuted`, `emptyIcon` `colors.brandSubtle`.
  - `src/app/(app)/character/[id].tsx`: `root`, `missing`, `body` with `colors.background`, `stickyCta` with `colors.background` and `borderTopColor: colors.border`, `aboutAi` with `colors.brandSubtle`, `photoWrapper` with `colors.surfaceMuted`.
  - `src/app/legal/[doc].tsx`: `safeArea` with `colors.background`.
  - `src/app/+not-found.tsx`: `container` with `colors.background`.
  - `src/app/+html.tsx`: responsive `theme-color` and `color-scheme: light dark`.

### 2. Chat Components & Screen
- `src/app/(app)/chat/[id].tsx`: `safeArea`, `header` with `colors.background` and `borderBottomColor: colors.border`, `suggestion` with `colors.surface` and `colors.brand`, `suggestionPressed` with `colors.brandSubtle`.
- `src/components/chat/composer.tsx`: `useTheme()` for `colors.textPrimary`, `placeholderTextColor: colors.textSecondary`, attach/mic icons `colors.textSecondary`, send button.
- `src/components/chat/message-bubble.tsx`: `incoming` with `colors.surface` and `colors.border`, text `colors.textPrimary`, disclaimer `colors.textSecondary`.
- `src/components/chat/typing-indicator.tsx`: bubble with `colors.surface` and `colors.border`, dots with `colors.textSecondary`.

### 3. Energy Components & Screen
- `src/app/(app)/energy.tsx`: `safeArea` with `colors.background`. Fix unused variables to clean linter warnings.
- `src/components/energy/balance-card.tsx`: `card` with `colors.surface` and `borderColor: colors.cardBorderSubtle`, `track` with `colors.energyTrackBg`, `fill` with `colors.brand`. Fix unused variables.
- `src/components/energy/energy-chip.tsx`: `chip` with `colors.energySurface`, text and icon with `colors.energyText`.
- `src/components/energy/energy-packages-list.tsx`: replace hardcoded colors (`#FDF2F6`, `#5A122D`, `#F7DDE6`, `#9A1D4B`, `rgba(33,28,36,0.06)`) with `colors.surface`, `colors.energyPlusCardBg`, `colors.energyPlusCardText`, `colors.energyPlusBadgeBg`, `colors.energyPlusBadgeText`, `colors.cardBorderSubtle`, `colors.border`.
- `src/components/energy/energy-plus-card.tsx`: replace hardcoded colors with `colors.energyPlusCardBg`, `colors.energyPlusCardBorder`, `colors.energyPlusCardText`, `colors.energyPlusBadgeBg`, `colors.energyPlusBadgeText`, `colors.brand`.
- `src/components/energy/insufficient-energy-sheet.tsx`: replace hardcoded `#FDF2F5`, `#F3D2DF`, `#8A1538`, `#982755`, `#EBE5E8`, `#6C626C` with semantic tokens (`colors.energyPlusCardBg`, `colors.energyPlusCardBorder`, `colors.energyPlusCardText`, `colors.surface`, `colors.border`, `colors.textSecondary`).
- `src/components/energy/waiting-characters.tsx`: `card` with `colors.surface` and `borderColor: colors.cardBorderSubtle`, `Avatar ringColor={colors.surface}`.

### 4. Discover & Layout Components
- `src/components/layout/app-header.tsx`: `backgroundColor: colors.background`.
- `src/components/layout/boot-screen.tsx`: `backgroundColor: colors.background`, spinner `colors.brand`.
- `src/components/layout/brand-mark.tsx`: `colors.textPrimary` (dynamically).
- `src/components/layout/install-sheet.tsx`: `steps` with `colors.surfaceMuted`, `stepIndex` with `colors.brandSubtle`.
- `src/components/discover/character-grid-card.tsx`: `card` with `colors.surfaceMuted`.
- `src/components/discover/filter-sheet.tsx`: `Switch trackColor={{ true: colors.brand, false: colors.border }}`.
- `src/components/discover/gender-selector.tsx`: `tile` with `colors.surfaceMuted`, `tileSelected` with `colors.brandSubtle` and `colors.brand`.

## Verification Requirements
You MUST run:
1. `npx tsc --noEmit` — must pass with 0 errors.
2. `npx expo lint` — must pass cleanly with 0 errors and 0 warnings.
3. Write a comprehensive programmatic test suite in `scratch/test-m3.mjs` verifying that all screens and components dynamically use the theme.

## Output
Write your implementation report to `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m3/implementation_report.md` and handoff to `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m3/handoff.md`.
Document all verification commands run and their exact console outputs.
When finished, send a message to the orchestrator.


## 2026-10-08T12:17:24Z
You are Worker M3 (Screens, Chat & Energy Migration Specialist).
Your working directory is: /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m3
Your task instructions and mandatory constraints are in: /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m3/DISPATCH.md
Read /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/ORIGINAL_REQUEST.md before starting work.

Implement Milestone 3:
- Adapt ALL remaining screens (Onboarding routes, Tabs layouts & screens, Character profile, Legal, Not-found, Html)
- Adapt Chat screens & components (chat/[id].tsx, composer.tsx, message-bubble.tsx, typing-indicator.tsx)
- Adapt Energy screens & components (energy.tsx, balance-card.tsx, energy-chip.tsx, energy-packages-list.tsx, energy-plus-card.tsx, insufficient-energy-sheet.tsx, waiting-characters.tsx)
- Adapt Discover & Layout components (app-header.tsx, boot-screen.tsx, brand-mark.tsx, install-sheet.tsx, character-grid-card.tsx, filter-sheet.tsx, gender-selector.tsx)
- Clean all remaining linter warnings in energy.tsx and balance-card.tsx.

Run `npx tsc --noEmit` and `npx expo lint` to verify your changes.
Write your implementation report to /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m3/implementation_report.md and your handoff to /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m3/handoff.md.
When finished, send a message to the orchestrator.
