# Звіт дослідження: Навігація та Glass Tab Bar (Explorer Survey 1)

**Дата:** 2026-10-08  
**Дослідник:** Explorer Survey 1 (Navigation & Tab Bar Specialist)  
**Проєкт:** Flirter (Expo SDK 57 / React Native 0.86 / Expo Router)  
**Робоча директорія:** `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front`  

---

## 1. Короткий підсумок (Executive Summary)

У ході поглибленого архітектурного дослідження кодової бази Flirter було проаналізовано поточну реалізацію навігаційної системи Expo Router, плаваючого нижнього бару **Glass Tab Bar** та компонента скляної поверхні **GlassSurface**.

### Головні висновки:
1. **Причина злиття Tab Bar з темним/чорним фоном:**
   - Токен `colors.glass` у `src/theme/tokens.ts` (рядок 32) має значення `'rgba(240, 238, 242, 0.62)'`. Непрозорість лише **62%** і сіруватий базовий відтінок призводять до того, що на темному фоні (темні картки персонажів у сітці Discover, темний градієнт скрайму `rgba(0,0,0,0.78)` або чорний фон темної теми) крізь скло пробивається 38% чорного кольору, перетворюючи капсулу на тьмяну брудно-сіру пляму.
   - На iOS компонент `GlassSurface` (`src/components/ui/glass-surface.tsx`) використовує нативний `expo-glass-effect` (`GlassView`) з `glassEffectStyle="regular"`. За відсутності явних пропсів `tintColor` або `colorScheme="light"`, в системному темному режимі iOS автоматично застосовує темний системний блюр (`UIBlurEffectStyleSystemMaterialDark`), через що таб-бар стає майже повністю чорним і зливається з темним екраном.
   - На Android `backdrop-filter` взагалі не підтримується стандартним React Native `View`, тому `GlassSurface` відображається як звичайний прямокутник з прозорістю 0.62, стаючи темно-сірим без жодного ефекту розмиття.
   - Тінь `shadows.glass` має чорний колір `shadowColor: '#211C24'`, який на чорному фоні повністю зникає, позбавляючи капсулу глибини.
   - У `GlassTabBar` колір неактивних пунктів захардкоджений як `colors.textPrimary` (`#211C24` — рядок 58). На темному склі майже чорний колір неактивних іконок і тексту втрачає контраст і стає нечитабельним.
2. **Стан системи тем:**
   - У проєкті наразі **повністю відсутня динамічна система тем**: кольори експортуються як один статичний об'єкт `colors` у `src/theme/tokens.ts`.
   - Всі 50+ компонентів імпортують `colors` напряму.
   - Статус-бар у `src/app/_layout.tsx` (рядок 23) захардкоджений як `StatusBar style="dark"`.
   - У налаштуваннях профілю (`src/app/(app)/(tabs)/profile.tsx`) відсутній перемикач теми.

---

## 2. Структура навігації додатку

Навігація побудована на базі **Expo Router (v57)** із файловою маршрутизацією у `src/app/`:

### 2.1. Кореневий рівень (`src/app/_layout.tsx`)
- **Компонент:** `RootLayout` (рядки 16–42).
- **Стек:** `Stack` з двома взаємовиключними захищеними гілками:
  ```tsx
  <Stack.Protected guard={!isOnboarded}>
    <Stack.Screen name="(onboarding)" />
  </Stack.Protected>
  <Stack.Protected guard={isOnboarded}>
    <Stack.Screen name="(app)" />
  </Stack.Protected>
  ```
- **Хардкод стилів:**
  - Рядок 23: `<StatusBar style="dark" />` — потребує динамічного стилю (`light` для темної теми).
  - Рядок 26: `Stack screenOptions={{ contentStyle: { backgroundColor: colors.background } }}`.
  - Рядок 54: `styles.frame: { backgroundColor: colors.background }`.

