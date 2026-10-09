# Звіт дослідження: Архітектура тем та стилізації (Survey Report 2)

**Дата:** 2026-10-08  
**Автор:** Explorer Survey 2 (Theming & Styling Architecture Specialist)  
**Робоча директорія:** `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front`  
**Ціль:** Дослідження бібліотек стилізації, дизайн-токенів, кольорової моделі та проектування повномасштабної архітектури темної та світлої тем з вирішенням контрастності Glass Tab Bar.

---

## 1. Резюме (Executive Summary)

1. **Поточний стек стилізації:** Додаток побудований на **Expo SDK ~57.0.25**, **React 19.2.3**, **React Native 0.86.3**, **React Native Reanimated 4.5.1**, **expo-glass-effect ~57.0.4** та **Zustand ^5.0.15**. У проекті **не використовуються** сторонні бібліотеки на кшталт Tailwind/NativeWind, styled-components чи Tamagui. Усі стилі описані виключно за допомогою стандартного `StyleSheet.create` з імпортом токенів із `@/theme/tokens`.
2. **Стан підтримки тем:** Наразі додаток **жорстко заблокований у світлій темі**:
   - В `app.json` вказано `"userInterfaceStyle": "light"`.
   - У `src/theme/tokens.ts` є єдиний статичний об'єкт `colors` лише зі світлими кольорами.
   - Жоден компонент чи хук (`useColorScheme`, `Appearance`) для темної теми не викликається.
3. **Проблема Glass Tab Bar (Вимога R1):**
   - У `src/components/ui/glass-surface.tsx` на iOS викликається `GlassView` з `expo-glass-effect` без фіксації світлої колірної схеми чи білого відтінку. При темному оточенні нативний iOS-матеріал стає темним напівпрозорим шаром, який зливається з чорним фоном.
   - У фолбек-режимі (Android, Web) використовується `colors.glass = 'rgba(240, 238, 242, 0.62)'`. На чорному фоні 62% непрозорості дає бляклий темно-сірий колір без виразності.
   - **Рішення:** Збільшити непрозорість та насиченість білого до `0.85–0.88`, передавати `colorScheme="light"` / `tintColor="rgba(255, 255, 255, 0.40)"` у `GlassView`, зафіксувати контрастні темні лейбли/іконки для неактивних вкладок на білій скляній пігулці та посилити білий контур `glassBorder`.
4. **Виявлений хардкод кольорів та помилки компіляції:**
   - Знайдено хардкодні значення кольорів в `energy-packages-list.tsx`, `insufficient-energy-sheet.tsx`, `balance-card.tsx`, `energy-plus-card.tsx`, `welcome.tsx` та `+html.tsx`.
   - Під час аудиту типування (`npx tsc --noEmit`) виявлено 2 існуючі помилки:
     - `energy-plus-card.tsx:54` — проп `textStyle` відсутній у `ButtonProps`.
     - `insufficient-energy-sheet.tsx:23` — звернення до неіснуючого поля `ENERGY_CONFIG.maxFree`.

---

## 2. Аналіз поточної системи стилізації та залежностей

### 2.1. Аналіз `package.json` та оточення
- **Expo SDK:** `~57.0.25`
- **React:** `19.2.3`
- **React Native:** `0.86.3`
- **Expo Router:** `~57.0.23`
- **Управління станом:** `zustand: ^5.0.15`
- **Графіка та ефекти:**
  - `expo-glass-effect: ~57.0.4` (нативний Liquid Glass для iOS)
  - `expo-linear-gradient: ~57.0.2`
  - `expo-image: ~57.0.5`
  - `expo-status-bar: ~57.0.1`
- **Бібліотеки стилізації:** відсутній NativeWind/Tailwind. Введення NativeWind на даному етапі було б надмірним і ризикованим кроком (потребує переписування десятків файлів, плагінів Babel/Metro). Оптимальний вибір — **нативна типізована система Theme Context + Zustand Store + Hooks**, яка на 100% інтегрується з чинною кодовою базою.

