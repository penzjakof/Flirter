import type { StateStorage } from 'zustand/middleware';

/** Metro resolves native-storage.native.ts on iOS/Android, keeping SQLite out of web bundles. */
export function getNativeStorage(): StateStorage {
  throw new Error('Native storage must only be requested on a native platform.');
}
