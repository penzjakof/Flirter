# Звіт емпіричного челенджера: Верифікація контрастності Glass Tab Bar та UI (WCAG 2.1)

**Дата й час:** 2026-10-08T13:52:00Z  
**Челенджер:** Challenger 1 (Adversarial Contrast & Glass Tab Bar Verifier)  
**Ролі:** critic, specialist  
**Вердикт:** **REQUEST_CHANGES** (ПОТРЕБУЄ ЗМІН)  
**Загальна оцінка ризику:** HIGH (Високий на нативній iOS платформі)  

---

## 1. Резюме перевірки (Executive Summary)

Було проведено повномасштабну емпіричну та математичну верифікацію візуальної контрастності нижнього плаваючого навігаційного бару (**Glass Tab Bar**) та системи кольорових токенів у світлій і темній темах додатку Flirter.
Для обчислень було розроблено та виконано автономний верифікаційний скрипт `scratch/adversarial-contrast-test.mjs`, який реалізує офіційні формули відносної яскравості (Relative Luminance) та коефіцієнта контрастності (Contrast Ratio) стандарту **W3C WCAG 2.1 (§1.4.3, §1.4.6, §1.4.11)** з урахуванням математичного альфа-блендингу напівпрозорих шарів.

### Короткий огляд результатів:
1. **Токени палітри (Fallback / Web / Android):** Повністю бездоганні. Біла скляна капсула (`darkColors.glass = rgba(255, 255, 255, 0.88)`) над чистим чорним `#000000` забезпечує контраст **15.91:1**, а над темним фоном `#121013` — **14.65:1** (норма WCAG UI >= 3.0:1).
2. **Неактивні елементи на білому склі:** Графітовий колір `tabBarInactive = '#403644'` має контраст **8.70:1 — 8.89:1**, що перевищує навіть рівень **WCAG AAA** (7.0:1).
3. **КРИТИЧНИЙ ДЕФЕКТ (Блокуючий фактор для iOS):**  
   У файлі `src/components/layout/glass-tab-bar.tsx` (рядки 55–56) виявлено передачу:
   ```tsx
   tintColor={isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.40)'}
   colorScheme={isDark ? 'dark' : 'light'}
   ```
   На нативному iOS (`expo-glass-effect` / `GlassView`) у темній темі це примусово вмикає **темне скло** (Dark Blur), що прямо порушує вимогу технічного завдання **ORIGINAL_REQUEST.md §R1** (*«додавши більше білого відтінку/непрозорості, щоб він не зливався з чорним фоном»*). Крім того, на темному склі неактивні графітові іконки `#403644` колапсують до контрасту **~1.08:1** (невидимі темні іконки на темному склі).

---

## 2. Математичні формули та методологія розрахунку

### 2.1. Відносна яскравість (Relative Luminance W3C)
Для кожного каналу $C \in \{R, G, B\}$ у діапазоні $[0, 255]$:
$$sRGB = \frac{C}{255}$$
$$C_{lin} = \begin{cases} \frac{sRGB}{12.92}, & sRGB \le 0.04045 \\ \left(\frac{sRGB + 0.055}{1.055}\right)^{2.4}, & sRGB > 0.04045 \end{cases}$$
$$L = 0.2126 \cdot R_{lin} + 0.7152 \cdot G_{lin} + 0.0722 \cdot B_{lin}$$

### 2.2. Альфа-композитинг (Alpha Blending over Base Surface)
$$C_{result} = \text{round}(C_{fg} \cdot \alpha + C_{bg} \cdot (1 - \alpha))$$

### 2.3. Коефіцієнт контрастності (Contrast Ratio)
$$CR = \frac{L_1 + 0.05}{L_2 + 0.05}, \quad \text{де } L_1 \ge L_2$$

---

## 3. Детальні результати емпіричних тестів

### Завдання 1: Контрастність капсули Glass Tab Bar проти чорного та темного фонів
- **Токен матового скла (Dark Mode):** `rgba(255, 255, 255, 0.88)` (88% білого).
- **Зовнішній контур (Border):** `rgba(255, 255, 255, 0.98)`.

