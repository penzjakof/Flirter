/**
 * Дизайн-токени Flirter.
 * Джерело: Codex/product-design/03-ux-ui-direction.md §3.
 * Жодних «сирих» значень у компонентах — тільки через ці токени.
 */
import { Platform, type TextStyle } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceMuted: string;
  textPrimary: string;
  textSecondary: string;
  textOnBrand: string;
  textOnMedia: string;
  brand: string;
  brandPressed: string;
  brandSubtle: string;
  energyText: string;
  energySurface: string;
  border: string;
  cardBorderSubtle: string;
  danger: string;
  success: string;
  pass: string;
  premiumDeep: string;
  premiumGold: string;
  textOnPremiumMuted: string;
  premiumTrack: string;
  premiumInk: string;
  energyPlusCardBg: string;
  energyPlusCardBorder: string;
  energyPlusCardText: string;
  energyPlusBadgeBg: string;
  energyPlusBadgeText: string;
  energyTrackBg: string;
  glass: string;
  glassBorder: string;
  glassEdge: string;
  glassLens: string;
  tabBarInactive: string;
  overlay: string;
  mediaScrim: string;
  transparent: string;
  fadeTransparent: string;
}

export const lightColors: ThemeColors = {
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
  /** Преміальні поверхні магазину енергії/VIP (фон ілюстрації energy-hero). */
  premiumDeep: '#3B1232',
  premiumGold: '#F6C445',
  textOnPremiumMuted: 'rgba(255, 255, 255, 0.72)',
  premiumTrack: 'rgba(255, 255, 255, 0.18)',
  premiumInk: '#1C0A18',
  /** Спеціальні семантичні токени Energy+ */
  energyPlusCardBg: '#FDF2F6',
  energyPlusCardBorder: '#F3D2DF',
  energyPlusCardText: '#5A122D',
  energyPlusBadgeBg: '#F7DDE6',
  energyPlusBadgeText: '#9A1D4B',
  energyTrackBg: '#EAE5E8',
  /** «Рідке скло» (iOS 26 / Telegram): біла напівпрозорість + розмиття + білий край. */
  glass: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.95)',
  /** Тонкий зовнішній контур, щоб скло читалося на білому фоні. */
  glassEdge: 'rgba(33, 28, 36, 0.07)',
  /** «Лінза» активної вкладки — щільніша біла бульбашка. */
  glassLens: 'rgba(255, 255, 255, 0.96)',
  /** Контрастний графітовий колір неактивних іконок/лейблів на білій скляній пігулці. */
  tabBarInactive: '#403644',
  overlay: 'rgba(33, 28, 36, 0.55)',
  mediaScrim: 'rgba(0, 0, 0, 0.62)',
  transparent: 'transparent',
  fadeTransparent: 'rgba(250, 248, 247, 0)',
};

export const darkColors: ThemeColors = {
  background: '#121013',
  surface: '#1C1820',
  surfaceMuted: '#28232D',
  textPrimary: '#F6F3F7',
  textSecondary: '#A59BAA',
  textOnBrand: '#FFFFFF',
  textOnMedia: '#FFFFFF',
  brand: '#DC3B78',
  brandPressed: '#BA2B61',
  brandSubtle: 'rgba(220, 59, 120, 0.16)',
  energyText: '#FFD666',
  energySurface: '#3A2E10',
  border: '#332C38',
  cardBorderSubtle: 'rgba(255, 255, 255, 0.08)',
  danger: '#FF6459',
  success: '#38D468',
  pass: '#A59BAA',
  /** Преміальні поверхні магазину енергії/VIP */
  premiumDeep: '#2E0B27',
  premiumGold: '#F6C445',
  textOnPremiumMuted: 'rgba(255, 255, 255, 0.72)',
  premiumTrack: 'rgba(255, 255, 255, 0.22)',
  premiumInk: '#140512',
  /** Спеціальні семантичні токени Energy+ */
  energyPlusCardBg: '#281320',
  energyPlusCardBorder: '#4E213B',
  energyPlusCardText: '#FFB8D2',
  energyPlusBadgeBg: '#451932',
  energyPlusBadgeText: '#FF80AC',
  energyTrackBg: '#342B38',
  /** «Рідке скло» у темній темі (iOS Liquid Glass Dark Mode) */
  glass: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.15)',
  glassEdge: 'rgba(0, 0, 0, 0.3)',
  glassLens: 'rgba(255, 255, 255, 0.05)',
  tabBarInactive: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.75)',
  mediaScrim: 'rgba(0, 0, 0, 0.65)',
  transparent: 'transparent',
  fadeTransparent: 'rgba(18, 16, 19, 0)',
};

/** Зворотна сумісність: аліас для lightColors за замовчуванням */
export const colors: ThemeColors = lightColors;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  bubble: 18,
  card: 24,
  pill: 999,
} as const;

export const sizes = {
  buttonHeight: 52,
  inputHeight: 52,
  tapTarget: 44,
  icon: 22,
  iconSm: 18,
  avatarSm: 40,
  avatarMd: 56,
  actionButton: 64,
  actionButtonSm: 52,
  tabBarHeight: 56,
  /** Плаваючий glass tab bar: висота «пігулки» та відступ від низу. */
  floatingTabBarHeight: 64,
  floatingTabBarGap: 12,
  headerHeight: 56,
  /** Максимальна ширина колонки на desktop — не розтягуємо картку персонажа. */
  maxContentWidth: 480,
} as const;

export const motion = {
  fast: 160,
  base: 200,
  slow: 240,
} as const;

const fontFamily = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: undefined,
});

/** Типографічна шкала: body 16–17, secondary 14, title 24–28, hero 30–34. */
export const typography = {
  hero: { fontFamily, fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: -0.5 },
  title: { fontFamily, fontSize: 26, lineHeight: 32, fontWeight: '700', letterSpacing: -0.3 },
  heading: { fontFamily, fontSize: 20, lineHeight: 26, fontWeight: '700' },
  bodyStrong: { fontFamily, fontSize: 16, lineHeight: 22, fontWeight: '600' },
  body: { fontFamily, fontSize: 16, lineHeight: 22, fontWeight: '400' },
  secondary: { fontFamily, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontFamily, fontSize: 12, lineHeight: 16, fontWeight: '500' },
  button: { fontFamily, fontSize: 17, lineHeight: 22, fontWeight: '700' },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
export type ColorToken = keyof ThemeColors;

export const shadows = {
  card: Platform.select({
    web: { boxShadow: '0 8px 24px rgba(33, 28, 36, 0.12)' },
    default: {
      shadowColor: '#211C24',
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
  }),
  glass: Platform.select({
    // Більш нейтральна тінь і на 50% прозоріший внутрішній відблиск (inset border)
    web: {
      boxShadow:
        '0 4px 16px rgba(0, 0, 0, 0.1), 0 0 0 0.5px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.5), inset 0 -1px 1px rgba(255, 255, 255, 0.1)',
    },
    default: {
      shadowColor: '#000000',
      shadowOpacity: 0.1,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
  }),
  lens: Platform.select({
    web: { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05), 0 0 0 0.5px rgba(255, 255, 255, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)' },
    default: {
      shadowColor: '#000000',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
  }),
  floating: Platform.select({
    web: { boxShadow: '0 4px 14px rgba(33, 28, 36, 0.14)' },
    default: {
      shadowColor: '#211C24',
      shadowOpacity: 0.14,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
  }),
} as const;
