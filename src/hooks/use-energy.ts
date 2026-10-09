import { useEffect, useState } from 'react';

import { computeEnergySnapshot, useEnergyStore, type EnergySnapshot } from '@/store/energy-store';

const TICK_MS = 1000;

/** Живий знімок енергії з посекундним таймером до наступної одиниці. */
export function useEnergy(): EnergySnapshot {
  const renewable = useEnergyStore((state) => state.renewable);
  const purchased = useEnergyStore((state) => state.purchased);
  const regenAnchorAt = useEnergyStore((state) => state.regenAnchorAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(intervalId);
  }, []);

  const { nextAnchor: _nextAnchor, ...snapshot } = computeEnergySnapshot({ renewable, purchased, regenAnchorAt }, now);
  return snapshot;
}
