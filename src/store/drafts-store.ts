import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage, STORAGE_KEYS } from '@/lib/storage';

interface DraftsState {
  drafts: Record<string, string>;
  setDraft: (characterId: string, text: string) => void;
  reset: () => void;
}

/** Keep unfinished text through navigation and PWA restarts; store it separately from long chat histories. */
export const useDraftsStore = create<DraftsState>()(persist((set) => ({
  drafts: {},
  setDraft: (characterId, text) => set((state) => {
    const next = { ...state.drafts };
    if (text) next[characterId] = text.slice(0, 1000);
    else delete next[characterId];
    return { drafts: next };
  }),
  reset: () => set({ drafts: {} }),
}), { name: STORAGE_KEYS.drafts, storage: persistStorage, partialize: ({ drafts }) => ({ drafts }) }));
