import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { STORAGE_KEYS, persistStorage } from '@/lib/storage';
import type { CharacterPreference, Gender } from '@/models/types';

/** Версії юридичних документів, з якими погодився користувач (S06, S42). */
export const LEGAL_VERSIONS = {
  terms: '2026-10-01',
  privacy: '2026-10-01',
  aiDisclosure: '2026-10-01',
} as const;

interface ConsentRecord {
  aiAcknowledgedAt: number;
  termsAcceptedAt: number;
  versions: typeof LEGAL_VERSIONS;
}

export type AuthMode = 'signup' | 'login';

interface SessionData {
  ageRestricted: boolean;
  birthDate: string | null;
  email: string | null;
  emailVerified: boolean;
  authMode: AuthMode;
  nickname: string | null;
  gender: Gender | null;
  preference: CharacterPreference | null;
  consent: ConsentRecord | null;
}

interface SessionState extends SessionData {
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setAuthMode: (mode: AuthMode) => void;
  confirmBirthDate: (isoDate: string) => void;
  markUnderage: () => void;
  setPendingEmail: (email: string) => void;
  confirmEmailVerified: () => void;
  saveProfile: (profile: { nickname: string; gender: Gender | null; preference: CharacterPreference | null }) => void;
  acceptDisclosure: () => void;
  logout: () => void;
}

const INITIAL_DATA: SessionData = {
  ageRestricted: false,
  birthDate: null,
  email: null,
  emailVerified: false,
  authMode: 'signup',
  nickname: null,
  gender: null,
  preference: null,
  consent: null,
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...INITIAL_DATA,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),
      setAuthMode: (mode) => set({ authMode: mode }),

      confirmBirthDate: (isoDate) => set({ birthDate: isoDate, ageRestricted: false }),

      // Неповнолітній: нейтральний стан без підказки «змінити рік» (S02).
      markUnderage: () => set({ ageRestricted: true, birthDate: null }),

      setPendingEmail: (email) => set({ email, emailVerified: false }),
      confirmEmailVerified: () => set({ emailVerified: true }),

      saveProfile: ({ nickname, gender, preference }) => set({ nickname, gender, preference }),

      acceptDisclosure: () => {
        const now = Date.now();
        set({ consent: { aiAcknowledgedAt: now, termsAcceptedAt: now, versions: LEGAL_VERSIONS } });
      },

      logout: () => set({ ...INITIAL_DATA }),
    }),
    {
      name: STORAGE_KEYS.session,
      storage: persistStorage,
      partialize: ({ hasHydrated: _hasHydrated, ...persisted }) => persisted,
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);

export type OnboardingRoute = '/age' | '/sign-in' | '/verify' | '/profile-setup' | '/disclosure';

/**
 * Наступний незавершений крок онбордингу, обчислений із даних.
 * Refresh на будь-якому кроці повертає сюди, без дублювання акаунту (F01).
 * Для входу наявного користувача: email → код → (вік, якщо невідомий) → …
 */
export function getNextOnboardingRoute(state: SessionData): OnboardingRoute | null {
  if (state.authMode === 'signup' && !state.birthDate) return '/age';
  if (!state.emailVerified) return state.email ? '/verify' : '/sign-in';
  if (!state.birthDate) return '/age';
  if (!state.nickname) return '/profile-setup';
  if (!state.consent) return '/disclosure';
  return null;
}

/** Чи дозволено відкрити конкретний крок (захист від deep link у середину флоу). */
export function canOpenOnboardingRoute(state: SessionData, route: OnboardingRoute): boolean {
  switch (route) {
    case '/age':
    case '/sign-in':
      return true;
    case '/verify':
      return Boolean(state.email);
    case '/profile-setup':
      return state.emailVerified && Boolean(state.birthDate);
    case '/disclosure':
      return state.emailVerified && Boolean(state.birthDate) && Boolean(state.nickname);
  }
}

export const selectIsOnboarded = (state: SessionData) =>
  state.emailVerified && Boolean(state.birthDate) && Boolean(state.nickname) && state.consent !== null;

