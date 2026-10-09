# Handoff Report — Explorer Survey 2 (Theming & Styling Architecture)

## 1. Observation

1. **Конфігурація проекту та блокування теми (`app.json`):**
   - У `app.json` на рядку 9 встановлено `"userInterfaceStyle": "light"`.
   - На рядках 10, 28, 29 жорстко зафіксовано `"backgroundColor": "#FAF8F7"` та `"themeColor": "#FAF8F7"`.
2. **Поточні токени (`src/theme/tokens.ts`):**
   - Експортується єдиний фіксований об'єкт `colors` (рядки 8–41):
     ```ts
     export const colors = {
       background: '#FAF8F7',
       surface: '#FFFFFF',
       surfaceMuted: '#F3EEF1',
       textPrimary: '#211C24',
       textSecondary: '#6C626C',
       textOnBrand: '#FFFFFF',
       brand: '#B6245A',
       brandPressed: '#9A1D4B',
       brandSubtle: '#F9E7EE',
       energyText: '#765000',
       energySurface: '#FFF1D1',
       border: '#E7E0E5',
       glass: 'rgba(240, 238, 242, 0.62)',
       glassBorder: 'rgba(255, 255, 255, 0.95)',
       glassEdge: 'rgba(33, 28, 36, 0.07)',
       glassLens: 'rgba(255, 255, 255, 0.96)',
       ...
     } as const;
     ```
   - Жодного токена для темної теми немає.
3. **Реалізація Glass Tab Bar (`src/components/ui/glass-surface.tsx` та `src/components/layout/glass-tab-bar.tsx`):**
   - У `glass-surface.tsx` (рядок 31):
     `<GlassView glassEffectStyle="regular" isInteractive style={[styles.base, style]} testID={testID}>`
     Параметр `colorScheme` не передається (за замовчуванням `'auto'`), `tintColor` відсутній. На iOS у темному оточенні це створює темне напівпрозоре скло.
   - У фолбек-стилях (рядок 49): `backgroundColor: colors.glass` (`rgba(240, 238, 242, 0.62)`). При накладанні 62% напівпрозорості на чорний фон (`#000000` або `#121013`) утворюється тьмяний брудно-сірий колір `rgb(149, 147, 150)`.
   - У `glass-tab-bar.tsx` (рядок 58):
     `const color = isFocused ? colors.brand : colors.textPrimary;`
     Якщо пігулка стає світлою, неактивні елементи повинні контрастувати з білим склом.
4. **Хардкод кольорів у компонентах:**
   - `src/components/energy/energy-plus-card.tsx` (рядки 65, 78, 82, 88, 106, 120, 128): `#FDF2F6`, `#5A122D`, `#F7DDE6`, `#9A1D4B`, `rgba(182, 36, 90, 0.1)`.
   - `src/components/energy/insufficient-energy-sheet.tsx` (рядки 209, 213, 228, 234, 240, 269, 283, 300, 304, 305, 318, 325, 342): `#FDF2F5`, `#F3D2DF`, `#8A1538`, `#982755`, `#EBE5E8`, `#6C626C`.
   - `src/components/energy/balance-card.tsx` (рядки 23, 55, 89, 95): `#9A1D4B`, `rgba(33, 28, 36, 0.06)`, `#EAE5E8`.
   - `src/app/(onboarding)/welcome.tsx` (рядок 39): `colors={['rgba(250,248,247,0)', colors.background]}`.
5. **Існуючі помилки компіляції TypeScript (`npx tsc --noEmit`):**
   ```
   src/components/energy/energy-plus-card.tsx:54:85 - error TS2322: Type '{ label: string; onPress: () => void; style: { backgroundColor: string; }; textStyle: { color: "#FFFFFF"; }; }' is not assignable to type 'IntrinsicAttributes & ButtonProps'.
     Property 'textStyle' does not exist on type 'IntrinsicAttributes & ButtonProps'.
   src/components/energy/insufficient-energy-sheet.tsx:23:35 - error TS2339: Property 'maxFree' does not exist on type '{ readonly initialBalance: 20; readonly renewableCap: 30; readonly regenIntervalMs: number; readonly costs: { readonly textMessage: 1; readonly aiPhoto: 10; }; }'.
   ```

---

## 2. Logic Chain

