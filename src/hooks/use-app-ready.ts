import { useSyncExternalStore } from 'react';

import { useSessionStore } from '@/store/session-store';

const subscribeNoop = () => () => undefined;

/**
 * true лише на клієнті після відновлення persist-стану.
 * Під час гідрації React використовує server snapshot (false), тож перший
 * клієнтський рендер збігається зі статичним HTML (skeleton) — без
 * hydration mismatch і «спалаху» Welcome для залогінених (S25).
 */
export function useAppReady(): boolean {
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const hasHydrated = useSessionStore((state) => state.hasHydrated);
  return isClient && hasHydrated;
}