### 2.2. Конфігурація `app.json`
```json
{
  "expo": {
    "userInterfaceStyle": "light", // ⚠️ Блокує системну темну тему на native! Необхідно змінити на "automatic"
    "backgroundColor": "#FAF8F7",
    "web": {
      "themeColor": "#FAF8F7",
      "backgroundColor": "#FAF8F7"
    }
  }
}
```

---

## 3. Детальний аналіз Glass Tab Bar (Вимога R1)

### 3.1. Чому Glass Tab Bar зливається з чорним фоном
1. **Файл:** `src/components/ui/glass-surface.tsx`:
   ```tsx
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

   const styles = StyleSheet.create({
     base: { overflow: 'hidden' },
     fallback: {
       backgroundColor: colors.glass, // 'rgba(240, 238, 242, 0.62)'
       borderWidth: 1,
       borderColor: colors.glassBorder, // 'rgba(255, 255, 255, 0.95)'
       ...shadows.glass,
     },
   });
   ```
2. **Файл:** `src/components/layout/glass-tab-bar.tsx`:
   - Пігулка має висоту `sizes.floatingTabBarHeight = 64`, радіус `radius.pill = 999`.
   - Активна вкладка підсвічується `styles.highlight` з `backgroundColor: colors.glassLens` (`rgba(255, 255, 255, 0.96)`).
   - Колір тексту та іконки визначається як:
     ```tsx
     const color = isFocused ? colors.brand : colors.textPrimary;
     ```

### 3.2. Механізм втрати контрасту:
- На iOS `expo-glass-effect` створює нативний `UIVisualEffectView`. За замовчуванням (без `colorScheme="light"`), коли система чи батьківський контейнер темні, нативний ефект автоматично затемнює розмиття. На абсолютно чорному фоні це дає майже прозору темну пляму.
- У фолбеку (Android, Web) 62% біло-сірого фону поверх `#000000` перетворюються на `rgb(149, 147, 150)` (сірий відтінок з низьким контрастом відносно чорного).
- Якщо екран перебуває в темній темі, але пігулка повинна бути виразно білою («рідке скло» з високим відтінком білого), неактивні елементи таб-бару мають залишатися темними/контрастними, щоб не зливатися з білим склом!

### 3.3. Необхідні модифікації для вирішення R1:
1. **Токени скла (збільшення білого відтінку та непрозорості):**
   ```ts
   // У світлій темі:
   glass: 'rgba(255, 255, 255, 0.82)',
   glassBorder: 'rgba(255, 255, 255, 0.95)',
   glassLens: 'rgba(255, 255, 255, 0.96)',
   // У темній темі (на чорному/темному фоні — виразне світле сяюче скло):
   glass: 'rgba(255, 255, 255, 0.88)',
   glassBorder: '#FFFFFF',
   glassLens: '#FFFFFF',
   ```
2. **Модифікація `GlassSurface`:**
   - Для iOS передавати `colorScheme="light"` та `tintColor="rgba(255, 255, 255, 0.35)"` у `GlassView`.
   - Для Web/Android підвищити яскравість і насиченість у `backdrop-filter`:
     `blur(24px) saturate(200%) brightness(1.15)`.
3. **Модифікація `GlassTabBar`:**
   - Колір неактивних іконок та підписів на білій скляній пігулці: закріпити `tabBarInactive: '#403644'` (темний графіт з контрастом > 8:1 до білого скла), а активний колір — `colors.brand` (`#B6245A` або `#D43B74`).

---

## 4. Аудит колірних токенів та виявленого хардкоду

