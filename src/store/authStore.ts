import { create } from 'zustand';
import { User } from '../models';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (phone: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  login: async (phone) => {
    set({ isLoading: true });
    try {
      const user = await api.login(phone);
      set({ user, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },
  logout: () => set({ user: null }),
}));
