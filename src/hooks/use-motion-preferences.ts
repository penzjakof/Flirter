import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/** Live preferences, including changes while a PWA is already running. */
export function useMotionPreferences() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const transparency = window.matchMedia('(prefers-reduced-transparency: reduce)');
      const contrast = window.matchMedia('(prefers-contrast: more)');
      const update = () => {
        setReduceMotion(motion.matches);
        setReduceTransparency(transparency.matches || contrast.matches);
      };
      update();
      for (const query of [motion, transparency, contrast]) query.addEventListener('change', update);
      return () => {
        for (const query of [motion, transparency, contrast]) query.removeEventListener('change', update);
      };
    }
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (active) setReduceMotion(value); });
    void AccessibilityInfo.isReduceTransparencyEnabled().then((value) => { if (active) setReduceTransparency(value); });
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    const transparency = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduceTransparency);
    return () => { active = false; motion.remove(); transparency.remove(); };
  }, []);

  return { reduceMotion, reduceTransparency };
}