### 4.1. Поточні токени (`src/theme/tokens.ts`)
| Токен | Поточне значення (Light) | Призначення |
|---|---|---|
| `background` | `#FAF8F7` | Загальний фон екранів |
| `surface` | `#FFFFFF` | Картки, поля вводу, модальні вікна |
| `surfaceMuted` | `#F3EEF1` | Допоміжні контейнери, чіпи, прес-стани |
| `textPrimary` | `#211C24` | Основний текст |
| `textSecondary` | `#6C626C` | Підписи, дати, другорядний текст |
| `textOnBrand` | `#FFFFFF` | Текст на кнопках та бейджах |
| `textOnMedia` | `#FFFFFF` | Текст поверх фото персонажів |
| `brand` | `#B6245A` | Головний акцентний ягідний колір |
| `brandPressed` | `#9A1D4B` | Стан натискання кнопок |
| `brandSubtle` | `#F9E7EE` | М'яка ягідна підкладка для обраних чіпів |
| `energyText` | `#765000` | Текст чіпа енергії |
| `energySurface` | `#FFF1D1` | Фон чіпа енергії |
| `border` | `#E7E0E5` | Розділювачі, рамки полів |
| `danger` | `#B3261E` | Помилки, деструктивні дії |
| `success` | `#1E7A46` | Успішні операції |
| `pass` | `#6C626C` | Нейтральний статус |
| `premiumDeep` | `#3B1232` | Фон VIP-картки та Hero енергії |
| `premiumGold` | `#F6C445` | Золоті акценти VIP та енергії |
| `textOnPremiumMuted`| `rgba(255, 255, 255, 0.72)`| Текст на темному градієнті |
| `premiumTrack` | `rgba(255, 255, 255, 0.18)`| Трек прогресу на темному фоні |
| `premiumInk` | `#1C0A18` | Глибокий градієнт VIP |
| `glass` | `rgba(240, 238, 242, 0.62)`| Скло таб-бару та композера |
| `glassBorder` | `rgba(255, 255, 255, 0.95)`| Рамка скла |
| `glassEdge` | `rgba(33, 28, 36, 0.07)`| Зовнішній контур скла |
| `glassLens` | `rgba(255, 255, 255, 0.96)`| Лінза активної вкладки |
| `overlay` | `rgba(33, 28, 36, 0.55)`| Затемнення під Bottom Sheet |
| `mediaScrim` | `rgba(0, 0, 0, 0.62)`| Градієнтне затемнення фото |

### 4.2. Виявлені хардкодні значення кольорів у кодовій базі:
1. `src/components/energy/energy-plus-card.tsx`:
   - `#FDF2F6` (фон картки Energy+)
   - `#F7DDE6` (бейджики та ікон-бокси)
   - `#5A122D` (заголовок та іконки Energy+)
   - `#9A1D4B` (ціна та бейдж)
   - `rgba(182, 36, 90, 0.1)` (розділювач)
2. `src/components/energy/insufficient-energy-sheet.tsx`:
   - `#FDF2F5`, `#F3D2DF`, `#8A1538`, `#982755`, `#EBE5E8`, `#6C626C`
3. `src/components/energy/energy-packages-list.tsx`:
   - `#FDF2F6` (фон рекомендованого пакета)
   - `#5A122D` (текст)
   - `#F7DDE6` (бейдж)
   - `#9A1D4B` (текст бейджа)
   - `rgba(33, 28, 36, 0.06)` (рамка контейнера)
4. `src/components/energy/balance-card.tsx`:
   - `#9A1D4B` (іконка flash та fill треку)
   - `#EAE5E8` (фон треку прогресу)
   - `rgba(33, 28, 36, 0.06)` (рамка картки)
5. `src/components/energy/waiting-characters.tsx`:
   - `rgba(33, 28, 36, 0.06)` (рамка картки)
6. `src/app/(onboarding)/welcome.tsx`:
   - `LinearGradient colors={['rgba(250,248,247,0)', colors.background]}` (хардкодний прозорий білий, який у темній темі створює білу пелену)
7. `src/app/+html.tsx`:
   - `#FAF8F7` (theme-color)
   - `#EFEAED` (html, body background-color)

---

## 5. Архітектура тем (Theming Architecture)

### 5.1. Повна палітра: Light vs Dark Tokens

