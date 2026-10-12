import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { I18nManager } from 'react-native';

import { persistStorage, STORAGE_KEYS } from '@/lib/storage';
import i18n, { initI18n, resolveDeviceLanguage } from '@/i18n';
import { type SupportedLanguage, isRtlLanguage } from '@/i18n/types';

export type LanguageMode = 'system' | SupportedLanguage;

export interface LanguageState {
  mode: LanguageMode;
  resolvedLanguage: SupportedLanguage;
  isRTL: boolean;
  setLanguage: (mode: LanguageMode) => Promise<void>;
}

const initialResolved = resolveDeviceLanguage();
const initialRTL = isRtlLanguage(initialResolved);

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      mode: 'system',
      resolvedLanguage: initialResolved,
      isRTL: initialRTL,
      setLanguage: async (mode: LanguageMode) => {
        const resolvedLanguage = mode === 'system' ? resolveDeviceLanguage() : mode;
        const isRTL = isRtlLanguage(resolvedLanguage);

        if (I18nManager.isRTL !== isRTL) {
          I18nManager.allowRTL(isRTL);
          I18nManager.forceRTL(isRTL);
        }

        await i18n.changeLanguage(resolvedLanguage);
        set({ mode, resolvedLanguage, isRTL });
      },
    }),
    {
      name: STORAGE_KEYS.language,
      storage: persistStorage,
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = state.mode === 'system' ? resolveDeviceLanguage() : state.mode;
          const isRTL = isRtlLanguage(resolved);

          if (I18nManager.isRTL !== isRTL) {
            I18nManager.allowRTL(isRTL);
            I18nManager.forceRTL(isRTL);
          }

          if (i18n.isInitialized) {
            i18n.changeLanguage(resolved);
          } else {
            initI18n(resolved);
          }
          state.resolvedLanguage = resolved;
          state.isRTL = isRTL;
        }
      },
    },
  ),
);

export const selectLanguageMode = (state: LanguageState) => state.mode;
export const selectResolvedLanguage = (state: LanguageState) => state.resolvedLanguage;
export const selectIsRTL = (state: LanguageState) => state.isRTL;