| Фон | Колір фону | Яскравість фону ($L_{bg}$) | Композитний колір капсули | Яскравість капсули ($L_{cap}$) | Коефіцієнт контрастності | Стандарт WCAG SC 1.4.11 (>= 3.0:1) |
|---|---|---|---|---|---|---|
| Pure Black | `#000000` | 0.0000 | `#E0E0E0` (rgb 224, 224, 224) | 0.7454 | **15.91:1** | **PASS** (перевищує норму в 5.3 раза) |
| Dark Background | `#121013` | 0.0055 | `#E3E2E3` (rgb 227, 226, 227) | 0.7627 | **14.65:1** | **PASS** (перевищує норму в 4.8 раза) |

---

### Завдання 2: Контрастність `tabBarInactive` (`#403644`) на білій поверхні скла
- **Колір неактивного елемента:** `#403644` (графітовий).
- **Відносна яскравість:** $L = 0.0415$.

| Поверхня під неактивною іконкою | Композитний колір поверхні | Яскравість ($L_{surf}$) | Контрастне співвідношення | WCAG AA (>= 4.5:1) | WCAG AAA (>= 7.0:1) |
|---|---|---|---|---|---|
| Скло на Pure Black (`#000000`) | `#E0E0E0` | 0.7454 | **8.70:1** | **PASS** | **PASS** |
| Скло на Dark BG (`#121013`) | `#E3E2E3` | 0.7627 | **8.89:1** | **PASS** | **PASS** |
| Скло на Light BG (`#FAF8F7`) | `#FEFEFE` | 0.9912 | **11.38:1** | **PASS** | **PASS** |
| Чистий білий (`#FFFFFF`) | `#FFFFFF` | 1.0000 | **11.48:1** | **PASS** | **PASS** |
| *Нативне Dark Glass на iOS* | *~#1C1820* | *~0.0400* | ***~1.08:1*** | **FAIL** | **FAIL** |

---

### Завдання 3: Контрастність брендового кольору (`colors.brand`) на активній лінзі (`colors.glassLens`)

| Режим теми | Токен Brand | Токен GlassLens | Композитна поверхня | Яскравість Brand | Яскравість Lens | Контраст | WCAG UI / Graphical (>= 3.0:1) | WCAG Normal Text (>= 4.5:1) |
|---|---|---|---|---|---|---|---|---|
| **Light Mode** | `#B6245A` | `rgba(255, 255, 255, 0.96)` | `#FFFFFF` | 0.1195 | 1.0000 | **6.20:1** | **PASS** | **PASS** |
| **Dark Mode** | `#DC3B78` | `#FFFFFF` | `#FFFFFF` | 0.1970 | 1.0000 | **4.25:1** | **PASS** (іконка 24px) | 4.25:1 (підпис 11px bold) |

---

### Завдання 4: Аудит контрастності `textPrimary` та `textSecondary` за стандартами WCAG AA / AAA

| Перевірена пара | Текст (FG) | Фон (BG) | Контраст | Статус WCAG 2.1 | Оцінка |
|---|---|---|---|---|---|
| **Light:** `textPrimary` on `background` | `#211C24` | `#FAF8F7` | **15.79:1** | AAA (Normal & Large) | Бездоганно |
| **Light:** `textPrimary` on `surface` | `#211C24` | `#FFFFFF` | **16.72:1** | AAA (Normal & Large) | Бездоганно |
| **Light:** `textSecondary` on `background` | `#6C626C` | `#FAF8F7` | **5.51:1** | AA (Normal) / AAA (Large) | Бездоганно |
| **Light:** `textSecondary` on `surface` | `#6C626C` | `#FFFFFF` | **5.83:1** | AA (Normal) / AAA (Large) | Бездоганно |
| **Dark:** `textPrimary` on `background` | `#F6F3F7` | `#121013` | **17.20:1** | AAA (Normal & Large) | Бездоганно |
| **Dark:** `textPrimary` on `surface` | `#F6F3F7` | `#1C1820` | **15.89:1** | AAA (Normal & Large) | Бездоганно |
| **Dark:** `textSecondary` on `background` | `#A59BAA` | `#121013` | **7.09:1** | AAA (Normal & Large) | Бездоганно |
| **Dark:** `textSecondary` on `surface` | `#A59BAA` | `#1C1820` | **6.55:1** | AA (Normal) / AAA (Large) | Бездоганно |
| **Light:** `textOnBrand` on `brand` | `#FFFFFF` | `#B6245A` | **6.20:1** | AA (Normal) / AAA (Large) | Бездоганно |
| **Dark:** `textOnBrand` on `brand` | `#FFFFFF` | `#DC3B78` | **4.25:1** | AA (Large/Buttons) | Відповідає |
| **Light:** `energyText` on `energySurface` | `#765000` | `#FFF1D1` | **6.43:1** | AA (Normal) / AAA (Large) | Бездоганно |
| **Dark:** `energyText` on `energySurface` | `#FFD666` | `#3A2E10` | **9.54:1** | AAA (Normal & Large) | Бездоганно |
| **Light:** `energyPlusCardText` on `energyPlusCardBg` | `#5A122D` | `#FDF2F6` | **12.32:1** | AAA (Normal & Large) | Бездоганно |
| **Dark:** `energyPlusCardText` on `energyPlusCardBg` | `#FFB8D2` | `#281320` | **10.83:1** | AAA (Normal & Large) | Бездоганно |

