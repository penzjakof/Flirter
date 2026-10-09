# Handoff Report — Explorer Survey 3 (Screens & Components Inventory)

## 1. Observation
1. **Структура маршрутів та екранів:** У `src/app/` виявлено рівно 20 `.tsx` файлів маршрутів та макетів:
   - Root: `_layout.tsx`, `+html.tsx`, `+not-found.tsx`, `sheet-test.tsx`, `legal/[doc].tsx`.
   - Onboarding: `(onboarding)/_layout.tsx`, `welcome.tsx`, `age.tsx`, `disclosure.tsx`, `profile-setup.tsx`, `sign-in.tsx`, `verify.tsx`.
   - App: `(app)/_layout.tsx`, `(app)/energy.tsx`, `(app)/character/[id].tsx`, `(app)/chat/[id].tsx`.
   - Tabs: `(app)/(tabs)/_layout.tsx`, `(app)/(tabs)/index.tsx`, `(app)/(tabs)/chats.tsx`, `(app)/(tabs)/profile.tsx`.
2. **Структура компонентів:** У `src/components/` виявлено рівно 34 `.tsx` компоненти:
   - UI (11): `app-text.tsx`, `avatar.tsx`, `bottom-sheet.tsx`, `button.tsx`, `checkbox.tsx`, `chip.tsx`, `glass-surface.tsx`, `icon-button.tsx`, `option-group.tsx`, `selectable-chip.tsx`, `text-field.tsx`.
   - Layout (3): `app-header.tsx`, `boot-screen.tsx`, `glass-tab-bar.tsx`.
   - Onboarding (2): `onboarding-gate.tsx`, `onboarding-layout.tsx`.
   - Discover (4): `character-grid-card.tsx`, `filter-sheet.tsx`, `gender-selector.tsx`, `interest-chips.tsx`.
   - Chat (3): `composer.tsx`, `message-bubble.tsx`, `typing-indicator.tsx`.
   - Energy (9): `balance-card.tsx`, `energy-chip.tsx`, `energy-hero-card.tsx`, `energy-packages-list.tsx`, `energy-plus-card.tsx`, `insufficient-energy-sheet.tsx`, `package-option.tsx`, `vip-card.tsx`, `waiting-characters.tsx`.
   - Common/PWA (2): `brand-mark.tsx`, `pwa/install-sheet.tsx`.
3. **Glass Tab Bar та Glass Surface:**
   - У `src/theme/tokens.ts`:
     - Рядок 32: `glass: 'rgba(240, 238, 242, 0.62)'`
     - Рядок 33: `glassBorder: 'rgba(255, 255, 255, 0.95)'`
     - Рядок 37: `glassLens: 'rgba(255, 255, 255, 0.96)'`
   - У `src/components/layout/glass-tab-bar.tsx`:
     - Рядок 58: `const color = isFocused ? colors.brand : colors.textPrimary;`
     - Рядок 121: `backgroundColor: colors.glassLens, ...shadows.lens`
   - У `src/components/ui/glass-surface.tsx`:
     - Рядки 49-51: `backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, ...shadows.glass`
4. **Критичні баги в Dark Mode:**
   - `src/components/ui/selectable-chip.tsx` рядки 24 та 54:
     - `const contentColor = selected ? colors.textOnBrand : colors.textPrimary;`
     - `selected: { backgroundColor: colors.textPrimary }`
     Якщо `textPrimary` у темній темі стає світлим (`#FAF8F7`), фон вибраного чіпа стає світлим, а текст — білим `textOnBrand` (`#FFFFFF`), що робить текст невидимим (білий на білому).
   - `src/app/(onboarding)/welcome.tsx` рядок 39:
     - `<LinearGradient colors={['rgba(250,248,247,0)', colors.background]} ... />` — hardcoded світлий колір `#FAF8F7` з нульовою прозорістю, що на темному фоні створить білу пляму.
   - `src/app/_layout.tsx` рядок 23:
     - `<StatusBar style="dark" />` — жорстко задано темні іконки статус-бару.