```ts
export const lightColors = {
  background: '#FAF8F7',
  surface: '#FFFFFF',
  surfaceMuted: '#F3EEF1',
  textPrimary: '#211C24',
  textSecondary: '#6C626C',
  textOnBrand: '#FFFFFF',
  textOnMedia: '#FFFFFF',
  brand: '#B6245A',
  brandPressed: '#9A1D4B',
  brandSubtle: '#F9E7EE',
  energyText: '#765000',
  energySurface: '#FFF1D1',
  border: '#E7E0E5',
  cardBorderSubtle: 'rgba(33, 28, 36, 0.06)',
  danger: '#B3261E',
  success: '#1E7A46',
  pass: '#6C626C',

  // Преміальні поверхні
  premiumDeep: '#3B1232',
  premiumGold: '#F6C445',
  textOnPremiumMuted: 'rgba(255, 255, 255, 0.72)',
  premiumTrack: 'rgba(255, 255, 255, 0.18)',
  premiumInk: '#1C0A18',

  // Energy+ спеціальні токени
  energyPlusCardBg: '#FDF2F6',
  energyPlusCardBorder: '#F3D2DF',
  energyPlusCardText: '#5A122D',
  energyPlusBadgeBg: '#F7DDE6',
  energyPlusBadgeText: '#9A1D4B',
  energyTrackBg: '#EAE5E8',

  // Liquid Glass (підсилений білий для R1)
  glass: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.95)',
  glassEdge: 'rgba(33, 28, 36, 0.07)',
  glassLens: 'rgba(255, 255, 255, 0.96)',
  tabBarInactive: '#403644', // Забезпечує контраст неактивних вкладок на білій скляній пігулці

  overlay: 'rgba(33, 28, 36, 0.55)',
  mediaScrim: 'rgba(0, 0, 0, 0.62)',
  transparent: 'transparent',
  fadeTransparent: 'rgba(250, 248, 247, 0)',
};

export const darkColors: typeof lightColors = {
  background: '#121013',            // Глибокий благородний сливово-вугільний фон
  surface: '#1C1820',               // Піднята карткова поверхня
  surfaceMuted: '#28232D',          // М'яка поверхня для чіпів, пресів, інпутів
  textPrimary: '#F6F3F7',           // Контрастний чистий теплий білий текст (> 13:1)
  textSecondary: '#A59BAA',         // Читабельний вторинний текст (> 5:1 WCAG AA)
  textOnBrand: '#FFFFFF',           // Завжди білий на ягідному фоні
  textOnMedia: '#FFFFFF',           // Завжди білий на фото
  brand: '#DC3B78',                 // Яскравіший ягідний відтінок для ідеальної читабельності в темряві
  brandPressed: '#BA2B61',
  brandSubtle: 'rgba(220, 59, 120, 0.16)', // Напівпрозорий ягідний для бейджів та обраних чіпів
  energyText: '#FFD666',            // Світле золото для енергії
  energySurface: '#3A2E10',         // Глибокий бурштиновий контейнер
  border: '#332C38',                // Тонкий виразний розділювач
  cardBorderSubtle: 'rgba(255, 255, 255, 0.08)',
  danger: '#FF6459',
  success: '#38D468',
  pass: '#A59BAA',

  // Преміальні поверхні (збереження розкішної темної естетики)
  premiumDeep: '#2E0B27',
  premiumGold: '#F6C445',
  textOnPremiumMuted: 'rgba(255, 255, 255, 0.72)',
  premiumTrack: 'rgba(255, 255, 255, 0.22)',
  premiumInk: '#140512',

  // Energy+ спеціальні токени в темній темі
  energyPlusCardBg: '#281320',
  energyPlusCardBorder: '#4E213B',
  energyPlusCardText: '#FFB8D2',
  energyPlusBadgeBg: '#451932',
  energyPlusBadgeText: '#FF80AC',
  energyTrackBg: '#342B38',

  // Liquid Glass у темній темі (R1: збереження високого білого відтінку на чорному)
  glass: 'rgba(255, 255, 255, 0.88)', // Яскраве матове біле скло на темному фоні
  glassBorder: '#FFFFFF',
  glassEdge: 'rgba(0, 0, 0, 0.40)',
  glassLens: '#FFFFFF',
  tabBarInactive: '#403644', // Контрастний графіт на білому склі

  overlay: 'rgba(0, 0, 0, 0.75)',
  mediaScrim: 'rgba(0, 0, 0, 0.65)',
  transparent: 'transparent',
  fadeTransparent: 'rgba(18, 16, 19, 0)',
};
```

### 5.2. Модель стану та збереження теми

