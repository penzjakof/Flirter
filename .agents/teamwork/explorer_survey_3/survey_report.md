# Детальний звіт інвентаризації екранів та UI-компонентів Flirter (Expo/React Native)

**Дата дослідження:** 2026-10-08  
**Дослідник:** Explorer Survey 3 (Screens & Components Inventory Specialist)  
**Цільова система:** Flirter Frontend (Expo SDK ~57, React Native 0.86, React 19, Expo Router)  
**Вимоги:** Впровадження повномасштабної підтримки світлої/темної тем (R2) та підвищення контрастності/білого відтінку Glass Tab Bar (R1).

---

## 1. Загальне резюме (Executive Summary)

В ході дослідження було проаналізовано **100% маршрутів (20 файлів)** та **100% компонентів (34 файли)** додатку.

### Ключові висновки:
1. **Статична архітектура кольорів:** Наразі в додатку відсутній динамічний механізм тем (`useTheme`, `ThemeProvider` чи реактивний store тем). У файлі `src/theme/tokens.ts` визначено єдиний статичний об'єкт `colors`, значення якого жорстко зашиті виключно під світлу тему (наприклад, `background: '#FAF8F7'`, `surface: '#FFFFFF'`, `textPrimary: '#211C24'`).
2. **Проблема з кешуванням стилів (`StyleSheet.create`):** Більшість компонентів та екранів звертаються до `colors.*` прямо всередині `StyleSheet.create` на рівні модулів. У React Native це означає, що стилі обчислюються **одноразово** під час імпорту файлу. Без переходу на динамічні стилі чи контекст теми зміна теми на льоту не матиме ефекту.
3. **Glass Tab Bar (R1):** Нижня скляна панель використовує `colors.glass` (`rgba(240, 238, 242, 0.62)`) та `colors.glassBorder` (`rgba(255, 255, 255, 0.95)`). На чорному або темному фоні прозорість 0.62 робить панель каламутно-сірою та темною, через що вона повністю зливається з тлом. Крім того, активна лінза (`colors.glassLens: rgba(255, 255, 255, 0.96)`) та неактивні іконки (`colors.textPrimary: #211C24`) не адаптовані під темні поверхні.
4. **Критичні візуальні пастки Dark Mode (Silent Regressions):**
   - **`SelectableChip`:** Текст вибраного чіпа має `colors.textOnBrand` (`#FFFFFF`), а фон встановлено як `colors.textPrimary`. Якщо `textPrimary` у темній темі стане світлим (білим), вибраний чіп матиме **білий текст на білому фоні** (текст стане повністю невидимим!).
   - **`welcome.tsx`:** Має hardcoded градієнт `['rgba(250,248,247,0)', colors.background]`. Перший колір — прозорий бежевий `#FAF8F7`, що на темному фоні створить білу каламутну смугу.
   - **Блок Energy (`insufficient-energy-sheet.tsx`, `energy-plus-card.tsx`, `balance-card.tsx`, `energy-packages-list.tsx`):** Містить масивну кількість хардкод-кольорів (`#FDF2F5`, `#FDF2F6`, `#F3D2DF`, `#5A122D`, `#8A1538` тощо), які ігнорують будь-яку тему й створюють різкі світло-рожеві плями на темному екрані.
   - **`RootLayout`:** Має жорстко зашитий `<StatusBar style="dark" />`, що робить системні піктограми годинника та батареї чорними й невидимими на темному фоні.

---

## 2. Повна інвентаризація екранів та маршрутів (`src/app/` — 20 файлів)

