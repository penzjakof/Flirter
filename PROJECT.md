# Project: Flirter Theme Architecture & Glass Tab Bar Contrast

## Architecture
- **Платформа:** Expo SDK ~57 (React Native 0.86, React 19, Expo Router ~57).
- **Стилізація:** React Native `StyleSheet` на основі дизайн-токенів у `src/theme/tokens.ts`.
- **Архітектура тем:**
  - `lightColors` та `darkColors` у `src/theme/tokens.ts` (із збереженням зворотного експорту `colors = lightColors`).
  - Реактивний Zustand стор `src/store/theme-store.ts` з персистенцією через `persistStorage` (`STORAGE_KEYS.theme` = `'flirter.theme.v1'`).
  - Хуки `useTheme()`, `useThemeColor()`, `useThemedStyles()` у `src/theme/use-theme.ts`.
  - Динамічний `StatusBar` (`dark` / `light`) та фони навігаційних контейнерів у `_layout.tsx`.
  - Модифікація `GlassSurface` та `GlassTabBar` для контрастного білого скла (White Frosted Glass) на темному/чорному фоні.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Glass Tab Bar Contrast | Підвищення непрозорості білого (0.85–0.88), підтримка iOS GlassView `colorScheme="light"` / `tintColor`, контрастні неактивні елементи `tabBarInactive`, чіткий контур | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Theme Store & System Tokens | Створення `lightColors` та `darkColors`, Zustand store з персистенцією, хуки `useTheme`, `useThemeColor`, оновлення `app.json` | M1 | ORIGINAL_REQUEST §R2 |
| 3 | Base UI Primitives Adaptation | Адаптація базових UI-компонентів (`AppText`, `Button`, `SelectableChip`, `TextField`, `BottomSheet`, `Checkbox`, `OptionGroup`, `IconButton`, `Avatar`, `Chip`) | M2 | ORIGINAL_REQUEST §R2 |
| 4 | Profile Theme Switcher | Додавання вибору теми ("Системна", "Світла", "Темна") у налаштування профілю | M2 | ORIGINAL_REQUEST §R2 |
| 5 | Navigation & Onboarding Screens Adaptation | Адаптація кореневих layout, стеку онбордингу, динамічних градієнтів `welcome.tsx` та екранів Discover, Chats | M3 | ORIGINAL_REQUEST §R2 |
| 6 | Chat & Energy Components Theming | Рефакторинг hardcoded кольорів у компонентах Energy (`EnergyPlusCard`, `InsufficientEnergySheet`, `BalanceCard`), адаптація чату (`Composer`, `MessageBubble`) | M3 | ORIGINAL_REQUEST §R2 |
| 7 | Code Quality, TypeCheck & Linter | Усунення наявних TypeScript помилок, чисте проходження `npx tsc --noEmit` та `npx expo lint` | M4 | ORIGINAL_REQUEST Acceptance Criteria |
| 8 | Forensic Audit & Independent Challenge | Незалежна перевірка автентичності, коректності UI та відсутності регресій світлої теми | M4 | ORIGINAL_REQUEST Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Foundation & Glass Tab Bar | `app.json`, `src/theme/tokens.ts`, `src/store/theme-store.ts`, `src/theme/use-theme.ts`, `src/components/ui/glass-surface.tsx`, `src/components/layout/glass-tab-bar.tsx`, `src/app/_layout.tsx`, TS fix в `energy-plus-card.tsx` та `insufficient-energy-sheet.tsx` | none | DONE |
| 2 | M2: UI Primitives & Profile Switcher | `AppText`, `Button`, `SelectableChip` (fix white-on-white bug), `TextField`, `BottomSheet`, `Checkbox`, `OptionGroup`, `IconButton`, `Avatar`, `Chip`, `profile.tsx` | M1 | DONE |
| 3 | M3: Screens, Chat & Energy Migration | Onboarding layouts & screens (`welcome.tsx` etc.), Discover, Chats, Character profile, Chat screens (`composer.tsx`, `message-bubble.tsx`), Energy store & sheets | M2 | DONE |
| 4 | M4: Final Verification & Audit | `npx tsc --noEmit`, `npx expo lint`, Reviewer, Challenger, Forensic Auditor | M3 | DONE |

## Interface Contracts
### Theme Tokens & Types (`src/theme/tokens.ts`)
```ts
export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceMuted: string;
  textPrimary: string;
  textSecondary: string;
  textOnBrand: string;
  textOnMedia: string;
  brand: string;
  brandPressed: string;
  brandSubtle: string;
  energyText: string;
  energySurface: string;
  border: string;
  cardBorderSubtle: string;
  danger: string;
  success: string;
  pass: string;
  premiumDeep: string;
  premiumGold: string;
  textOnPremiumMuted: string;
  premiumTrack: string;
  premiumInk: string;
  energyPlusCardBg: string;
  energyPlusCardBorder: string;
  energyPlusCardText: string;
  energyPlusBadgeBg: string;
  energyPlusBadgeText: string;
  energyTrackBg: string;
  glass: string;
  glassBorder: string;
  glassEdge: string;
  glassLens: string;
  tabBarInactive: string;
  overlay: string;
  mediaScrim: string;
  transparent: string;
  fadeTransparent: string;
}
export const lightColors: ThemeColors;
export const darkColors: ThemeColors;
export const colors: ThemeColors; // alias for lightColors (backward compatibility)
```

### Theme Store & Hooks (`src/store/theme-store.ts` & `src/theme/use-theme.ts`)
```ts
export interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}
export function useTheme(): {
  mode: ThemeMode;
  theme: ResolvedTheme;
  isDark: boolean;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
};
export function useThemeColor(token: keyof ThemeColors): string;
export function useThemedStyles<T>(factory: (colors: ThemeColors, isDark: boolean) => T): T;
```

## Code Layout
- `src/theme/tokens.ts` — дизайн-токени (палітри світла/темна)
- `src/theme/use-theme.ts` — хуки використання теми
- `src/store/theme-store.ts` — Zustand сховище теми
- `src/components/ui/` — базові дизайн-системи компоненти
- `src/components/layout/` — макет та навігаційні елементи (Glass Tab Bar)
- `src/components/energy/` — компоненти балансу та покупок енергії
- `src/components/chat/` — компоненти чату
- `src/app/` — роути та екрани додатку
