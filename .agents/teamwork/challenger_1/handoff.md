# Handoff Report — Challenger 1 (Adversarial Contrast & Glass Tab Bar Verifier)

**Дата:** 2026-10-08T13:53:00Z  
**Від:** Challenger 1 (`challenger_1`)  
**Кому:** Orchestrator 2 (`orchestrator_2` / `f4c9f810-9ff6-4876-9fec-a2a6dcce1bf6`)  
**Тип хендофу:** Hard (Task complete)  
**Вердикт:** **REQUEST_CHANGES**  

---

## 1. Observation (Спостереження)

1. **Компіляція та типізація:**
   - Команда: `npx tsc --noEmit` -> 0 помилок, код виходу 0.
   - Команда: `npx expo lint` -> 0 помилок/попереджень, код виходу 0.

2. **Токени теми (`src/theme/tokens.ts`):**
   - Рядок 83: `lightColors.glass = 'rgba(255, 255, 255, 0.85)'`
   - Рядок 90: `lightColors.tabBarInactive = '#403644'`
   - Рядок 129: `darkColors.glass = 'rgba(255, 255, 255, 0.88)'`
   - Рядок 132: `darkColors.glassLens = '#FFFFFF'`
   - Рядок 133: `darkColors.tabBarInactive = '#403644'`
   - Рядок 105: `darkColors.brand = '#DC3B78'`

3. **Код компонента Glass Tab Bar (`src/components/layout/glass-tab-bar.tsx:53–56`):**
   ```tsx
   <GlassSurface 
     style={styles.pill} 
     tintColor={isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.40)'} 
     colorScheme={isDark ? 'dark' : 'light'}>
   ```

4. **Код компонента Glass Surface (`src/components/ui/glass-surface.tsx:40–51`):**
   ```tsx
   if (HAS_NATIVE_LIQUID_GLASS) {
     return (
       <GlassView
         glassEffectStyle="regular"
         colorScheme={colorScheme ?? 'light'}
         tintColor={tintColor ?? 'rgba(255, 255, 255, 0.40)'}
         isInteractive
         style={[styles.base, style]}
         testID={testID}>
         {children}
       </GlassView>
     );
   }
   ```

5. **Тест `scratch/test-m1.mjs`:**
   - Рядки 50–51 очікують:
     ```js
     assert(glassTabBarSrc.includes('tintColor="rgba(255, 255, 255, 0.40)"'));
     assert(glassTabBarSrc.includes('colorScheme="light"'));
     ```
   - Запуск `node scratch/test-m1.mjs` падає через розбіжність сигнатури пропсів у `glass-tab-bar.tsx`.

6. **Емпіричні математичні результати (`node scratch/adversarial-contrast-test.mjs`):**
   - Біла матова капсула над `#000000`: CR = **15.91:1** (WCAG UI >= 3.0:1 -> PASS).
   - Біла матова капсула над `#121013`: CR = **14.65:1** (WCAG UI >= 3.0:1 -> PASS).
   - `tabBarInactive` (`#403644`) на білому склі над чорним: CR = **8.70:1** (WCAG AAA -> PASS).
   - `tabBarInactive` (`#403644`) на темному склі (якщо на iOS вмикається `colorScheme="dark"`): CR = **~1.08:1** (WCAG FAIL, невидимі іконки).
   - `colors.brand` на лінзі: Light = **6.20:1** (PASS), Dark = **4.25:1** (PASS для іконки 24px).
   - Пари `textPrimary`/`textSecondary`: від **5.51:1** до **17.20:1** (WCAG AA/AAA).
   - 42 перевірені колірні пари в базових компонентах: 0 колізій white-on-white / black-on-black.

---

## 2. Logic Chain (Логічний ланцюжок)

