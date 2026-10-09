import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { STORAGE_KEYS, persistStorage } from '@/lib/storage';

/**
 * Економіка прототипу (01-product-brief.md §7).
 * 1/10 — задано замовником; решта — [ГІПОТЕЗА] до затвердження.
 * У продакшені баланс веде серверний атомарний ledger; тут — лише мок.
 */
export const ENERGY_CONFIG = {
  initialBalance: 20,
  renewableCap: 30,
  regenIntervalMs: 12 * 60 * 1000,
  costs: {
    textMessage: 1,
    aiPhoto: 10,
  },
} as const;

interface EnergyState {
  /** Відновлювана частина на момент `regenAnchorAt`. */
  renewable: number;
  /** Куплена енергія — не обмежена лімітом. */
  purchased: number;
  /** Мітка, від якої відраховується наступне нарахування. */
  regenAnchorAt: number;

  syncRegen: (now?: number) => void;
  /** Атомарно списує енергію. Повертає false, якщо коштів недостатньо. */
  trySpend: (amount: number) => boolean;
  refund: (amount: number) => void;
  resetForDemo: () => void;
}

export interface EnergySnapshot {
  renewable: number;
  purchased: number;
  total: number;
  isFull: boolean;
  msUntilNext: number;
}

/**
 * Обчислює поточний відновлюваний баланс без мутацій.
 * Нарахування не потребує натискання «Забрати».
 */
export function computeEnergySnapshot(
  state: Pick<EnergyState, 'renewable' | 'purchased' | 'regenAnchorAt'>,
  now: number,
): EnergySnapshot & { nextAnchor: number } {
  const { renewableCap, regenIntervalMs } = ENERGY_CONFIG;

  if (state.renewable >= renewableCap) {
    return {
      renewable: state.renewable,
      purchased: state.purchased,
      total: state.renewable + state.purchased,
      isFull: true,
      msUntilNext: 0,
      nextAnchor: now,
    };
  }

  const elapsed = Math.max(0, now - state.regenAnchorAt);
  const earned = Math.floor(elapsed / regenIntervalMs);
  const renewable = Math.min(renewableCap, state.renewable + earned);
  const isFull = renewable >= renewableCap;
  const nextAnchor = isFull ? now : state.regenAnchorAt + earned * regenIntervalMs;

  return {
    renewable,
    purchased: state.purchased,
    total: renewable + state.purchased,
    isFull,
    msUntilNext: isFull ? 0 : regenIntervalMs - (now - nextAnchor),
    nextAnchor,
  };
}

const createInitialState = () => ({
  renewable: ENERGY_CONFIG.initialBalance,
  purchased: 0,
  regenAnchorAt: Date.now(),
});

export const useEnergyStore = create<EnergyState>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      syncRegen: (now = Date.now()) => {
        const snapshot = computeEnergySnapshot(get(), now);
        set({ renewable: snapshot.renewable, regenAnchorAt: snapshot.nextAnchor });
      },

      trySpend: (amount) => {
        if (amount <= 0) return true;
        const now = Date.now();
        const snapshot = computeEnergySnapshot(get(), now);
        if (snapshot.total < amount) return false;

        // Спершу витрачається відновлювана енергія, потім куплена.
        const fromRenewable = Math.min(snapshot.renewable, amount);
        const fromPurchased = amount - fromRenewable;
        const wasFull = snapshot.isFull;

        set({
          renewable: snapshot.renewable - fromRenewable,
          purchased: snapshot.purchased - fromPurchased,
          // Якщо запас був повний, таймер стартує з моменту витрати.
          regenAnchorAt: wasFull ? now : snapshot.nextAnchor,
        });
        return true;
      },

      refund: (amount) => {
        if (amount <= 0) return;
        const snapshot = computeEnergySnapshot(get(), Date.now());
        set({ renewable: snapshot.renewable + amount, regenAnchorAt: snapshot.nextAnchor });
      },

      resetForDemo: () => set(createInitialState()),
    }),
    { name: STORAGE_KEYS.energy, storage: persistStorage },
  ),
);
