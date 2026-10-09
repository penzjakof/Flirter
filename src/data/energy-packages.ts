import { ENERGY_CONFIG } from '@/store/energy-store';

export interface EnergyPackage {
  id: 'small' | 'medium' | 'large';
  amount: number;
  price: number;
  /** Пакет, підсвічений як рекомендований. */
  isRecommended?: boolean;
}

/**
 * Пакети поповнення. Кількості — [ГІПОТЕЗА] з 01-product-brief.md §7.
 * Ціни приходять з каталогу платіжного провайдера і тут свідомо НЕ вигадуються.
 */
export const ENERGY_PACKAGES: readonly EnergyPackage[] = [
  { id: 'small', amount: 50, price: 49 },
  { id: 'medium', amount: 150, price: 129, isRecommended: true },
  { id: 'large', amount: 400, price: 299 },
];

/** Переваги VIP — узгоджено з S19 специфікації (ліміт і швидкість відновлення). */
export const VIP_BENEFITS: readonly string[] = [
  `Запас 60 ⚡ замість ${ENERGY_CONFIG.renewableCap}`,
  'Відновлення вдвічі швидше: 1 ⚡ кожні 6 хв',
  'Повідомлення й фото — за тими ж цінами в енергії',
];
