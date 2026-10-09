import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { STORAGE_KEYS, persistStorage } from '@/lib/storage';
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
