import Storage from 'expo-sqlite/kv-store';
import type { StateStorage } from 'zustand/middleware';

const storage: StateStorage = {
  getItem: (key) => Storage.getItemSync(key),
  setItem: (key, value) => Storage.setItemSync(key, value),
  removeItem: (key) => Storage.removeItemSync(key),
};

export function getNativeStorage(): StateStorage { return storage; }
