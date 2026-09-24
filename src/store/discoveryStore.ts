import { create } from 'zustand';
import { Profile } from '../models';
import { api } from '../services/api';

interface DiscoveryState {
  deck: Profile[];
  currentIndex: number;
  isLoading: boolean;
  fetchDeck: () => Promise<void>;
  swipeRight: (id: string) => void;
  swipeLeft: (id: string) => void;
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  deck: [],
  currentIndex: 0,
  isLoading: false,
  fetchDeck: async () => {
    set({ isLoading: true });
    const profiles = await api.getDiscoveryProfiles();
    set({ deck: profiles, currentIndex: 0, isLoading: false });
  },
  swipeRight: (id) => set((state) => {
    if (state.deck[state.currentIndex]?.id === id) {
      return { currentIndex: state.currentIndex + 1 };
    }
    return state;
  }),
  swipeLeft: (id) => set((state) => {
    if (state.deck[state.currentIndex]?.id === id) {
      return { currentIndex: state.currentIndex + 1 };
    }
    return state;
  }),
}));