| № | Маршрут / Файл | Назва / Призначення | Поточні стилі та залежності від кольорів | Необхідні зміни для Dark / Light Theme |
|---|---|---|---|---|
| 1 | `src/app/_layout.tsx` | **Root Layout** (Головний каркас) | `colors.background` у `Stack` (`contentStyle`), `styles.frame`. Жорстко зашитий `<StatusBar style="dark" />`. | Динамічний `backgroundColor` для `Stack.contentStyle` та `frame`. Динамічний `StatusBar` (`dark` для light-теми, `light` для dark-теми). |
| 2 | `src/app/+html.tsx` | **HTML Template** (PWA/Web оболонка) | Hardcoded `#FAF8F7` у `<meta name="theme-color">`, `color-scheme: light`, body `#EFEAED`, outline `#B6245A`. | Підтримка адаптивного `theme-color`, `color-scheme: light dark`, медіа-запиту `@media (prefers-color-scheme: dark)` для фону body. |
| 3 | `src/app/+not-found.tsx` | **404 Not Found Screen** | `styles.container` має `backgroundColor: colors.background`. Тексти через `AppText`, кнопка `Button`. | Забезпечити динамічний фон `container` через тему. Тексти й кнопка адаптуються автоматично. |
| 4 | `src/app/sheet-test.tsx` | **Sheet Test Route** (Тестовий екран) | Hardcoded `backgroundColor: 'blue'`. Використовує `InsufficientEnergySheet`. | Тестовий файл. Бажано прив'язати до теми для консистентності тестування. |
| 5 | `src/app/legal/[doc].tsx` | **Legal Reader** (Умови, приватність, AI) | `safeArea` має `backgroundColor: colors.background`. `IconButton`, `AppText`. | Динамічний фон `safeArea` (`colors.background`), іконка `IconButton` має бути контрастною. |
| 6 | `src/app/(onboarding)/_layout.tsx` | **Onboarding Stack Layout** | `Stack` має `contentStyle: { backgroundColor: colors.background }`. | Динамічний фон у `contentStyle` стеку, щоб уникнути білого мерехтіння при переходах. |
| 7 | `src/app/(onboarding)/welcome.tsx` | **S01 Welcome Screen** | `safeArea` (`colors.background`), `photo` (`colors.surfaceMuted`), `collageFade` (`['rgba(250,248,247,0)', colors.background]`), `ageBadge` (`colors.mediaScrim`). | Замінити hardcoded `'rgba(250,248,247,0)'` на динамічний прозорий колір теми (наприклад, `transparentFade(theme.colors.background)`). Динамічні фони `safeArea` та `photo`. |
| 8 | `src/app/(onboarding)/age.tsx` | **S02 Age Verification** | `privacyNote` має `backgroundColor: colors.surfaceMuted`. `TextField`, `Button`, `AppText`. | `surfaceMuted` має стати темним відтінком у Dark Mode, щоб примітка не виглядала світлою плямою. |
| 9 | `src/app/(onboarding)/sign-in.tsx` | **S03 Sign In Screen** | Власного бекграунду в стилях немає, спирається на `OnboardingLayout`, `TextField`, `Button`, `AppText`. | Усі дочірні компоненти повинні коректно наслідувати кольори теми. |
| 10 | `src/app/(onboarding)/verify.tsx` | **S04 OTP Verify Screen** | `demoNote` має `backgroundColor: colors.brandSubtle`. `TextField`, `Button`. | `brandSubtle` повинен мати темний аналог (приглушений глибокий винний відтінок, наприклад `rgba(182, 36, 90, 0.2)`). |
| 11 | `src/app/(onboarding)/profile-setup.tsx` | **S05 Profile Setup Screen** | Власних кольорів немає, використовує `OnboardingLayout`, `TextField`, `OptionGroup`, `Button`. | Адаптація компонентів `TextField` та `OptionGroup`. |
| 12 | `src/app/(onboarding)/disclosure.tsx` | **S06 AI Disclosure Screen** | `facts` (`colors.surface`, `colors.border`), `factIcon` (`colors.brandSubtle`), `divider` (`colors.border`). `Checkbox`. | `facts` card має мати темний `surface`, темніший `border`, темний `brandSubtle` для іконок, коректний колір розділювача `divider`. |
| 13 | `src/app/(app)/_layout.tsx` | **App Stack Layout** | `Stack` має `contentStyle: { backgroundColor: colors.background }`. | Динамічний `contentStyle` відповідно до поточної теми. |
| 14 | `src/app/(app)/(tabs)/_layout.tsx` | **Tabs Navigator Layout** | `sceneStyle: { backgroundColor: colors.background }`. Використовує `GlassTabBar`. | Динамічний `sceneStyle` фону вкладок, передача поточної теми в `GlassTabBar`. |
| 15 | `src/app/(app)/(tabs)/index.tsx` | **S08 Discover (Знайомства)** | `safeArea` (`colors.background`), `emptyIcon` (`colors.brandSubtle`). `AppHeader`, `InterestChips`, `CharacterGridCard`, `FilterSheet`. | Динамічний фон `safeArea`, адаптація `emptyIcon` та стану відсутності збігів (`EmptyFilterResult`). |
| 16 | `src/app/(app)/(tabs)/chats.tsx` | **S12 Chats (Чати)** | `safeArea` (`colors.background`), `rowPressed` (`colors.surfaceMuted`), `dismiss` (`colors.surfaceMuted`), `emptyIcon` (`colors.brandSubtle`), аватар `ringColor: colors.surface`. | Динамічний фон списку, кольори для натиснутих рядків (`rowPressed`), темне кільце аватара (`ringColor`), колір кнопки dismiss (`colors.surfaceMuted`). |
| 17 | `src/app/(app)/(tabs)/profile.tsx` | **S26 Profile & Settings** | `safeArea` (`colors.background`), `profileCard` (`colors.surface`, `colors.border`), `groupCard` (`colors.surface`, `colors.border`), `rowPressed` (`colors.surfaceMuted`), `divider` (`colors.border`). | `profileCard` та `groupCard` повинні стати темними картками (`surface: #1E1920`), межі `border` темнішими, `rowPressed` адаптивним. |
| 18 | `src/app/(app)/character/[id].tsx` | **S10 Character Profile** | `root`/`missing`/`body` (`colors.background`), `photoWrapper` (`colors.surfaceMuted`), `aboutAi` (`colors.brandSubtle`), `stickyCta` (`colors.background`, `borderTopColor: colors.border`). | Динамічний фон `body` і `stickyCta`, колір розділювача `borderTopColor`, темний фон блоку `aboutAi`. |
| 19 | `src/app/(app)/chat/[id].tsx` | **S13 Direct Chat Screen** | `safeArea`/`header` (`colors.background`, `borderBottomColor: colors.border`), `suggestion` (`borderColor: colors.brand`, `backgroundColor: colors.surface`), `suggestionPressed` (`colors.brandSubtle`). | Динамічний фон чату та хедера, темний фон для `suggestion` кнопок підказок, адаптація `Composer` та `MessageBubble`. |
| 20 | `src/app/(app)/energy.tsx` | **S19 Energy Store Screen** | `safeArea` (`colors.background`), використовує `BalanceCard`, `WaitingCharacters`, `EnergyPlusCard`, `EnergyPackagesList`, `BottomSheet`. | Динамічний фон екрана, повна адаптація всіх дочірніх енергетичних карток. |

---

## 3. Повна інвентаризація UI-компонентів (`src/components/` — 34 файли)

