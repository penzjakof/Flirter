import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage, STORAGE_KEYS } from '@/lib/storage';
import type { ThemeMode } from '@/theme/tokens';

export interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode: ThemeMode) => set({ mode }),
    }),
    {
      name: STORAGE_KEYS.theme, // name: 'flirter.theme.v1'
      storage: persistStorage,
    },
  ),
);
