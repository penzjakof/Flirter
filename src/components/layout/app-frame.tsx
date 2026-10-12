import { router, usePathname } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, Platform, StyleSheet, View, useWindowDimensions, type ViewProps } from 'react-native';

import { useMotionPreferences } from '@/hooks/use-motion-preferences';
import { useLanguageStore } from '@/store/language-store';
import { sizes } from '@/theme/tokens';

const TOP_LEVEL_ROUTES = new Set(['/', '/chats', '/profile', '/welcome']);

/** Native navigation owns its gestures. Installed web apps need an app-level back gesture. */
export function AppFrame(props: ViewProps) {
  return Platform.OS === 'web' ? <WebAppFrame {...props} /> : <View {...props} />;
}

function WebAppFrame({ style, ...props }: ViewProps) {
  const pathname = usePathname();
  const isRTL = useLanguageStore((state) => state.isRTL);
  const { reduceMotion } = useMotionPreferences();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, sizes.maxContentWidth);
  const direction = isRTL ? -1 : 1;
  const [offset] = useState(() => new Animated.Value(0));
  const navigating = useRef(false);

  useEffect(() => {
    navigating.current = false;
    offset.stopAnimation();
    offset.setValue(reduceMotion || TOP_LEVEL_ROUTES.has(pathname) ? 0 : 24 * direction);
    Animated.timing(offset, {
      toValue: 0, duration: reduceMotion ? 0 : 220,
      easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();
    return () => offset.stopAnimation();
  }, [pathname, direction, reduceMotion, offset, width]);

  // PanResponder stores callbacks; it does not execute them during render.
  // eslint-disable-next-line react-hooks/refs
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (event, gesture) => {
      if (!event.nativeEvent.touches?.length || navigating.current || TOP_LEVEL_ROUTES.has(pathname) || !router.canGoBack()) return false;
      // x0 is populated only AFTER responder grant. Before grant, derive the touch origin from moveX/dx.
      const start = gesture.moveX - gesture.dx - (width - contentWidth) / 2;
      const isAtEdge = isRTL ? start > contentWidth - 40 && start < contentWidth : start > 0 && start < 40;
      return isAtEdge && gesture.dx * direction > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.4;
    },
    onPanResponderGrant: () => offset.stopAnimation(),
    onPanResponderMove: (_, gesture) => offset.setValue(Math.max(0, gesture.dx * direction) * direction),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx * direction > contentWidth * 0.28 || (gesture.dx * direction > 32 && gesture.vx * direction > 0.7)) {
        navigating.current = true;
        Animated.timing(offset, {
          toValue: contentWidth * direction, duration: reduceMotion ? 0 : 160,
          easing: Easing.out(Easing.cubic), useNativeDriver: false,
        }).start(({ finished }) => { if (finished) router.back(); });
      } else {
        Animated.timing(offset, { toValue: 0, duration: reduceMotion ? 0 : 180, useNativeDriver: false }).start();
      }
    },
    onPanResponderTerminate: () => {
      Animated.timing(offset, { toValue: 0, duration: reduceMotion ? 0 : 180, useNativeDriver: false }).start();
    },
  }), [pathname, width, contentWidth, isRTL, direction, offset, reduceMotion]);

  return <Animated.View {...props} testID="app-frame" {...pan.panHandlers}
    style={[style, styles.touch, { transform: [{ translateX: offset }] }]} />;
}

const styles = StyleSheet.create({ touch: { touchAction: 'pan-y pinch-zoom' } as object });