### 3.1. Базові компоненти інтерфейсу (`src/components/ui/` — 11 файлів)

#### 1. `app-text.tsx` (`AppText`)
- **Поточний стан:** Має проп `color?: ColorToken` (дефолт `'textPrimary'`). Рендерить `<Text style={[typography[variant], { color: colors[color] }, ...]}>`.
- **Проблема в Dark Mode:** Зараз читає статичний об'єкт `colors[color]`. У темній темі дефолтний `'textPrimary'` (`#211C24`) буде чорним на темному фоні.
- **Необхідна зміна:** Підключити читання кольору з поточної активної теми (`const theme = useTheme(); return <Text style={[..., { color: theme.colors[color] }]} />`).

#### 2. `avatar.tsx` (`Avatar`)
- **Поточний стан:** `wrapper` має `backgroundColor: colors.surfaceMuted`. Проп `ringColor?: string`.
- **Проблема в Dark Mode:** Якщо `ringColor` передається як `colors.surface` (білий), на темному фоні навколо аватара з'явиться біле кільце. Плейсхолдер `surfaceMuted` має бути темним.
- **Необхідна зміна:** `ringColor` за замовчуванням має братися з теми (`theme.colors.surface`), фон плейсхолдера — `theme.colors.surfaceMuted`.

#### 3. `bottom-sheet.tsx` (`BottomSheet`)
- **Поточний стан:** `backdrop` (`backgroundColor: colors.overlay`), `sheet` (`backgroundColor: colors.surface`), `handle` (`backgroundColor: colors.border`).
- **Проблема в Dark Mode:** Шторка модального вікна залишається сліпучо білою (`#FFFFFF`), а маркер `handle` стає непомітним.
- **Необхідна зміна:** `sheet.backgroundColor` повинен бути темною поверхнею (`theme.colors.surface`), `handle` — темним контрастним розділювачем (`theme.colors.border`).

#### 4. `button.tsx` (`Button`)
- **Поточний стан:** Статичний об'єкт на рівні файлу `VARIANT_STYLES`:
  - `primary`: background `brand`, text `textOnBrand`
  - `secondary`: background `surface`, pressed `surfaceMuted`, text `textPrimary`, border `border`
  - `ghost`: background `transparent`, pressed `brandSubtle`, text `brand`
  - `danger`: background `surface`, pressed `surfaceMuted`, text `danger`, border `border`
- **Проблема в Dark Mode:** Кнопки `secondary` та `danger` мають білий фон `surface` (`#FFFFFF`). На темному екрані другорядна біла кнопка стає візуально набагато яскравішою за первинну ягідну кнопку!
- **Необхідна зміна:** `VARIANT_STYLES` має бути динамічною функцією від теми: у темній темі `secondary` кнопка повинна мати темну поверхню або контурний стиль з темним `surfaceMuted` при натисканні.

#### 5. `checkbox.tsx` (`Checkbox`)
- **Поточний стан:** `box` має `borderColor: colors.textSecondary`, `backgroundColor: colors.surface`. При `checked`: `backgroundColor: colors.brand`.
- **Проблема в Dark Mode:** Неактивний чекбокс має яскраво-білий квадрат `colors.surface`, що ріже око.
- **Необхідна зміна:** Зробити фон неактивного чекбокса темним (`theme.colors.surface` або `transparent`), рамку — `theme.colors.textSecondary` або `theme.colors.border`.

#### 6. `chip.tsx` (`Chip`)
- **Поточний стан:** Тон `neutral` має `backgroundColor: colors.surfaceMuted`, `brand` має `backgroundColor: colors.brandSubtle`, `onMedia` має `backgroundColor: 'rgba(255, 255, 255, 0.22)'`. Текст для neutral — `textPrimary`.
- **Проблема в Dark Mode:** `surfaceMuted` та `brandSubtle` мають світлі пастельні відтінки.
- **Необхідна зміна:** Використовувати тематичні `theme.colors.surfaceMuted` та `theme.colors.brandSubtle`.

#### 7. `glass-surface.tsx` (`GlassSurface`)
- **Поточний стан:** На iOS: `isLiquidGlassAvailable()` -> `<GlassView glassEffectStyle="regular">`. Fallback: `backgroundColor: colors.glass` (`rgba(240, 238, 242, 0.62)`), `borderColor: colors.glassBorder` (`rgba(255, 255, 255, 0.95)`), `backdropFilter`.
- **Проблема в Dark Mode:** Див. окремий розділ §4 по Glass Tab Bar. Прозорість 0.62 на темному фоні робить скло брудним і темним.
- **Необхідна зміна:** Збільшити частку білого кольору (непрозорість) до 0.82–0.90 або додати світлий адаптивний відтінок, забезпечити контрастну білу окантовку.

#### 8. `icon-button.tsx` (`IconButton`)
- **Поточний стан:** Дефолтний колір іконки: `color = colors.textPrimary`, `pressed: { backgroundColor: colors.surfaceMuted }`.
- **Проблема в Dark Mode:** Оскільки дефолтне значення `color` береться статично з `colors.textPrimary` (`#211C24`), якщо його не обчислювати динамічно від теми, всі кнопки навігації (Back, Close, Options) залишаться чорними й зникнуть на темному фоні!
- **Необхідна зміна:** Обчислювати дефолтний `color` через `theme.colors.textPrimary`.

