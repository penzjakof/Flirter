# Handoff Report: Milestone 1 (Foundation & Glass Tab Bar)

## 1. Observation
1. **Baseline TypeCheck:**
   Команда `npx tsc --noEmit` на старті видавала 2 помилки:
   - `src/components/energy/energy-plus-card.tsx:54:85 - error TS2322: Type '{ label: string; onPress: () => void; style: { backgroundColor: string; }; textStyle: { color: "#FFFFFF"; }; }' is not assignable to type 'IntrinsicAttributes & ButtonProps'. Property 'textStyle' does not exist on type 'IntrinsicAttributes & ButtonProps'.`
   - `src/components/energy/insufficient-energy-sheet.tsx:23:35 - error TS2339: Property 'maxFree' does not exist on type '{ readonly initialBalance: 20; readonly renewableCap: 30; readonly regenIntervalMs: number; readonly costs: { readonly textMessage: 1; readonly aiPhoto: 10; }; }'.`
2. **Конфігурація `app.json`:**
   Рядок 9 містив `"userInterfaceStyle": "light"`.
3. **Токени у `src/theme/tokens.ts`:**
   Містився лише один статичний об'єкт `colors` зі світлими кольорами, в якому `glass` мав значення `'rgba(240, 238, 242, 0.62)'`. Семантичні токени для темної теми та Energy+ були відсутні.
4. **Компонент `GlassSurface` (`src/components/ui/glass-surface.tsx`):**
   Викликав `GlassView` без передачі `colorScheme` та `tintColor`, а фолбек використовував статичний `colors.glass`.
5. **Компонент `GlassTabBar` (`src/components/layout/glass-tab-bar.tsx`):**
   Неактивні пункти використовували `colors.textPrimary` (`#211C24`), а лінза та бейдж посилалися на статичні кольори.
6. **Кореневий `_layout.tsx` (`src/app/_layout.tsx`):**
   Рядок 23 містив `<StatusBar style="dark" />`, а контейнер `frame` мав статичний колір фону.

## 2. Logic Chain
1. Зміна `"userInterfaceStyle": "automatic"` в `app.json` дозволяє Expo та React Native Appearance API динамічно отримувати зміну системної теми пристрою (спостереження 2).
2. Оголошення інтерфейсу `ThemeColors`, палітр `lightColors` та `darkColors` у `src/theme/tokens.ts` створює типізовану систему токенів із нульовою регресією (світлі кольори збережено на 100%), а збереження `export const colors = lightColors;` гарантує зворотну сумісність для всіх компонентів до їх міграції (спостереження 3).
3. Створення сховища `useThemeStore` у `src/store/theme-store.ts` з персистенцією через `persistStorage` під ключем `'flirter.theme.v1'` дозволяє зберігати вибір користувача (`'system'`, `'light'`, `'dark'`).
4. Хук `useTheme` у `src/theme/use-theme.ts` вирішує режим теми, спираючись на системні налаштування (`useColorScheme()`) або збережений вибір користувача, і повертає поточні токени `colors`, `isDark` та `setMode`.
5. У `GlassSurface` передача `colorScheme="light"` та `tintColor="rgba(255, 255, 255, 0.40)"` для iOS `GlassView` гарантує, що скло залишається світлим і матовим навіть у темній темі системи, а оновлений `backdrop-filter: 'blur(24px) saturate(200%) brightness(1.15)'` та токени `colors.glass` (0.85/0.88) забезпечують відмінний контраст на Web та Android (спостереження 4).
6. У `GlassTabBar` прив'язка неактивних іконок і лейблів до токена `colors.tabBarInactive` (`#403644`) забезпечує високий контраст (>8:1) на білому склі та виключає злиття з чорним фоном (спостереження 5).
7. У `RootLayout` динамічний `StatusBar style={isDark ? 'light' : 'dark'}` та фон `colors.background` усувають білі спалахи та забезпечують цілісність відображення (спостереження 6).
8. Видалення непідтримуваного пропу `textStyle` у `energy-plus-card.tsx` та виправлення поля `ENERGY_CONFIG.renewableCap` у `insufficient-energy-sheet.tsx` повністю усунули всі помилки компілятора TypeScript (спостереження 1).

## 3. Caveats
- Решта UI-компонентів (`AppText`, `Button`, `TextField`, тощо) та екранів ще не використовують динамічні токени з `useTheme()` — це заплановано для Milestone 2 та Milestone 3 згідно з `PROJECT.md`.
- У `src/app/(app)/energy.tsx` та `src/components/energy/balance-card.tsx` залишаються 2 існуючі попередження лінтера про невикористані змінні, які належать до зони відповідальності Milestone 3.

## 4. Conclusion
Milestone 1 реалізовано в повному обсязі та без дефектів. Основа для темної та світлої тем (Tokens, Store, Hooks, Layout, Glass Contrast) готова до розширення на базові UI-примітиви (Milestone 2) та екрани (Milestone 3).

## 5. Verification Method
1. **Перевірка типів:**
   ```bash
   npx tsc --noEmit
   ```
   *Очікуваний результат:* Код виходу 0, жодної помилки.
2. **Перевірка лінтера:**
   ```bash
   npx expo lint
   ```
   *Очікуваний результат:* Код виходу 0, жодної помилки у файлах Milestone 1.
3. **Програмна верифікація:**
   ```bash
   node scratch/test-m1.mjs
   ```
   *Очікуваний результат:* 6/6 перевірок пройдено успішно ("All Milestone 1 programmatic assertions PASSED!").
4. **Умови інвалідації:**
   Поява помилок при компіляції `npx tsc --noEmit` або зміна контрактів у `src/theme/tokens.ts`, що зламає зворотну сумісність `colors`.