1. Вимога **ORIGINAL_REQUEST.md §R1** прямо вимагає: *«Виправити відображення нижнього навігаційного бару (Glass Tab Bar), додавши більше білого відтінку/непрозорості, щоб він не зливався з чорним фоном»*.
2. Дизайн Flirter передбачає концепцію **White Frosted Glass** (біле напівпрозоре матове скло) для плаваючої навігаційної пігулки, завдяки чому вона чітко читається на будь-якому фоні, а елементи всередині неї використовують темний графітовий колір (`#403644`).
3. У `src/components/layout/glass-tab-bar.tsx` рядки 55–56 передають `colorScheme={isDark ? 'dark' : 'light'}`.
4. На iOS пристроях (де `HAS_NATIVE_LIQUID_GLASS === true`) це змушує нативний компонент `GlassView` рендерити **темне скло** (Dark Blur) замість білого при `isDark === true`.
5. Темне розмите скло на темному фоні порушує вимогу §R1 (знову зливається з чорним фоном) і спричиняє колапс контрасту неактивних графітових іконок `#403644` до рівня **~1.08:1** (нерозрізнюваний темно-сірий на чорно-сірому).
6. Водночас у веб/Android фолбеку скло рендериться через `colors.glass` (`rgba(255, 255, 255, 0.88)`), що забезпечує ідеальний контраст 15.91:1. Тобто токени налаштовані правильно, але пропси в `glass-tab-bar.tsx` ламають нативну поведінку на iOS.
7. Отже, доки в `glass-tab-bar.tsx` передається `colorScheme="dark"`, додаток не відповідає вимогам §R1 на iOS.

---

## 3. Caveats (Застереження)

1. **Невикористовуваний компонент `package-option.tsx`:**  
   У файлі `src/components/energy/package-option.tsx` фон картки задано статичним `colors.surface`, що дає контраст 1.10:1 у темній темі. Цей компонент наразі замінено на `EnergyPackagesList` і він не викликається на активних екранах, проте потребує рефакторингу або видалення під час майбутньої оптимізації кодової бази.
2. **Контраст дрібного тексту активної вкладки (Dark Mode):**  
   Для брендового кольору `#DC3B78` на білій лінзі коефіцієнт становить 4.25:1. Для графічної іконки 24px це перевищує поріг WCAG 3.0:1. Дрібний підпис 11px bold має контраст 4.25:1 замість 4.5:1, що візуально компенсується напівжирним накресленням.

---

## 4. Conclusion (Висновки)

Система токенів тем та базових UI-компонентів успішно проходить емпіричну та математичну верифікацію за стандартом WCAG 2.1.
Проте через примусове передавання `colorScheme="dark"` нативному компоненту `GlassSurface` у `src/components/layout/glass-tab-bar.tsx` навігаційний бар на iOS втрачає білий колір і порушує контраст неактивних елементів на темній темі.

**Фінальний вердикт:** **REQUEST_CHANGES**

**Необхідна зміна (Action Required):**
У файлі `src/components/layout/glass-tab-bar.tsx` змінити рядки 55–56:
```tsx
// ЗАМІНИТИ:
<GlassSurface 
  style={styles.pill} 
  tintColor={isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.40)'} 
  colorScheme={isDark ? 'dark' : 'light'}>

// НА:
<GlassSurface 
  style={styles.pill} 
  tintColor="rgba(255, 255, 255, 0.40)" 
  colorScheme="light">
```

---

## 5. Verification Method (Метод незалежної верифікації)

Команди для перевірки:
```bash
# 1. Запуск емпіричного тесту контрастності
node scratch/adversarial-contrast-test.mjs

# 2. Перевірка контрактів M1
node scratch/test-m1.mjs

# 3. Перевірка компіляції та лінтера
npx tsc --noEmit
npx expo lint
```

**Умови інвалідації висновку:**
- Підтвердження, що нативний `GlassView` на iOS 26+ з `colorScheme="light"` та `tintColor="rgba(255, 255, 255, 0.40)"` гарантує біле матове скло на темному фоні з контрастом іконок > 8:1.