#### 9. `option-group.tsx` (`OptionGroup`)
- **Поточний стан:** `option` має `backgroundColor: colors.surface`, `borderColor: colors.border`. `optionSelected` має `backgroundColor: colors.brandSubtle`, `borderColor: colors.brand`.
- **Проблема в Dark Mode:** Необрані опції відображаються як білі плашки; обрана плашка має світло-рожевий фон `#F9E7EE`.
- **Необхідна зміна:** Необрана опція повинна мати темний фон `theme.colors.surface`, обрана — темний ягідний `theme.colors.brandSubtle`.

#### 10. `selectable-chip.tsx` (`SelectableChip`) — ⚠️ **КРИТИЧНА ПАСТКА!**
- **Поточний стан:**
  - `contentColor = selected ? colors.textOnBrand (#FFF) : colors.textPrimary`
  - `styles.chip`: `backgroundColor: colors.surfaceMuted`
  - `styles.selected`: `backgroundColor: colors.textPrimary`
- **Критична проблема в Dark Mode:** У світлій темі `textPrimary` — чорний (`#211C24`), тому на ньому білий текст `textOnBrand` (`#FFF`) чудово читається. Якщо в темній темі змінити токен `textPrimary` на білий (`#FAF8F7`), фон вибраного чіпа стане **білим**, а текст залишиться **білим (`textOnBrand`)**. В результаті текст стане невидимим!
- **Необхідна зміна:** Семантика вибраного чіпа має бути змінена: або вибраний чіп має фон бренду (`theme.colors.brand`) із текстом `theme.colors.textOnBrand`, або в темній темі колір тексту має бути `theme.colors.background` (чорним на білій плашці).

#### 11. `text-field.tsx` (`TextField`)
- **Поточний стан:** `input` має `backgroundColor: colors.surface`, `color: colors.textPrimary`, `borderColor = isFocused ? colors.brand : colors.border`, `placeholderTextColor={colors.textSecondary}`.
- **Проблема в Dark Mode:** Поле введення наразі жорстко біле з чорним текстом.
- **Необхідна зміна:** `backgroundColor` -> `theme.colors.surface`, `color` -> `theme.colors.textPrimary`, `borderColor` -> `theme.colors.border`, `placeholderTextColor` -> `theme.colors.textSecondary`.

---

### 3.2. Компоненти макета (`src/components/layout/` — 3 файли)

#### 12. `glass-tab-bar.tsx` (`GlassTabBar`)
- **Поточний стан:** Обернутий у `<GlassSurface style={styles.pill}>`. Колір вкладки: `color = isFocused ? colors.brand : colors.textPrimary`. Лінза: `backgroundColor: colors.glassLens` (`rgba(255, 255, 255, 0.96)`). Бейдж: `backgroundColor: colors.brand`, `borderColor: colors.surface`.
- **Проблема в Dark Mode:** Злиття з фоном, низький контраст неактивних табів (детально в §4).
- **Необхідна зміна:** Додати білої насиченості, підтримувати високу яскравість скла на чорному фоні, динамічний колір неактивного тексту/іконки.

#### 13. `app-header.tsx` (`AppHeader`)
- **Поточний стан:** `header` має `backgroundColor: colors.background`.
- **Проблема в Dark Mode:** Світлий хедер відрізатиме контент темної сторінки.
- **Необхідна зміна:** Динамічний `backgroundColor: theme.colors.background`.

#### 14. `boot-screen.tsx` (`BootScreen`)
- **Поточний стан:** `container` має `backgroundColor: colors.background`, спінер `color: colors.brand`.
- **Проблема в Dark Mode:** При відновленні сесії в темній темі користувач побачить спалах білого екрана.
- **Необхідна зміна:** Динамічний `backgroundColor: theme.colors.background`.

---

### 3.3. Компоненти онбордингу (`src/components/onboarding/` — 2 файли)

#### 15. `onboarding-layout.tsx` (`OnboardingLayout`)
- **Поточний стан:** `safeArea` (`backgroundColor: colors.background`), `progressTrack` (`backgroundColor: colors.border`), `progressFill` (`backgroundColor: colors.brand`).
- **Проблема в Dark Mode:** Світлий фон усього флоу онбордингу.
- **Необхідна зміна:** Динамічний `backgroundColor: theme.colors.background`, контрастний трек `progressTrack: theme.colors.border`.

#### 16. `onboarding-gate.tsx` (`OnboardingGate`)
- **Поточний стан:** Суто логічний компонент-guard.
- **Необхідна зміна:** Змін не потребує (theme-agnostic).

---

### 3.4. Компоненти стрічки та фільтрів (`src/components/discover/` — 4 файли)

#### 17. `character-grid-card.tsx` (`CharacterGridCard`)
- **Поточний стан:** `card` має `backgroundColor: colors.surfaceMuted`. Скрім: `SCRIM_COLORS = ['rgba(0,0,0,0)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.78)']`. Кнопка лайку `action`: `backgroundColor: colors.surface`, іконка `colors.brand`. Кнопка чату `actionChat`: `backgroundColor: colors.brand`, іконка `colors.textOnBrand`.
- **Проблема в Dark Mode:** Кнопка сердечка `action` має фон `colors.surface` (білий). На затемненому фото це біла кругла кнопка, що нормально виглядає над медіа, але `card.backgroundColor` (плейсхолдер) має бути темним `surfaceMuted`.
- **Необхідна зміна:** `surfaceMuted` підтримувати темним. Перевірити контрастність кнопки сердечка.