### 2.2. Продуктовий стек (`src/app/(app)/_layout.tsx`)
- **Компонент:** `AppLayout` (рядки 6–19).
- **Маршрути:**
  - `(tabs)` — основні екрани з нижнім баром.
  - `character/[id]` — повноекранний профіль персонажа (анімація `slide_from_bottom`).
  - `chat/[id]` — екран діалогу (Tab Bar прихований для звільнення місця під клавіатуру та плаваючий `Composer`).
  - `energy` — екран балансу енергії та підписок (відкривається через EnergyChip у хедері).
- **Хардкод стилів:**
  - Рядок 11: `contentStyle: { backgroundColor: colors.background }`.

### 2.3. Вкладки нижньої навігації (`src/app/(app)/(tabs)/_layout.tsx`)
- **Компонент:** `TabsLayout` (рядки 20–43).
- **Провайдер таб-бару:** підключається через `tabBar={(props) => <GlassTabBar {...props} />}` (рядок 26).
- **Екрани вкладок:**
  1. `index` (`src/app/(app)/(tabs)/index.tsx`) — **"Знайомства"** (сітка карток персонажів, фільтри).
  2. `chats` (`src/app/(app)/(tabs)/chats.tsx`) — **"Чати"** (список діалогів та вхідних запитів, бейдж непрочитаних).
  3. `profile` (`src/app/(app)/(tabs)/profile.tsx`) — **"Профіль"** (налаштування, баланс, правова інформація).
- **Хардкод стилів:**
  - Рядок 29: `sceneStyle: { backgroundColor: colors.background }`.

---

## 3. Детальний аналіз реалізації Glass Tab Bar

### 3.1. Геометрія та позиціонування
Файл: `src/components/layout/glass-tab-bar.tsx`
- **Плаваючий оверлей:**
  - Позиціонується абсолютно: `position: 'absolute'`, `left: spacing.lg` (16px), `right: spacing.lg` (16px), `bottom: bottomOffset` (рядки 100–105).
  - Відступ знизу обчислюється хуком `useBottomOffset()`: `Math.max(insets.bottom, sizes.floatingTabBarGap)` (12px або `insets.bottom`).
- **Скляна капсула (`styles.pill`):**
  - Висота: `sizes.floatingTabBarHeight` = **64px** (рядок 107).
  - Радіус: `radius.pill` = **999px** (рядок 108).
  - Внутрішній відступ: `padding: PILL_PADDING` (6px).
- **Резервування місця під контентом:**
  - Хук `useFloatingTabBarInset()` (рядки 27–29) експортує розрахунок: `floatingTabBarHeight (64) + bottomOffset + spacing.md (12)`.
  - Використовується у всіх трьох екранах вкладок (`index.tsx`, `chats.tsx`, `profile.tsx`) як `paddingBottom` списків, щоб нижній контент не перекривався плаваючим таб-баром.

### 3.2. Компонент скляної підкладки `GlassSurface`
Файл: `src/components/ui/glass-surface.tsx` (рядки 1–55)

```tsx
// Рядки 8, 28-42
const HAS_NATIVE_LIQUID_GLASS = Platform.OS === 'ios' && isLiquidGlassAvailable();

export function GlassSurface({ children, style, testID }: GlassSurfaceProps) {
  if (HAS_NATIVE_LIQUID_GLASS) {
    return (
      <GlassView glassEffectStyle="regular" isInteractive style={[styles.base, style]} testID={testID}>
        {children}
      </GlassView>
    );
  }

  return (
    <View style={[styles.base, styles.fallback, WEB_BACKDROP, style]} testID={testID}>
      {children}
    </View>
  );
}
```

#### Проблеми `GlassSurface`:
1. **iOS (`HAS_NATIVE_LIQUID_GLASS`):**
   - Використовується `GlassView` з бібліотеки `expo-glass-effect` (~57.0.4).
   - Згідно з `GlassView.types.d.ts`, компонент підтримує:
     - `tintColor?: ColorValue`
     - `colorScheme?: 'auto' | 'light' | 'dark'`
     - `glassEffectStyle?: 'clear' | 'regular' | 'none'`
   - Зараз **жоден з цих параметрів не передається**. При системному темному режимі iOS перемикає матеріал на темний, що перетворює бар на чорну пляму.
