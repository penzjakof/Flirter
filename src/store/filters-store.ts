import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AgeRange } from '@/data/filter-options';
import { toggleValue, type CharacterFilters } from '@/lib/character-filters';
import { STORAGE_KEYS, persistStorage } from '@/lib/storage';
import type { CommunicationStyle, Ethnicity, GenderFilter, InterestCategory } from '@/models/types';
import { useSessionStore } from '@/store/session-store';

interface FiltersState {
  /** null — користувач ще не обирав на екрані; тоді діє preference з онбордингу (S05). */
  gender: GenderFilter | null;
  ageRanges: AgeRange[];
  ethnicities: Ethnicity[];
  interests: InterestCategory[];
  styles: CommunicationStyle[];
  onlyNew: boolean;
  toggleInterest: (interest: InterestCategory) => void;
  /** Застосовує чернетку з bottom sheet атомарно (S09). */
  applyFilters: (filters: CharacterFilters) => void;
  resetFilters: () => void;
}

const INITIAL_STATE = {
  gender: null,
  ageRanges: [],
  ethnicities: [],
  interests: [],
  styles: [],
  onlyNew: false,
} satisfies Pick<FiltersState, 'gender' | 'ageRanges' | 'ethnicities' | 'interests' | 'styles' | 'onlyNew'>;

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,
      toggleInterest: (interest) => set((state) => ({ interests: toggleValue(state.interests, interest) })),
      applyFilters: ({ gender, ageRanges, ethnicities, interests, styles, onlyNew }) =>
        set({ gender, ageRanges, ethnicities, interests, styles, onlyNew }),
      resetFilters: () => set(INITIAL_STATE),
    }),
    {
      name: STORAGE_KEYS.filters,
      storage: persistStorage,
      version: 2,
      // v1 → v2: додано ethnicities; решта полів сумісна.
      migrate: (persisted) => ({ ...INITIAL_STATE, ...(persisted as Partial<typeof INITIAL_STATE>) }),
      // Зберігаємо лише дані, без функцій.
      partialize: ({ gender, ageRanges, ethnicities, interests, styles, onlyNew }) => ({
        gender,
        ageRanges,
        ethnicities,
        interests,
        styles,
        onlyNew,
      }),
    },
  ),
);

/** Ефективні фільтри: збережений вибір + fallback гендеру на preference з онбордингу. */
export function useCharacterFilters(): CharacterFilters {
  const storedGender = useFiltersStore((state) => state.gender);
  const ageRanges = useFiltersStore((state) => state.ageRanges);
  const ethnicities = useFiltersStore((state) => state.ethnicities);
  const interests = useFiltersStore((state) => state.interests);
  const styles = useFiltersStore((state) => state.styles);
  const onlyNew = useFiltersStore((state) => state.onlyNew);
  const preference = useSessionStore((state) => state.preference);

  return { gender: storedGender ?? preference ?? 'everyone', ageRanges, ethnicities, interests, styles, onlyNew };
}