5. **Hardcoded кольори в Energy-компонентах:**
   - `energy-plus-card.tsx` рядки 38, 46, 65, 78, 82, 88, 99, 106, 120, 128: кольори `#5A122D`, `#FDF2F6`, `#F7DDE6`, `#9A1D4B`, `rgba(182, 36, 90, 0.1)`.
   - `insufficient-energy-sheet.tsx` рядки 209, 213, 228, 234, 240, 269, 283, 300, 304, 305, 318, 325, 342: кольори `#FDF2F5`, `#F3D2DF`, `#8A1538`, `#982755`, `#EBE5E8`, `#6C626C`.
   - `energy-packages-list.tsx` рядки 69, 80, 83, 89: кольори `#FDF2F6`, `#5A122D`, `#F7DDE6`, `#9A1D4B`.
   - `balance-card.tsx` рядки 23, 89, 95: кольори `#9A1D4B`, `#EAE5E8`.
6. **Імпорти та статичні стилі:** У 50+ файлах `colors` імпортується з `@/theme/tokens` як константний об'єкт і використовується безпосередньо в статичних викликах `StyleSheet.create({ ... })`.

## 2. Logic Chain
1. Зі спостереження (3) випливає, що `GlassTabBar` накладається на чорний або темний фон із прозорістю 0.62 (`rgba(240, 238, 242, 0.62)`). Оскільки темний фон просвічує крізь скло на 38%, загальний відтінок панелі стає брудно-сірим, через що вона зливається з чорним тлом. Щоб виконати вимогу R1, непрозорість та частка білого кольору повинні бути суттєво збільшені (до 0.85–0.90), контур має бути підсилений, а тіні адаптовані.
2. Зі спостереження (4) випливає, що проста зміна значення `colors.textPrimary` на білий у темній темі призведе до непомітної, але катастрофічної регресії у `SelectableChip` (білий текст на білому фоні) та дефектів у градієнті `welcome.tsx`. Це доводить, що система тем потребує перегляду семантики цих компонентів.
3. Зі спостереження (5) випливає, що блок енергії створювався без дотримання дизайн-токенів із великою кількістю вшитих рожевих та вишневих hex-значень. Без їх усунення темна тема буде виглядати частково зламаною.
4. Зі спостереження (6) випливає, що заміна значень у `tokens.ts` не оновить екрани динамічно без перезавантаження бандла, якщо компоненти звертаються до `colors` у статичному `StyleSheet.create`. Тому потрібна повноцінна архітектура теми (`useTheme` хук / динамічні стилі).

## 3. Caveats
- Дослідження проводилося в режимі read-only, жодних файлів вихідного коду змінено не було.
- Додаткові сторонні бібліотеки стилізації (наприклад, NativeWind) наразі відсутні в проекті (`package.json`); впровадження системи тем має базуватися або на рідному контексті/хуку React/Zustand, або на узгодженому рішенні команди.
- Візуальний вигляд перевірявся аналітично через аналіз коду та CSS/RN-властивостей, оскільки в даному режимі запуск симулятора iOS не проводився.

## 4. Conclusion
1. Додаток містить 20 маршрутів та 34 компоненти, 100% з яких заінвентаризовано.
2. Для виконання вимоги R1 (Glass Tab Bar contrast): необхідно збільшити білу непрозорість `colors.glass` до ~0.88–0.90 на темному фоні, посилити білу рамку та оптимізувати контраст неактивних табів.
3. Для виконання вимоги R2 (Theming System): необхідно впровадити `lightColors` / `darkColors` у `tokens.ts`, хук `useTheme()`, динамічний `StatusBar`, та адаптувати всі 34 компоненти й екрани згідно зі складеним чеклистом у `survey_report.md`.
4. Усі виявлені hardcoded кольори та критичні пастки задокументовані у файлі:  
   `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_survey_3/survey_report.md`.

## 5. Verification Method
1. **Перевірка наявності артефактів:**
   - Перевірити існування файлу звіту:
     `ls -la /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_survey_3/survey_report.md`
   - Перевірити існування файлу передачі:
     `ls -la /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_survey_3/handoff.md`
2. **Перевірка типів та лінтера проекту (підтвердження, що дослідження не пошкодило кодову базу):**
   - `npx tsc --noEmit`
   - `npx expo lint`
3. **Умови інвалідації висновків:**
   - Додавання нових екранів у `src/app/` або компонентів у `src/components/`, які не увійшли до даного реєстру.