2. **Web / Android fallback:**
   - Стилі з `styles.fallback`:
     ```ts
     fallback: {
       backgroundColor: colors.glass,        // 'rgba(240, 238, 242, 0.62)'
       borderWidth: 1,
       borderColor: colors.glassBorder,  // 'rgba(255, 255, 255, 0.95)'
       ...shadows.glass,
     }
     ```
   - На Web діє `WEB_BACKDROP_FILTER = 'blur(20px) saturate(180%) brightness(1.08)'`. Однак, якщо під склом чорні пікселі (значення 0), функція яскравості `0 * 1.08 = 0`. Лише сам колір фону скла дає видимий тон. При альфа-каналі 0.62 та сірому тоні капсула виглядає темно-сірою.
   - На Android React Native не підтримує `backdrop-filter`. Скло рендериться як плоский шар кольору з прозорістю 62%, тобто виглядає тьмяним і повністю зливається з чорним тлом.

### 3.3. Активний індикатор («Лінза»)
Файл: `src/components/layout/glass-tab-bar.tsx` (рядки 53, 115–123)
- Рендериться як `Animated.View style={[styles.highlight, { width: itemWidth }, highlightStyle]}`.
- Плавний перехід між вкладками за допомогою Reanimated:
  `translateX.set(withSpring(state.index * itemWidth, HIGHLIGHT_SPRING))`.
- Стилі:
  - `backgroundColor: colors.glassLens` (`rgba(255, 255, 255, 0.96)`).
  - Тінь `shadows.lens` (чорна тінь `shadowColor: '#211C24'`).
  - Радіус: `radius.pill` (999px).

### 3.4. Елементи вкладок (Іконки, Лейбли, Бейджі)
Файл: `src/components/layout/glass-tab-bar.tsx` (рядки 55–92)
- **Колір іконки та тексту (Рядок 58):**
  ```ts
  const isFocused = state.index === index;
  const color = isFocused ? colors.brand : colors.textPrimary;
  ```
  - **Активний пункт:** `colors.brand` (`#B6245A`) — яскравий малиновий колір, чудово виглядає на білій лінзі.
  - **Неактивний пункт:** `colors.textPrimary` (`#211C24`) — дуже темний (майже чорний).
  - **Критична проблема:** Якщо таб-бар на темному фоні стає темним склом, чорні іконки повністю зливаються. Якщо ж таб-бар стає білим матовим склом (white glass), а в додатку увімкнена темна тема, де `textPrimary` перетворюється на `#FFFFFF`, то білі іконки на білому склі знову зникнуть! Тому колір неактивних пунктів Tab Bar повинен бути відв'язаний від глобального `textPrimary` і мати спеціальний токен (наприклад, `colors.tabBarInactive`).
- **Бейдж непрочитаних повідомлень (Рядки 80–85, 135–152):**
  - `backgroundColor: colors.brand` (`#B6245A`).
  - `borderColor: colors.surface` (`#FFFFFF`).
  - Текст: `color="textOnBrand"` (`#FFFFFF`).

---

## 4. Чому Glass Tab Bar зливається з чорним фоном (Матриця факторів)

