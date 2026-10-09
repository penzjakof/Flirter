import { Platform } from 'react-native';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';

/**
 * Безпечне сховище для zustand persist.
 *
 * ВАЖЛИВО: тут зберігається лише НЕсекретний UI-стан прототипу
 * (прогрес онбордингу, мок-розмови). Токени сесії у продакшені живуть
 * тільки в HttpOnly Secure cookie (див. 06-pwa-session-requirements.md §4),
 * а не в localStorage.
 */
const memoryStore = new Map<string, string>();

const memoryStorage: StateStorage = {
  getItem: (key) => memoryStore.get(key) ?? null,
  setItem: (key, value) => {
    memoryStore.set(key, value);
  },
  removeItem: (key) => {
    memoryStore.delete(key);
  },
};

function resolveWebStorage(): StateStorage {
  // Під час статичного рендеру (Node.js) window відсутній.
  if (typeof window === 'undefined') return memoryStorage;
  try {
    const probeKey = '__flirter_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return window.localStorage;
  } catch {
    // Private mode / заблоковане сховище — працюємо без збереження.
    return memoryStorage;
  }
}

export const persistStorage = createJSONStorage(() =>
  Platform.OS === 'web' ? resolveWebStorage() : memoryStorage,
);

export const STORAGE_KEYS = {
  session: 'flirter.session.v1',
  energy: 'flirter.energy.v1',
  chats: 'flirter.chats.v1',
  filters: 'flirter.filters.v1',
  theme: 'flirter.theme.v1',
} as const;
