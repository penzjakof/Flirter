import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import {
  canOpenOnboardingRoute,
  getNextOnboardingRoute,
  useSessionStore,
  type OnboardingRoute,
} from '@/store/session-store';

interface OnboardingGateProps {
  route: OnboardingRoute;
  children: ReactNode;
}

/** Якщо крок ще недоступний (прямий URL) — веде на актуальний незавершений крок. */
export function OnboardingGate({ route, children }: OnboardingGateProps) {
  const session = useSessionStore();

  if (canOpenOnboardingRoute(session, route)) return <>{children}</>;

  const fallbackRoute = getNextOnboardingRoute(session) ?? '/age';
  return <Redirect href={fallbackRoute} />;
}