#### 18. `filter-sheet.tsx` (`FilterSheet`)
- **Поточний стан:** `Switch` має `trackColor={{ true: colors.brand, false: colors.border }}`. Кнопки `Button`, чіпи `SelectableChip`, шторка `BottomSheet`.
- **Проблема в Dark Mode:** `Switch` трек у false-стані має світлий `colors.border`.
- **Необхідна зміна:** Передати динамічні кольори в `trackColor`.

#### 19. `gender-selector.tsx` (`GenderSelector`)
- **Поточний стан:** `tile`: `backgroundColor: colors.surfaceMuted`. `tileSelected`: `backgroundColor: colors.brandSubtle`, `borderColor: colors.brand`. Текст іконки: `colors.brand` / `colors.textSecondary`.
- **Проблема в Dark Mode:** Неактивні тайли світло-сірі, активний — світло-рожевий.
- **Необхідна зміна:** `surfaceMuted` та `brandSubtle` адаптувати до темної теми.

#### 20. `interest-chips.tsx` (`InterestChips`)
- **Поточний стан:** Горизонтальний скрол-контейнер для `SelectableChip`.
- **Необхідна зміна:** Спирається на `SelectableChip`. Переконатися, що відступи не мають фонових перекриттів.

---

### 3.5. Компоненти чату (`src/components/chat/` — 3 файли)

#### 21. `composer.tsx` (`Composer`)
- **Поточний стан:** Використовує скляні елементи `GlassSurface` для круглих кнопок (`roundSurface`) та поля введення (`inputSurface`).
  - Текст інпуту: `color: colors.textPrimary`
  - Плейсхолдер: `placeholderTextColor={colors.textSecondary}`
  - Іконки прикріплення/мікрофона: `color={colors.textSecondary}`
  - Кнопка відправки: `backgroundColor: colors.brand`, іконка `colors.textOnBrand`
- **Проблема в Dark Mode:** Текст введення наразі чорний (`#211C24`). Якщо він не перейде на білий у темній темі, на темному склі надруковане повідомлення буде невидимим! Скляні круглі кнопки мають мати достатній контраст над стрічкою чату.
- **Необхідна зміна:** `color: theme.colors.textPrimary`, `placeholderTextColor: theme.colors.textSecondary`, адаптивні скляні поверхні.

#### 22. `message-bubble.tsx` (`MessageBubble`)
- **Поточний стан:**
  - Вхідне повідомлення `incoming`: `backgroundColor: colors.surface` (білий!), `borderColor: colors.border` (`#E7E0E5`), текст `textPrimary`.
  - Вихідне повідомлення `outgoing`: `backgroundColor: colors.brand`, текст `textOnBrand`.
  - Дисклеймер `disclaimer`: текст `textSecondary`.
  - Стікер симпатії `LikeSticker`: кружечок `backgroundColor: colors.brand`.
- **Проблема в Dark Mode:** Вхідне повідомлення залишається білою плашкою зі світло-сірою рамкою. Вночі це сліпить очі.
- **Необхідна зміна:** Вхідна бульбашка в темній темі повинна мати фон темної поверхні (`theme.colors.surface` або `theme.colors.surfaceMuted`) з виразним контуром `theme.colors.border`, а текст `textPrimary` — білий.

#### 23. `typing-indicator.tsx` (`TypingIndicator`)
- **Поточний стан:** `bubble`: `backgroundColor: colors.surface`, `borderColor: colors.border`. Точки `dot`: `backgroundColor: colors.textSecondary`.
- **Проблема в Dark Mode:** Бульбашка індикатора друку біла, як і вхідні повідомлення.
- **Необхідна зміна:** Фон бульбашки -> `theme.colors.surface`, рамка -> `theme.colors.border`.

---

### 3.6. Компоненти магазину енергії (`src/components/energy/` — 9 файлів)

#### 24. `balance-card.tsx` (`BalanceCard`)
- **Поточний стан:**
  - `card`: `backgroundColor: colors.surface`, `borderColor: 'rgba(33, 28, 36, 0.06)'`
  - `flashIcon`: `color="#9A1D4B"` (hardcoded)
  - `amountText`: `color: colors.textPrimary`
  - `track`: `backgroundColor: '#EAE5E8'` (hardcoded світло-сірий)
  - `fill`: `backgroundColor: '#9A1D4B'` (hardcoded)
- **Проблема в Dark Mode:** Білий фон картки, чорний контур, світло-сірий трек прогресу.
- **Необхідна зміна:** Видалити hardcoded кольори `#EAE5E8`, замінити на токени теми. Зробити фон картки темним `surface`.

#### 25. `energy-chip.tsx` (`EnergyChip`)
- **Поточний стан:** `chip`: `backgroundColor: colors.energySurface` (`#FFF1D1`). Іконка й текст: `colors.energyText` (`#765000`).
- **Проблема в Dark Mode:** Яскраво-жовтий пастельний чіп на темному хедері виглядає неприродно й занадто контрастно.
- **Необхідна зміна:** Для темної теми створити гармонійний бурштиновий токен: темний золотавий фон (наприклад, `rgba(246, 196, 69, 0.16)`) та яскравий золотий текст/іконка (`#F6C445`).

#### 26. `energy-hero-card.tsx` (`EnergyHeroCard`)
- **Поточний стан:** Градієнт `LinearGradient colors={[colors.premiumDeep, colors.brand]}` (`#3B1232` -> `#B6245A`), текст `textOnMedia`, золото `colors.premiumGold`.
- **Оцінка:** Картка вже є преміальною темною за задумом (Dark by design). Прекрасно виглядає в обох темах.
- **Необхідна зміна:** Мінімальна: перевірити контрастність на темному тлі сторінки.