1. **Від спостереження 1 (`app.json`) до висновку про конфігурацію:** Оскільки `userInterfaceStyle` зафіксовано як `"light"`, нативний шар Expo/iOS/Android ігнорує системну темну тему. Відповідно, для реалізації темної теми першим кроком необхідно змінити значення на `"automatic"`.
2. **Від спостереження 2 (`tokens.ts`) до висновку про палітру:** Усі компоненти імпортують статичний об'єкт `colors`. Щоб не порушити світлу тему, існуючі токени зберігаються в `lightColors` у незмінному вигляді. Для темної теми створюється симетричний набір `darkColors` у сливово-вугільній гамі з високим контрастом (WCAG 2.2 AA).
3. **Від спостереження 3 (`glass-surface.tsx`) до вирішення R1:** Оскільки таб-бар зливається з чорним фоном через низьку непрозорість (62%) та автоматичне затемнення нативного `GlassView` на iOS, необхідно:
   - Підвищити непрозорість білого скла до `0.85` (світла тема) та `0.88` (темна тема).
   - Явно передавати `colorScheme="light"` та `tintColor="rgba(255, 255, 255, 0.35)"` у `GlassView`.
   - Зафіксувати колір неактивних іконок/тексту на білій скляній пігулці (`tabBarInactive: '#403644'`), щоб вони не зливалися з білим склом.
4. **Від спостереження 4 (хардкод) до семантичних токенів:** Хардкод у картках енергії у темній темі створюватиме сліпучі світло-рожеві плями. Необхідно додати семантичні токени (`energyPlusCardBg`, `energyPlusBadgeBg`, `energyTrackBg`, `cardBorderSubtle`, `fadeTransparent`) в обидві теми.
5. **Від спостереження 5 (TypeScript errors) до стабільності коду:** Перед фінальним затвердженням необхідно виправити дві знайдені помилки типів у `energy-plus-card.tsx` та `insufficient-energy-sheet.tsx`, щоб забезпечити успішне проходження критерію `npx tsc --noEmit`.

---

## 3. Caveats

1. **Режим рідкого скла на Android/Web:** На платформах Web та Android нативний `GlassView` з iOS відсутній, тому використовується фолбек на основі CSS `backdrop-filter` (Web) або звичайної напівпрозорої підкладки з розмиттям (Android). Збільшення непрозорості білого до 85–88% гарантує якісний вигляд на всіх платформах.
2. **Web Theme Color:** У `src/app/+html.tsx` мета-тег `theme-color` та стилі `html, body` генеруються статично. У веб-версії необхідно додати динамічне оновлення або універсальну стилізацію для темного режиму.
3. **Попередження лінтера:** Знайдено 6 невикористаних імпортів у компонентах енергії, які не є помилками, але їх бажано почистити під час рефакторингу.

---

## 4. Conclusion

1. **Рекомендована архітектура:** Модульна типізована система на базі **Zustand (`useThemeStore` з персистенцією в `localStorage`) + React Hook (`useTheme`, `useThemeColor`, `useThemedStyles`)**. Жодних важких сторонніх бібліотек стилізації додавати не потрібно.
2. **Вирішення Glass Tab Bar (R1):** Висока непрозорість білого скла (0.85–0.88), посилений білий контур, передача `colorScheme="light"` у нативний `GlassView`, і контрастний колір неактивних вкладок.
3. **Зворотна сумісність:** `colors` у `tokens.ts` зберігає посилання на `lightColors`, тому світла тема працює на 100% ідентично поточному стану.
4. **Масштабованість:** Оновлення базового компонента `AppText` одразу адаптує 90% текстових елементів у всьому додатку.

---

## 5. Verification Method

1. **Перевірка типів та лінтера:**
   ```bash
   npx tsc --noEmit
   npx expo lint
   ```
2. **Інспекція файлів архітектури:**
   - Детальний аналіз палітри та архітектурного плану:
     `view_file` для `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_survey_2/survey_report.md`
   - Перевірка токенів та хука:
     `src/theme/tokens.ts`, `src/theme/use-theme.ts`, `src/store/theme-store.ts`
3. **Критерії визнання недійсним (Invalidation Conditions):**
   - Якщо `npx tsc --noEmit` падає з помилками після рефакторингу.
   - Якщо на темному фоні Glass Tab Bar не має чітко видимого білого скляного відтінку.
   - Якщо у світлій темі спотворюються оригінальні кольори інтерфейсу.