| Елемент | Поточне значення | Поведінка на чорному фоні | Необхідна модифікація |
| :--- | :--- | :--- | :--- |
| **Фон скла (`colors.glass`)** | `'rgba(240, 238, 242, 0.62)'` | 38% чорного фону пробивається крізь скло. Капсула стає темно-сірою, брудною і зливається з контентом під нею. | Збільшити білизну та непрозорість до `rgba(255, 255, 255, 0.85)` або `rgba(255, 255, 255, 0.88)` (frosted white glass). |
| **iOS нативний ефект (`GlassView`)** | `glassEffectStyle="regular"`, без `tintColor` і без `colorScheme` | У темній темі iOS автоматично робить скло темним/чорним (`dark material blur`). | Вказати `tintColor="rgba(255, 255, 255, 0.85)"` та/або `colorScheme="light"` для примусового збереження світлого скла. |
| **Android підтримка** | Fallback без `backdrop-filter` | Звичайний напівпрозорий прямокутник без розмиття; на чорному фоні стає темно-сірим. | Підвищена непрозорість білого фону (0.85–0.90) створює відчутний ефект матового скла навіть без нативного blur. |
| **Бордер скла (`colors.glassBorder`)** | `'rgba(255, 255, 255, 0.95)'`, `borderWidth: 1` | Білий бордер 1px є єдиною лінією, що відділяє капсулу, але без зовнішнього свічення втрачає глибину. | Зберегти або збільшити до 1.5px, додати тонкий контур або світлий ореол. |
| **Тіні (`shadows.glass`, `shadows.lens`)** | `shadowColor: '#211C24'`, web `boxShadow` з темним контуром | Чорна тінь на чорному або темному тлі фізично невидима (контраст 0:1). | Додати світлий зовнішній контур або м'яке темне затінення з ореолом, адаптивне під тему. |
| **Колір неактивних іконок/лейблів** | `colors.textPrimary` (`#211C24`) | На затемненому склі темні іконки не читаються. Якщо в темній темі `textPrimary` стане білим, вони зіллються з білим склом. | Використовувати виділений токен `colors.tabBarInactive` (наприклад, контрастний графітовий `#4A424D` / `rgba(33, 28, 36, 0.7)` на білому склі). |

---

## 5. Точки інтеграції з системою перемикання тем

Для повного впровадження світлої та темної тем згідно з вимогами `ORIGINAL_REQUEST.md` (R1 і R2), система повинна взаємодіяти з Tab Bar та навігацією наступним чином:

1. **Динамічний статус-бар:**
   - Файл: `src/app/_layout.tsx`, рядок 23.
   - Замінити статичний `<StatusBar style="dark" />` на динамічний вибір на основі активної теми: `<StatusBar style={isDark ? 'light' : 'dark'} />`.
2. **Фони навігаційних контейнерів:**
   - `src/app/_layout.tsx`: `styles.frame`, `contentStyle`.
   - `src/app/(app)/_layout.tsx`: `contentStyle`.
   - `src/app/(app)/(tabs)/_layout.tsx`: `sceneStyle`.
   - Усі повинні використовувати динамічний `theme.colors.background` замість статичного імпорту.
3. **Хедери та відступи:**
   - `src/components/layout/app-header.tsx`: фон хедера `backgroundColor: colors.background` та колір заголовка.
4. **Налаштування в профілі (`src/app/(app)/(tabs)/profile.tsx`):**
   - Додати новий блок у розділ «Застосунок»: перемикач теми («Світла», «Темна», «Системна») за допомогою компонента вибору або `OptionGroup` / `SelectableChip`.
5. **Збереження стану теми:**
   - Зберігати вибір у Zustand сторі з персистенцією через `persistStorage` у `STORAGE_KEYS.theme` (наприклад, `'flirter.theme.v1'`).

---

## 6. Запропоноване технічне рішення для реалізації (Proposed Solution)

### 6.1. Оновлення дизайн-токенів (`src/theme/tokens.ts`)
Розділити або розширити токени для підтримки палітр `lightColors` та `darkColors`, або запровадити єдину структуру теми:

```ts
// Приклад токенів для Glass Tab Bar:
export const lightColors = {
  // ... існуючі світлі кольори
  glass: 'rgba(255, 255, 255, 0.82)',       // Підвищена біла непрозорість для світлої теми
  glassBorder: 'rgba(255, 255, 255, 0.95)',
  glassLens: 'rgba(255, 255, 255, 0.98)',
  tabBarInactive: '#6C626C',
  tabBarActive: '#B6245A',
};

export const darkColors = {
  background: '#0F0E11',
  surface: '#1A181D',
  surfaceMuted: '#242129',
  textPrimary: '#F5F2F5',
  textSecondary: '#A399A5',
  border: '#2E2933',
  // Glass Tab Bar у стилі контрастного білого скла на чорному фоні:
  glass: 'rgba(255, 255, 255, 0.88)',       // Висока біла непрозорість (white frosted glass)
  glassBorder: 'rgba(255, 255, 255, 0.98)',
  glassLens: '#FFFFFF',
  tabBarInactive: '#3D3540',                 // Контрастний темний відтінок на білому склі
  tabBarActive: '#B6245A',                   // Брендовий малиновий колір
};
```