Створюємо типізоване сховище теми на базі Zustand (`src/store/theme-store.ts`) з інтеграцією в `STORAGE_KEYS.theme`:

```ts
import { Appearance, useColorScheme } from 'react-native';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS, persistStorage } from '@/lib/storage';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'flirter.theme.v1',
      storage: persistStorage,
    },
  ),
);
```

### 5.3. Хуки `useTheme`, `useThemeColor`, `useThemedStyles` (`src/theme/use-theme.ts`)

```ts
import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { useThemeStore, type ThemeMode, type ResolvedTheme } from '@/store/theme-store';
import { lightColors, darkColors, type ThemeColors, type ColorToken } from '@/theme/tokens';

export function useTheme() {
  const systemScheme = useColorScheme();
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  const theme: ResolvedTheme = useMemo(() => {
    if (mode === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemScheme]);

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return {
    mode,
    theme,
    isDark,
    colors,
    setMode,
  };
}

export function useThemeColor(token: ColorToken): string {
  const { colors } = useTheme();
  return colors[token];
}

export function useThemedStyles<T>(factory: (colors: ThemeColors, isDark: boolean) => T): T {
  const { colors, isDark } = useTheme();
  return useMemo(() => factory(colors, isDark), [colors, isDark]);
}
```

### 5.4. Підтримка зворотної сумісності (Zero-Breaking Policy)
- У файлі `src/theme/tokens.ts`:
  - `export { lightColors, darkColors };`
  - `export const colors = lightColors;` (для статичних модульних контекстів та збереження компіляції існуючих тестів чи скриптів).
  - Усі типи (`ColorToken`, `TypographyVariant`) залишаються повністю сумісними.

### 5.5. Оновлення кореневого `App` та статус-бару (`src/app/_layout.tsx`)
```tsx
export default function RootLayout() {
  const isReady = useAppReady();
  const isOnboarded = useSessionStore(selectIsOnboarded);
  const { isDark, colors } = useTheme();

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={[styles.frame, { backgroundColor: colors.background }]}>
          {isReady ? (
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
              <Stack.Protected guard={!isOnboarded}>
                <Stack.Screen name="(onboarding)" />
              </Stack.Protected>
              <Stack.Protected guard={isOnboarded}>
                <Stack.Screen name="(app)" />
              </Stack.Protected>
            </Stack>
          ) : (
            <BootScreen />
          )}
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

---

## 6. Стратегія міграції компонентів та екранів

### 6.1. Ядро UI-компонентів (`src/components/ui/`)
1. **`AppText` (`app-text.tsx`):**
   - Підключити `const { colors } = useTheme();`
   - Замість статичного `colors[color]` брати значення з динамічної теми.
   - **Ефект:** Одразу автоматично адаптує весь текст у всіх 40+ файлах додатку!
2. **`Button` (`button.tsx`):**
   - Перенести обчислення `VARIANT_STYLES` всередину компонента або в `useMemo` на основі `useTheme().colors`.
3. **`TextField` (`text-field.tsx`):**
   - Динамічний колір рамки (`borderColor`), фону інпуту (`surface`), тексту (`textPrimary`) та плейсхолдера (`textSecondary`).
4. **`BottomSheet` (`bottom-sheet.tsx`):**
   - Динамічний фон шторки (`surface`), хендла (`border`), оверлея (`overlay`).
5. **`SelectableChip` (`selectable-chip.tsx`):**
   - Фон у вибраному стані: `colors.brand` або `isDark ? colors.surface : colors.textPrimary`, а контент — `colors.textOnBrand`.
6. **`IconButton`, `Checkbox`, `OptionGroup`, `Avatar`, `Chip`:**
   - Оновити фони, рамки та кольори іконок на динамічні токени.
7. **`GlassSurface` (`glass-surface.tsx`):**
   - Передавати `colorScheme="light"` та `tintColor="rgba(255, 255, 255, 0.35)"` у `GlassView`.
   - В оновленому fallback використовувати динамічний `colors.glass` та `colors.glassBorder`.

### 6.2. Навігація та таб-бар
1. **`GlassTabBar` (`glass-tab-bar.tsx`):**
   - Використовувати `tabBarInactive` для неактивних вкладок, `brand` для активної.
   - Фон лінзи: `colors.glassLens`.
2. **`TabsLayout` (`(tabs)/_layout.tsx`):**
   - `sceneStyle: { backgroundColor: colors.background }`.

### 6.3. Продуктові екрани
1. **`DiscoverScreen` (`index.tsx`):**
   - `safeArea` background: `colors.background`.
   - Порожній стан: `colors.brandSubtle` та `colors.brand`.
2. **`CharacterGridCard` (`character-grid-card.tsx`):**
   - Фон плейсхолдера: `colors.surfaceMuted`.
   - Кнопка лайку: `colors.surface` з іконкою `colors.brand`.
3. **`ChatsScreen` (`chats.tsx`):**
   - `rowPressed` background: `colors.surfaceMuted`.
   - Кнопка видалення запиту: `colors.surfaceMuted`.
   - Бейджі: `colors.brand`.
4. **`ChatScreen` (`chat/[id].tsx`) та `Composer` / `MessageBubble`:**
   - Хедер чату: динамічний `colors.background` та `colors.border`.
   - Бульбашка співрозмовника: `colors.surface`, рамка `colors.border`.
   - Бульбашка користувача: `colors.brand`, текст `colors.textOnBrand`.
   - Підказки: фон `colors.surface`, рамка `colors.brand`.
5. **`CharacterProfileScreen` (`character/[id].tsx`):**
   - `body` та `stickyCta`: `colors.background` та `colors.border`.
   - Блок про AI: `colors.brandSubtle`.
6. **`EnergyScreen` (`energy.tsx`) та компоненти енергії:**
   - `BalanceCard`: `colors.surface`, рамка `colors.cardBorderSubtle`, трек `colors.energyTrackBg`.
   - `EnergyPlusCard`: використання токенів `energyPlusCardBg`, `energyPlusCardBorder`, `energyPlusCardText`, `energyPlusBadgeBg`.
   - `EnergyPackagesList`: рекомендований рядок на `energyPlusBadgeBg` / `brandSubtle`.
   - `InsufficientEnergySheet`: усунення хардкоду `#FDF2F5` / `#F3D2DF` на користь системних токенів.
   - `WaitingCharacters`: `colors.surface`, рамка `colors.cardBorderSubtle`.
