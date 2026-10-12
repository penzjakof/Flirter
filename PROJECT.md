# Project: Flirter Localization (10 Languages & RTL Architecture)

## Architecture
- **Платформа:** Expo SDK ~57 (React Native 0.86.3, React 19.2.3, Expo Router ~57.0.23).
- **Бібліотека локалізації:** `i18next` (^26.4.2) + `react-i18next` (^17.0.16) + `expo-localization` (~57.0.2).
- **Керування станом мови:** Zustand store `src/store/language-store.ts` з персистенцією через `persistStorage` (`STORAGE_KEYS.language = 'flirter.language.v1'`).
- **Підтримка RTL (Right-to-Left):**
  - `I18nManager.allowRTL(true)` та `I18nManager.forceRTL(isRtl)` для Арабської мови (`ar`).
  - Огортання навігації в `LocaleProvider` (`expo-router`) у `src/app/_layout.tsx`.
  - Підтримка Web через `dir="rtl"` / `dir="ltr"` на DOM/контейнерах.
  - Адаптація анімації лінзи підсвітки у `GlassTabBar` для RTL.
- **Типізація:** TypeScript module augmentation для `i18next` (`CustomTypeOptions` з `typeof en`) для 100% type-safety ключів перекладу при `npx tsc --noEmit`.
- **10 підтримуваних мов:**
  1. `en` — English (Базова / Fallback)
  2. `uk` — Українська
  3. `es` — Español
  4. `fr` — Français
  5. `de` — Deutsch
  6. `zh` — 简体中文
  7. `hi` — हिन्दी
  8. `ar` — العربية (RTL)
  9. `pt` — Português
  10. `ja` — 日本語

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Dependency Installation & Config | Встановлення `expo-localization`, `i18next`, `react-i18next` через `npx expo install`. Конфігурація `app.json` (`supportedLocales`, `supportsRTL`, `CFBundleAllowMixedLocalizations`). | M1 | ORIGINAL_REQUEST §R1 |
| 2 | i18n Core Module & Fallback | Створення `src/i18n/index.ts`, `types.ts`, `resources.ts` з ініціалізацією `compatibilityJSON: 'v4'`, fallbackLng: 'en', типізацією `CustomTypeOptions`. | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Language Store & Persistence | Реалізація `useLanguageStore` (Zustand + persist) з авто-визначенням мови пристрою через `getLocales()` та збереженням у `STORAGE_KEYS.language`. | M1 | ORIGINAL_REQUEST §R1 |
| 4 | RTL Support & Layout Integration | Інтеграція `LocaleProvider` в `src/app/_layout.tsx`, синхронізація `I18nManager`, дзеркалення `GlassTabBar` та адаптація для вебу. | M1 | ORIGINAL_REQUEST §R2 |
| 5 | Translation Dictionaries (10 Languages) | Створення повних JSON-файлів перекладів для 10 мов (en, uk, es, fr, de, zh, hi, ar, pt, ja) з усіма секціями (common, tabs, onboarding, discover, chats, chat, character, energy, profile, pwa, legal, not_found). | M2 | ORIGINAL_REQUEST §R3 |
| 6 | Key Parity Enforcement Script | Створення автоматичного скрипта `scripts/check-i18n-parity.ts` для перевірки 100% паритету ключів у всіх 10 мовних словниках. | M2 | ORIGINAL_REQUEST Acceptance Criteria |
| 7 | Onboarding Screens String Migration | Заміна хардкодних рядків на `t(...)` у всіх екранах онбордингу (`welcome.tsx`, `age.tsx`, `sign-in.tsx`, `verify.tsx`, `profile-setup.tsx`, `disclosure.tsx`). | M3 | ORIGINAL_REQUEST §R2 |
| 8 | Tabs & App Screens Migration | Заміна хардкодних рядків на `t(...)` у табах (`index.tsx`, `chats.tsx`, `profile.tsx`), екранах чату (`chat/[id].tsx`), профілю персонажа (`character/[id].tsx`), балансу (`energy.tsx`), юридичних екранах (`legal/[doc].tsx`) та 404 (`+not-found.tsx`). | M3 | ORIGINAL_REQUEST §R2 |
| 9 | Reusable Components & Modals Migration | Заміна рядків у `src/components/` (`chat/`, `discover/`, `energy/`, `layout/`, `pwa/`, `onboarding/`, `ui/`). Перехід на нативну плюралізацію i18next замість `pluralizeUk`. | M3 | ORIGINAL_REQUEST §R2 |
| 10 | Profile Language Selector UI | Реалізація модального вибору 10 мов `LanguageSelectionSheet` у налаштуваннях профілю (`profile.tsx`) з рідними назвами (Endonyms), прапорцями та індикацією. | M3 | ORIGINAL_REQUEST §R2 |
| 11 | TypeCheck & Linting Verification | Перевірка відсутності нових помилок через `npx tsc --noEmit` та `npx expo lint`. | M4 | ORIGINAL_REQUEST Acceptance Criteria |
| 12 | Independent Adversarial Review & Forensic Audit | Повний цикл верифікації рецензентами, тестувальниками (Challengers) та Forensic Auditor для підтвердження автентичності та відсутності регресій. | M4 | ORIGINAL_REQUEST Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Localization Infrastructure & RTL Setup | Встановлення залежностей, оновлення `app.json`, `src/lib/storage.ts`, створення `src/i18n/`, `src/store/language-store.ts`, `LocaleProvider` у `src/app/_layout.tsx`. | none | DONE |
| 2 | M2: Complete Dictionaries for 10 Languages & Parity | Генерація 10 JSON-файлів локалізації у `src/i18n/translations/`, скрипт `scripts/check-i18n-parity.ts` з перевіркою 100% паритету. | M1 | DONE |
| 3 | M3: UI Integration & Profile Language Switcher | Міграція всіх екранів `src/app/` та компонентів `src/components/` на `t(...)`, селектор мов у `profile.tsx`, RTL дзеркалення в `GlassTabBar`. | M2 | DONE |
| 4 | M4: Final Verification, Adversarial Testing & Forensic Audit | Валідація `npx tsc --noEmit`, `npx expo lint`, `scripts/check-i18n-parity.ts`, перевірка Reviewer, Challenger, Forensic Auditor. | M3 | DONE |