#### 27. `energy-packages-list.tsx` (`EnergyPackagesList`)
- **Поточний стан:**
  - `container`: `backgroundColor: colors.surface`, `borderColor: 'rgba(33, 28, 36, 0.06)'`
  - `rowRecommended`: `backgroundColor: '#FDF2F6'` (hardcoded)
  - `textRecommended`: `color: '#5A122D'` (hardcoded)
  - `badge`: `backgroundColor: '#F7DDE6'` (hardcoded), текст `#9A1D4B` (hardcoded)
  - `divider`: `backgroundColor: colors.border`
- **Проблема в Dark Mode:** Список пакетів білий, рекомендований рядок світло-рожевий, текст вишневий. На темному фоні виглядає поламано.
- **Необхідна зміна:** Повна заміна hardcoded значень на семантичні токени (`theme.colors.surface`, `theme.colors.brandSubtle`, `theme.colors.brand`).

#### 28. `energy-plus-card.tsx` (`EnergyPlusCard`)
- **Поточний стан:**
  - `card`: `backgroundColor: '#FDF2F6'` (hardcoded)
  - `title`: `color: '#5A122D'` (hardcoded)
  - `badge`: `backgroundColor: '#F7DDE6'`, текст `#9A1D4B` (hardcoded)
  - `price`: `color: '#9A1D4B'` (hardcoded)
  - `divider`: `backgroundColor: 'rgba(182, 36, 90, 0.1)'` (hardcoded)
  - `iconBox`: `backgroundColor: '#F7DDE6'`, іконки `#5A122D` (hardcoded)
  - `button`: `backgroundColor: '#9A1D4B'` (hardcoded)
- **Проблема в Dark Mode:** Увесь компонент складається з hardcoded світло-рожевих кольорів. На темному фоні це сліпуча біло-рожева пляма.
- **Необхідна зміна:** Перевести всі кольори картки під токени темної теми (темно-винний фон `colors.premiumDeep` або приглушений ягідний контур, білий/золотий текст).

#### 29. `insufficient-energy-sheet.tsx` (`InsufficientEnergySheet`)
- **Поточний стан:**
  - Найбільший компонент магазину енергії (347 рядків).
  - Hardcoded кольори: `#FDF2F5`, `#F3D2DF`, `#8A1538`, `#982755`, `#EBE5E8`, `#6C626C`.
  - `packageOption`: `backgroundColor: colors.surface`, `borderColor: '#EBE5E8'`.
- **Проблема в Dark Mode:** Вікно нестачі енергії відкривається прямо в чаті поверх чорного екрана та сліпить користувача білим полотном і рожевими плашками.
- **Необхідна зміна:** Комплексний рефакторинг стилів: заміна всіх hardcoded hex-кольорів на динамічні токени теми.

#### 30. `package-option.tsx` (`PackageOption`)
- **Поточний стан:** `card`: `backgroundColor: colors.surface`, `borderColor: colors.border`. `cardRecommended`: `backgroundColor: colors.brandSubtle`, `borderColor: colors.brand`. `icon`: `backgroundColor: colors.energySurface`.
- **Проблема в Dark Mode:** Біла поверхня картки, світло-рожевий recommended фон.
- **Необхідна зміна:** Динамічний `surface` та `brandSubtle`.

#### 31. `vip-card.tsx` (`VipCard`)
- **Поточний стан:** Градієнт `[colors.premiumInk, colors.premiumDeep]`, золото `colors.premiumGold`.
- **Оцінка:** Преміальна темна картка за дизайном. Відмінно підходить для обох тем.

#### 32. `waiting-characters.tsx` (`WaitingCharacters`)
- **Поточний стан:** `card`: `backgroundColor: colors.surface`, `borderColor: 'rgba(33, 28, 36, 0.06)'`. `Avatar ringColor={colors.surface}`.
- **Проблема в Dark Mode:** Білий фон картки, біле кільце навколо аватарок персонажів.
- **Необхідна зміна:** Фон картки -> `theme.colors.surface`, `ringColor` -> `theme.colors.surface`, бордер -> `theme.colors.border`.

---

### 3.7. Інші спільні компоненти (2 файли)

#### 33. `brand-mark.tsx` (`BrandMark`)
- **Поточний стан:** `wordmark` має колір `inverted ? 'textOnMedia' : 'textPrimary'`.
- **Проблема в Dark Mode:** Слово «flirter» при `inverted = false` має колір `textPrimary`. Якщо `textPrimary` не оновлюється під тему, логотип стає чорним на темному фоні.
- **Необхідна зміна:** Динамічний токен `theme.colors.textPrimary`.

#### 34. `install-sheet.tsx` (`InstallSheet`)
- **Поточний стан:** `steps` має `backgroundColor: colors.surfaceMuted`, `stepIndex` має `backgroundColor: colors.brandSubtle`.
- **Проблема в Dark Mode:** Світло-сірий контейнер кроків установки PWA.
- **Необхідна зміна:** Використовувати тематичні `theme.colors.surfaceMuted` та `theme.colors.brandSubtle`.

---

## 4. Глибокий аналіз Glass Tab Bar та рішення контрастності (Вимога R1)

### 4.1. Поточний стан реалізації
Glass Tab Bar реалізовано у двох взаємопов'язаних файлах:
1. `src/components/layout/glass-tab-bar.tsx`
2. `src/components/ui/glass-surface.tsx`
з токенами у `src/theme/tokens.ts`:
```ts
glass: 'rgba(240, 238, 242, 0.62)',
glassBorder: 'rgba(255, 255, 255, 0.95)',
glassEdge: 'rgba(33, 28, 36, 0.07)',
glassLens: 'rgba(255, 255, 255, 0.96)',
```