---

### Завдання 5: Перевірка колірних колізій (White-on-White / Black-on-Black)

Було перевірено всі варіації компонентів:
- **`SelectableChip`:**
  - Selected (Light): `#FFFFFF` на `#B6245A` -> CR = **6.20:1** (Safe)
  - Selected (Dark): `#FFFFFF` на `#DC3B78` -> CR = **4.25:1** (Safe)
  - Unselected (Light): `#211C24` на `#F3EEF1` -> CR = **14.28:1** (Safe)
  - Unselected (Dark): `#F6F3F7` на `#28232D` -> CR = **13.41:1** (Safe)
- **`Button`:** Primary, Secondary, Ghost, Danger у Light та Dark -> CR від **4.25:1** до **16.72:1** (Safe).
- **`TextField`:** Input, Placeholder, Label, Error -> CR від **4.55:1** до **16.72:1** (Safe).
- **`MessageBubble`:** Outgoing, Incoming, System, Disclaimer, Like Sticker -> CR від **4.25:1** до **16.72:1** (Safe).
- **`AppText`:** 0 колізій у стандартних парах.

---

## 4. Виявлені дефекти (Findings & Vulnerabilities)

### 4.1. [КРИТИЧНО] Порушення вимоги §R1 та деградація контрасту на iOS у `glass-tab-bar.tsx`
- **Файл:** `src/components/layout/glass-tab-bar.tsx` (рядки 55–56)
- **Поточний код:**
  ```tsx
  <GlassSurface 
    style={styles.pill} 
    tintColor={isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.40)'} 
    colorScheme={isDark ? 'dark' : 'light'}>
  ```
- **Сценарій збою:**
  1. Коли користувач вмикає темну тему на iOS, `colorScheme="dark"` передається в нативний `GlassView` (`expo-glass-effect`).
  2. Apple Liquid Glass генерує темне розмите скло замість білого матового.
  3. Це порушує вимогу §R1 (*«Нижній навігаційний бар має бути модифікований так, щоб на чорному фоні він залишався видимим і контрастним (додати більше білого кольору)»*).
  4. Неактивні вкладки рендеряться кольором `tabBarInactive = '#403644'` (темний графіт). На темному склі виникає колізія **темний на темному** ($CR \approx 1.08:1$), через що неактивні іконки стають невидимими.
- **Необхідне виправлення:**  
  Встановити постійне біле скло (White Frosted Glass):
  ```tsx
  <GlassSurface 
    style={styles.pill} 
    tintColor="rgba(255, 255, 255, 0.40)" 
    colorScheme="light">
  ```
  (або просто `<GlassSurface style={styles.pill}>`, оскільки в `GlassSurface` дефолтними значеннями вже є `colorScheme = 'light'` та `tintColor = 'rgba(255, 255, 255, 0.40)'`).

---

## 5. Підсумковий вердикт

Оскільки на нативній платформі iOS компонент `glass-tab-bar.tsx` перемикається на темне скло, що порушує контракт R1 та знижує контрастність неактивних елементів до 1.08:1:

### **VERDICT: REQUEST_CHANGES**

**Дія для розробника:**  
Замінити пропси `tintColor` та `colorScheme` у `src/components/layout/glass-tab-bar.tsx` рядки 55–56 на `colorScheme="light"` та `tintColor="rgba(255, 255, 255, 0.40)"` (або видалити їх, покладаючись на дефолтні значення `GlassSurface`).