7. **`ProfileScreen` (`profile.tsx`):**
   - Картка профілю та групи налаштувань: `colors.surface`, `colors.border`.
   - **Додати перемикач теми:**
     Рядок налаштувань "Тема оформлення" з поточним значенням ("Як у системі" / "Світла" / "Темна") та bottom sheet для вибору режиму.

### 6.4. Onboarding екрани
- `welcome.tsx`: заміна хардкодного `rgba(250,248,247,0)` у `LinearGradient` на `colors.fadeTransparent`.
- `onboarding-layout.tsx`: `colors.background`, `colors.border`, `colors.brand`.
- `age.tsx`, `sign-in.tsx`, `verify.tsx`, `profile-setup.tsx`, `disclosure.tsx`: фони карток фактів, полів та розділювачів.

---

## 7. План верифікації та відповідності критеріям прийому

1. **Перевірка типів та лінтера:**
   - `npx tsc --noEmit` має завершуватися з кодом 0 (також усунути 2 поточні виявлені помилки в `energy-plus-card.tsx` та `insufficient-energy-sheet.tsx`).
   - `npx expo lint` має проходити без помилок.
2. **Візуальний тест контрасту Glass Tab Bar (R1):**
   - Перевірити таб-бар на екрані Discover та Chats при чорному/темному фоні.
   - Переконатися, що пігулка чітко виділяється завдяки високій білій непрозорості (0.85–0.88), білому контуру та контрастним графітовим іконкам/підписам.
3. **Тест перемикання тем (R2):**
   - Перевірити перемикання режимів (`system` -> `dark` -> `light`) через UI в налаштуваннях профілю.
   - Переконатися, що світла тема ідентична оригінальній версії за всіма кольорами, відступами та типографікою.
   - Переконатися, що у темній темі немає "білих спалахів", нечитабельного тексту чи темного тексту на темному фоні.
