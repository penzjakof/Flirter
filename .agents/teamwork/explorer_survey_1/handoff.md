# Handoff Report: Explorer Survey 1 (Navigation & Tab Bar)

**Date:** 2026-10-08  
**Agent:** Explorer Survey 1 (Navigation & Tab Bar Specialist)  
**Parent Orchestrator:** `5b8faf1c-db5b-44d2-97f4-454d87ee8f92`  
**Working Directory:** `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_survey_1`  
**Handoff Type:** Hard (Task complete)  

---

## 1. Observation

1. **Реалізація навігації та таб-бару:**
   - `src/app/(app)/(tabs)/_layout.tsx`:
     - Рядок 26: `tabBar={(props) => <GlassTabBar {...props} />}` монтує кастомний таб-бар у компонент `<Tabs>`.
     - Рядок 29: `sceneStyle: { backgroundColor: colors.background }` використовує статичний токен `colors.background`.
     - Рядки 31, 35, 40: визначено три вкладки: `index` (Знайомства), `chats` (Чати, з бейджем `unreadCount`), `profile` (Профіль).
   - `src/app/_layout.tsx`:
     - Рядок 23: `<StatusBar style="dark" />` захардкоджений як `"dark"`.
     - Рядок 26: `Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}`.
     - Рядок 54: `styles.frame: { backgroundColor: colors.background }`.
   - `src/app/(app)/_layout.tsx`:
     - Рядок 11: `contentStyle: { backgroundColor: colors.background }`.

2. **Стилізація Glass Tab Bar:**
   - `src/components/layout/glass-tab-bar.tsx`:
     - Рядки 16–29: хуки `useBottomOffset()`, `useFloatingTabBarTop()`, `useFloatingTabBarInset()`. `floatingTabBarHeight` дорівнює `64px`, `floatingTabBarGap` — `12px`.
     - Рядки 50–51: `<View style={[styles.wrapper, { bottom: bottomOffset }]}><GlassSurface style={styles.pill}>`.
     - Рядок 53: `<Animated.View style={[styles.highlight, { width: itemWidth }, highlightStyle]} />` — лінза активної вкладки з `backgroundColor: colors.glassLens` (`rgba(255, 255, 255, 0.96)`).
     - Рядок 58: `const color = isFocused ? colors.brand : colors.textPrimary;`. Неактивні елементи отримують `colors.textPrimary` (`#211C24`).
     - Рядки 146–147: `borderColor: colors.surface` у бейджі непрочитаних.
   - `src/components/ui/glass-surface.tsx`:
     - Рядок 8: `const HAS_NATIVE_LIQUID_GLASS = Platform.OS === 'ios' && isLiquidGlassAvailable();`.
     - Рядки 30–34: на iOS рендериться `<GlassView glassEffectStyle="regular" isInteractive style={[styles.base, style]} testID={testID}>` без жодних пропсів `tintColor` або `colorScheme`.
     - Рядки 38, 48–53: на Android/Web fallback рендериться `View` з `backgroundColor: colors.glass`, `borderColor: colors.glassBorder`, `borderWidth: 1`, `...shadows.glass`.
     - Рядок 15: `WEB_BACKDROP_FILTER = 'blur(20px) saturate(180%) brightness(1.08)'`.

3. **Токени скла та кольорів:**
   - `src/theme/tokens.ts`:
     - Рядок 32: `glass: 'rgba(240, 238, 242, 0.62)'`.
     - Рядок 33: `glassBorder: 'rgba(255, 255, 255, 0.95)'`.
     - Рядок 35: `glassEdge: 'rgba(33, 28, 36, 0.07)'`.
     - Рядок 37: `glassLens: 'rgba(255, 255, 255, 0.96)'`.
     - Рядки 120–132: `shadows.glass` містить чорну тінь `shadowColor: '#211C24'` (Android) та темний контур `0 0 0 0.5px rgba(33, 28, 36, 0.07)` (Web).
     - Рядок 12: `textPrimary: '#211C24'`.

4. **Взаємодія з контентом екранів:**
   - `src/components/discover/character-grid-card.tsx`:
     - Рядок 14: `SCRIM_COLORS = ['rgba(0,0,0,0)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.78)']`.
     - Картки в сітці `DiscoverScreen` прокручуються під плаваючим таб-баром, створюючи темний або чорний фон безпосередньо під капсулою.

5. **Поточний стан перевірки типів та лінтера:**
   - Команда: `npx tsc --noEmit`
     - Результат: Вихідний код 2. 2 помилки TS (у `energy-plus-card.tsx:54` — `textStyle` не підтримується в `ButtonProps`, та в `insufficient-energy-sheet.tsx:23` — відсутня властивість `maxFree` в `ENERGY_CONFIG`).
   - Команда: `npx expo lint`
     - Результат: Вихідний код 0 (0 помилок, 6 warnings щодо невикористаних змінних).

---

## 2. Logic Chain

1. **Злиття з чорним фоном (Причина 1 — Непрозорість і відтінок):**
   - Зі спостереження 3: `colors.glass` дорівнює `'rgba(240, 238, 242, 0.62)'`.
   - Альфа-канал 0.62 пропускає 38% фонового світла. На чорному фоні (`#000000` або темний скрайм зі спостереження 4) підкладка стає брудно-сірою `(240 * 0.62 = ~149)`.
   - Тінь `shadowColor: '#211C24'` на чорному фоні дає контраст 0, тобто тіні немає. Зовнішній вигляд капсули зливається з чорним полем.