### 4.2. Чому Glass Tab Bar зливається з чорним фоном:
1. **Занадто низька непрозорість білого шару (62%):** Значення `rgba(240, 238, 242, 0.62)` містить 38% прозорості. Коли під склом знаходиться чорний або темно-сірий контент (чи темний фон сторінки `#120E15`), скло вбирає темряву й візуально стає темно-сірою каламутною смугою, яка повністю втрачає відчуття "скляного білого об'єкта".
2. **Зникнення тіней на темному фоні:** Тіні `shadows.glass` визначені з `shadowColor: '#211C24'` (чорний колір із непрозорістю 8%). На чорному фоні чорна тінь має нульовий контраст і не дає жодного відриву плаваючої пігулки від тла.
3. **Колір неактивних пунктів:**
   ```ts
   const color = isFocused ? colors.brand : colors.textPrimary;
   ```
   У світлій темі `colors.textPrimary` — `#211C24` (чорний). Якщо таб бар темнішає на темному фоні, чорний або темно-сірий текст та іконки стають нечитабельними.
4. **Лінза активного пункту (`styles.highlight`):** Лінза має `backgroundColor: colors.glassLens` (`rgba(255, 255, 255, 0.96)`). Якщо сама пігулка темна, біла лінза виглядає як різкий контрастний шматок пластику замість м'якого відблиску скла.

### 4.3. Технічні рекомендації для виконання вимоги R1:
1. **Підвищення білої насиченості та непрозорості:**
   - Для світлої теми: залишити чистий легкий ефект (наприклад, `rgba(255, 255, 255, 0.72)`).
   - Для темної теми / темного фону: збільшити частку білого кольору до **`rgba(255, 255, 255, 0.88)` або `rgba(248, 246, 250, 0.90)`**.
   - Або ввести окремий токен `colors.glassDark` / тематичний токен скла з вираженою білою матовістю (Frosted White Glass), який залишається яскравим білим скляним островом над чорним фоном.
2. **Підсилення контуру та відблиску (Borders & Highlights):**
   - Збільшити яскравість рамки: `borderWidth: 1.5`, `borderColor: 'rgba(255, 255, 255, 0.95)'`.
   - На Web додати `boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 1)'`.
3. **Контрастність іконок і підписів:**
   - На білому скляному фоні неактивні пункти повинні мати чіткий темний відтінок (`#211C24` або `#3A323E`), а активний пункт — фірмовий ягідний колір (`colors.brand: #B6245A`), що забезпечує ідеальний контрастний показник WCAG > 4.5:1.

---

## 5. Зведений реєстр hardcoded кольорів у кодовій базі

Наступні файли містять "сирі" hex / rgba літерали, які необхідно викорінити при впровадженні системи тем:

| Файл | Рядки | Hardcoded значення | Призначення | Рекомендована заміна |
|---|---|---|---|---|
| `src/app/+html.tsx` | 17, 40, 44 | `#FAF8F7`, `#EFEAED`, `#B6245A` | Theme-color метатег, web body bg, focus outline | Медіа-запит `prefers-color-scheme`, токени |
| `src/app/(onboarding)/welcome.tsx` | 39 | `'rgba(250,248,247,0)'` | Градієнт затухання фотоколажу | Прозорий градієнт активного `theme.colors.background` |
| `src/components/energy/energy-plus-card.tsx` | 38, 46, 65, 78, 82, 88, 99, 106, 120, 128 | `#5A122D`, `#FDF2F6`, `#F7DDE6`, `#9A1D4B`, `rgba(182, 36, 90, 0.1)` | Усі кольори картки підписки | Заміна на семантичні токени преміум/підписки |
| `src/components/energy/insufficient-energy-sheet.tsx` | 209, 213, 228, 234, 240, 269, 283, 300, 304, 305, 318, 325, 342 | `#FDF2F5`, `#F3D2DF`, `#8A1538`, `#982755`, `#EBE5E8`, `#6C626C` | Фони, рамки, бейджі, кнопки шторки покупки | Заміна на семантичні токени `surface`, `border`, `brand` |
| `src/components/energy/energy-packages-list.tsx` | 59, 69, 80, 83, 89 | `rgba(33, 28, 36, 0.06)`, `#FDF2F6`, `#5A122D`, `#F7DDE6`, `#9A1D4B` | Рамка списку, фон рекомендованого, бейдж | Токени теми `surfaceMuted`, `brandSubtle`, `brand` |
| `src/components/energy/balance-card.tsx` | 23, 55, 89, 95 | `#9A1D4B`, `rgba(33, 28, 36, 0.06)`, `#EAE5E8` | Іконка блискавки, рамка картки, фон прогрес-бару | Токени `brandPressed`, `border`, `surfaceMuted` |
| `src/components/energy/waiting-characters.tsx` | 79 | `'rgba(33, 28, 36, 0.06)'` | Рамка картки списку очікування | Токен `border` |
| `src/components/ui/chip.tsx` | 34 | `'rgba(255, 255, 255, 0.22)'` | Фон чіпа над медіа | Допустимо (scrim), але краще токен `scrimChip` |
| `src/app/(app)/character/[id].tsx` | 66 | `['rgba(0,0,0,0.35)', 'rgba(0,0,0,0)']` | Затінення фото зверху | Допустимо (media scrim) |
| `src/components/discover/character-grid-card.tsx` | 14 | `['rgba(0,0,0,0)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.78)']` | Затінення фото знизу | Допустимо (media scrim) |