### 6.2. Модифікація `GlassSurface` (`src/components/ui/glass-surface.tsx`)
Забезпечити підтримку пропсів для контролю нативного скла та передачі підвищеного білого відтінку:

```tsx
interface GlassSurfaceProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  tintColor?: ColorValue;
  colorScheme?: 'auto' | 'light' | 'dark';
}

export function GlassSurface({
  children,
  style,
  testID,
  tintColor = 'rgba(255, 255, 255, 0.85)',
  colorScheme = 'light', // Завжди світле скло для гарантованого контрасту на темному тлі
}: GlassSurfaceProps) {
  if (HAS_NATIVE_LIQUID_GLASS) {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme={colorScheme}
        tintColor={tintColor}
        isInteractive
        style={[styles.base, style]}
        testID={testID}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View style={[styles.base, styles.fallback, WEB_BACKDROP, style]} testID={testID}>
      {children}
    </View>
  );
}
```

### 6.3. Модифікація `GlassTabBar` (`src/components/layout/glass-tab-bar.tsx`)
1. У рядку 58 замінити:
   ```tsx
   // Було:
   const color = isFocused ? colors.brand : colors.textPrimary;
   
   // Стало:
   const color = isFocused ? colors.brand : (colors.tabBarInactive ?? '#4A424D');
   ```
2. Передати в `<GlassSurface style={styles.pill} tintColor="rgba(255, 255, 255, 0.88)" colorScheme="light">`.
3. Забезпечити відображення білої лінзи `highlight` з високою непрозорістю та м'яким внутрішнім світлом.

---

## 7. Файловий індекс досліджених компонентів

| Файл | Призначення | Ключові рядки |
| :--- | :--- | :--- |
| `src/app/_layout.tsx` | Кореневий Layout, StatusBar, GestureHandler, Protected routes | L23 (StatusBar), L26 (contentStyle), L54 (frame background) |
| `src/app/(app)/_layout.tsx` | Layout основного стеку продукту | L11 (contentStyle) |
| `src/app/(app)/(tabs)/_layout.tsx` | Layout вкладок з кастомним GlassTabBar | L26 (tabBar prop), L29 (sceneStyle) |
| `src/components/layout/glass-tab-bar.tsx` | Реалізація плаваючого Liquid Glass Tab Bar | L16-29 (insets & offsets), L51-95 (pill & tabs), L58 (item colors), L121 (lens) |
| `src/components/ui/glass-surface.tsx` | Скляна підкладка (expo-glass-effect + web/android fallback) | L8 (isLiquidGlassAvailable), L28-42 (GlassView vs View fallback), L48-53 (fallback styles) |
| `src/theme/tokens.ts` | Дизайн-токени (кольори, радіуси, тіні, розміри) | L8-41 (colors.glass, glassBorder, glassLens), L119-142 (shadows.glass, lens) |
| `src/app/(app)/(tabs)/index.tsx` | Вкладка Знайомств (темний контент карток під таб-баром) | L46, L92 (tabBarInset), L131 (safeArea background) |
| `src/components/discover/character-grid-card.tsx` | Картка персонажа (нижній скрайм прокручується під таб-баром) | L14-15 (SCRIM_COLORS rgba(0,0,0,0.78)), L50 (LinearGradient) |
| `src/app/(app)/(tabs)/profile.tsx` | Вкладка Профілю (місце для налаштувань теми) | L74, L88 (tabBarInset), L113-134 (налаштування) |
| `src/components/chat/composer.tsx` | Плаваючий Composer чату (також використовує GlassSurface) | L14, L57, L101 (GlassSurface usages) |