2. **Злиття з чорним фоном (Причина 2 — Нативний iOS UIVisualEffectView):**
   - Зі спостереження 2: на iOS `GlassSurface` використовує `GlassView` без пропсів `colorScheme` та `tintColor`.
   - При системному Dark Mode iOS нативно перемикає `glassEffectStyle="regular"` на темний блюр, роблячи капсулу чорною.
   - Отже, на iOS таб-бар примусово стає темним матеріалом на темному фоні.

3. **Втрата читабельності іконок та тексту:**
   - Зі спостереження 2 (`glass-tab-bar.tsx:58`): неактивні елементи отримують колір `colors.textPrimary` (`#211C24`).
   - На затемненому склі темно-графітовий колір `#211C24` практично невидимий.
   - Якщо в темній темі `textPrimary` зробити білим (`#FFFFFF`), а таб-бар за вимогою R1 зробити білим матовим склом з високою непрозорістю, то білі іконки зникнуть вже на білому склі.
   - Отже, колір елементів таб-бару повинен визначатися окремим токеном (`tabBarInactive`), який контрастує саме з білою поверхнею скла (наприклад, `#4A424D`).

4. **Інтеграція з системою тем:**
   - Зі спостережень 1, 2, 3: в додатку повністю відсутня динамічна тема — всі кольори та стилі (включаючи `StatusBar`) захардкоджені на статичні токени світлої теми.
   - Щоб підтримати R1 та R2, архітектура повинна надати реактивне перемикання теми (`useTheme` / Zustand store), динамічний `StatusBar`, оновлення кольорів для навігаційних контейнерів (`contentStyle`, `sceneStyle`) та налаштування вибору теми в профілі користувача.

---

## 3. Caveats

- **Відсутність модифікації коду:** Згідно з протоколом дослідника (Explorer), жодних змін у вихідний код додатку не вносилося (read-only investigation).
- **Існуючі помилки TS:** Дві виявлені помилки TS у компонентах `energy-plus-card.tsx` та `insufficient-energy-sheet.tsx` не пов'язані з навігацією, але повинні бути враховані командою розробників при фінальній валідації (`npx tsc --noEmit`).
- **Поведінка Android:** Оскільки React Native на Android не має нативної підтримки CSS `backdrop-filter`, ефект матового скла досягається через підвищену білу непрозорість `0.85–0.90` та білий бордер `1.5px`.

---

## 4. Conclusion

1. **Точний діагноз проблеми Tab Bar:**
   Tab Bar зливається з чорним фоном через низьку непрозорість `colors.glass` (0.62), відсутність `tintColor`/`colorScheme="light"` у нативному `GlassView` на iOS, невидимість чорної тіні та майже чорний колір неактивних іконок `colors.textPrimary` (`#211C24`).
2. **Конкретне рішення для R1 (Glass Tab Bar Contrast):**
   - Збільшити білизну та непрозорість `colors.glass` до `rgba(255, 255, 255, 0.85–0.88)`.
   - У `GlassSurface` передавати нативному `GlassView` параметри `tintColor="rgba(255, 255, 255, 0.85)"` та `colorScheme="light"`.
   - Ввести спеціальний токен `colors.tabBarInactive` (наприклад, `#4A424D` / `rgba(33, 28, 36, 0.7)`), щоб неактивні іконки та підписи зберігали високий контраст на білому склі як у світлій, так і в темній темі.
3. **Конкретне рішення для R2 (Theming Integration):**
   - Створити `useThemeStore` з вибором `system` / `light` / `dark` та збереженням у `persistStorage`.
   - Підключити тему до `StatusBar` у `src/app/_layout.tsx` (`style={isDark ? 'light' : 'dark'}`).
   - Підключити динамічні фони до `Stack.contentStyle` та `Tabs.sceneStyle`.
   - Додати перемикач теми у `src/app/(app)/(tabs)/profile.tsx`.

Повний технічний звіт розміщено у:  
`/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_survey_1/survey_report.md`

---

## 5. Verification Method

Будь-який наступний агент або рецензент може незалежно верифікувати висновки за такими кроками:
1. **Перевірка поточних токенів та компонентів:**
   - Оглянути `src/theme/tokens.ts` (рядки 32, 58, 120): переконатися, що `glass` має альфа 0.62, а `textPrimary` — `#211C24`.
   - Оглянути `src/components/ui/glass-surface.tsx` (рядки 28–42): переконатися у відсутності `tintColor` та `colorScheme`.
   - Оглянути `src/components/layout/glass-tab-bar.tsx` (рядок 58): переконатися, що неактивний колір прив'язаний до `colors.textPrimary`.
2. **Запуск команд контролю якості:**
   - `npx expo lint` (повинен повертати 0 помилок).
   - `npx tsc --noEmit` (підтвердити 2 існуючі помилки у модулі energy).
3. **Умови інвалідації:**
   - Висновок про необхідність `colorScheme="light"` / `tintColor` буде інвалідовано лише у випадку, якщо дизайн вимагатиме чорного матового скла у темній темі (що суперечить прямому запиту користувача в R1: «додавши більше білого відтінку/непрозорості, щоб він не зливався з чорним фоном»).