---

## 6. Поетапний чекліст адаптації (Actionable Itemized Checklist)

### Етап 1: Архітектура темної та світлої тем (Theming Foundation)
- [ ] **Токени тем у `src/theme/tokens.ts`:**
  - [ ] Розділити кольори на `lightColors` та `darkColors`.
  - [ ] Визначити семантичні кольори для Dark Mode:
    - `background`: `#120E15` (глибокий теплий темний фон)
    - `surface`: `#1E1822` (темна поверхня для карток і шторок)
    - `surfaceMuted`: `#2B2330` (приглушений фон для полів, чіпів)
    - `textPrimary`: `#FAF8F7` (світлий текст)
    - `textSecondary`: `#A59BA6` (вторинний текст)
    - `border`: `#342A3A` (темний розділювач)
    - `brandSubtle`: `rgba(182, 36, 90, 0.22)` (темно-ягідний фон для вибраних опцій)
    - `glass`: збільшена частка білого для контрасту над чорним фоном (R1)
- [ ] **Провайдер або хук теми (`useTheme`):**
  - [ ] Створити легковажний реактивний хук або Zustand store для теми (`mode: 'light' | 'dark' | 'system'`).
  - [ ] Підключити слухач системної теми `Appearance.addChangeListener` або `useColorScheme`.
- [ ] **Оновлення кореневих навігаторів:**
  - [ ] `src/app/_layout.tsx`: динамічний `StatusBar` (`dark` / `light`), динамічний `contentStyle`.
  - [ ] `src/app/(app)/_layout.tsx`: динамічний `contentStyle`.
  - [ ] `src/app/(onboarding)/_layout.tsx`: динамічний `contentStyle`.
  - [ ] `src/app/(app)/(tabs)/_layout.tsx`: динамічний `sceneStyle`.

### Етап 2: Glass Tab Bar (R1)
- [ ] Збільшити насиченість білого кольору та непрозорість `colors.glass` у `glass-surface.tsx` / `tokens.ts`.
- [ ] Додати виразну білу окантовку (`glassBorder`) та світлий верхній відблиск.
- [ ] Забезпечити чіткий контраст неактивних та активних табів на будь-якому фоні.

### Етап 3: Базові UI-компоненти (`src/components/ui/`)
- [ ] `AppText`: підключити читання кольору з теми.
- [ ] `Button`: динамічні стилі для `secondary` та `danger` кнопок у темній темі.
- [ ] `SelectableChip`: **виправити пастку білого тексту на білому фоні** (змінити зв'язку `selected` + `textPrimary`).
- [ ] `TextField`: динамічні кольори інпуту, бордеру та тексту.
- [ ] `BottomSheet`: темне полотно шторки та темний handle.
- [ ] `Checkbox`: темний фон неактивного стану.
- [ ] `OptionGroup`: темні фони для неопрацьованих та обраних кнопок.
- [ ] `IconButton`: динамічний дефолтний колір іконки.
- [ ] `Avatar`: адаптивний `ringColor`.

### Етап 4: Екрани онбордингу та Legal
- [ ] `src/app/(onboarding)/welcome.tsx`: динамічний градієнт `collageFade`.
- [ ] `src/app/(onboarding)/age.tsx`: темна плашка `privacyNote`.
- [ ] `src/app/(onboarding)/verify.tsx`: темна плашка `demoNote`.
- [ ] `src/app/(onboarding)/disclosure.tsx`: темна картка фактів та розділювач.
- [ ] `src/app/legal/[doc].tsx`: темний фон документа.

### Етап 5: Екрани та компоненти стрічки і чату
- [ ] `src/app/(app)/(tabs)/index.tsx`: темний фон та порожній стан.
- [ ] `src/app/(app)/(tabs)/chats.tsx`: темні фони рядків, коректні натискання, кільця аватарів.
- [ ] `src/app/(app)/(tabs)/profile.tsx`: темні картки груп налаштувань.
- [ ] `src/app/(app)/character/[id].tsx`: темна підкладка профілю та плаваюча CTA.
- [ ] `src/app/(app)/chat/[id].tsx`: темний хедер, темні кнопки підказок `suggestions`.
- [ ] `src/components/chat/composer.tsx`: білий колір введеного тексту в інпуті, контрастні кнопки.
- [ ] `src/components/chat/message-bubble.tsx`: темна бульбашка вхідного повідомлення з бордером.
- [ ] `src/components/chat/typing-indicator.tsx`: темна бульбашка друку.

### Етап 6: Екрани та компоненти енергії (Energy Store)
- [ ] `src/components/energy/balance-card.tsx`: темний фон картки, заміна hardcoded `#EAE5E8`.
- [ ] `src/components/energy/energy-chip.tsx`: збалансований темний золотий чіп для темної теми.
- [ ] `src/components/energy/energy-plus-card.tsx`: усунення hardcoded `#FDF2F6` та `#5A122D`, темний стиль підписки.
- [ ] `src/components/energy/energy-packages-list.tsx`: усунення hardcoded `#FDF2F6` та `#F7DDE6`.
- [ ] `src/components/energy/insufficient-energy-sheet.tsx`: повний перехід на токени теми.
- [ ] `src/components/energy/waiting-characters.tsx`: темна картка та кільця аватарів.

---

Звіт підготовлено в повному обсязі для передачі архітектору та команді імплементації.