## Interface Contracts

### i18n Core Types (`src/i18n/types.ts`)
```ts
export const SUPPORTED_LANGUAGES = ['en', 'uk', 'es', 'fr', 'de', 'zh', 'hi', 'ar', 'pt', 'ja'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;      // English name (e.g., "Ukrainian")
  nativeName: string;// Native endonym (e.g., "Українська")
  flag: string;      // Country/region flag or badge
  isRTL: boolean;
}

export const LANGUAGE_REGISTRY: Record<SupportedLanguage, LanguageInfo>;
export const isRtlLanguage = (code: string): boolean;
```

### Language Store (`src/store/language-store.ts`)
```ts
export type LanguageMode = 'system' | SupportedLanguage;

export interface LanguageState {
  mode: LanguageMode;
  resolvedLanguage: SupportedLanguage;
  isRTL: boolean;
  setLanguage: (mode: LanguageMode) => Promise<void> | void;
}

export const useLanguageStore: UseBoundStore<StoreApi<LanguageState>>;
```

### Language Selection Modal Contract
```tsx
export interface LanguageSelectionSheetProps {
  isVisible: boolean;
  onClose: () => void;
  currentLanguage: SupportedLanguage;
  currentMode: LanguageMode;
  onSelectLanguage: (mode: LanguageMode) => void;
}
```

## Code Layout
- `src/i18n/` — конфігурація i18next, типи, ресурси, файли перекладів (`translations/*.json`)
- `src/store/language-store.ts` — Zustand сховище поточної мови та RTL прапорця
- `src/lib/storage.ts` — константи ключів сховища (`STORAGE_KEYS.language`)
- `scripts/check-i18n-parity.mjs` — утиліта автоматичного аудиту паритету словників
- `src/app/` — роути та екрани додатку (інтеграція `useTranslation()`)
- `src/components/` — UI-компоненти, модальні вікна та селектор мов
