import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated, Easing, KeyboardAvoidingView, Modal, PanResponder, Platform,
  Pressable, ScrollView, StyleSheet, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { IconButton } from '@/components/ui/icon-button';
import { useMotionPreferences } from '@/hooks/use-motion-preferences';
import { useKeyboardVisible } from '@/hooks/use-web-viewport';
import { useScrollKeyboardDismiss } from '@/hooks/use-scroll-keyboard-dismiss';
import { radius, sizes, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Disable only for sheets that own a scroll view and a pinned footer. */
  scrollable?: boolean;
}

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

/** The scrim fades in place; the sheet moves independently and stays mounted through its exit. */
export function BottomSheet({ visible, onClose, title, children, scrollable = true }: BottomSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { colors } = useTheme();
  const { reduceMotion } = useMotionPreferences();
  const keyboardVisible = useKeyboardVisible();
  const scrollKeyboardDismiss = useScrollKeyboardDismiss();
  const [presented, setPresented] = useState(visible);
  const [previousVisible, setPreviousVisible] = useState(visible);
  if (visible !== previousVisible) {
    setPreviousVisible(visible);
    if (visible) setPresented(true);
  }
  const [progress] = useState(() => new Animated.Value(0));
  const [drag] = useState(() => new Animated.Value(0));
  const closing = useRef(false);
  const onCloseRef = useRef(onClose);
  const webOpenerRef = useRef<Element | null>(null);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  const sheetHeight = useRef(height);
  const maxHeight = Math.max(120, Math.min(height * 0.92, height - insets.top - spacing.md));

  const close = useCallback((notify = true) => {
    if (closing.current) return;
    closing.current = true;
    Animated.timing(progress, {
      toValue: 0, duration: reduceMotion ? 0 : 200,
      easing: Easing.in(Easing.cubic), useNativeDriver: USE_NATIVE_DRIVER,
    }).start(({ finished }) => {
      if (!finished) return;
      setPresented(false);
      drag.setValue(0);
      closing.current = false;
      if (notify) onCloseRef.current();
    });
  }, [drag, progress, reduceMotion]);
  const historyCloseRef = useRef(close);
  useEffect(() => { historyCloseRef.current = close; }, [close]);

  useEffect(() => {
    if (visible) {
      closing.current = false;
      drag.setValue(0);
    } else if (presented) {
      close(false);
    }
  }, [visible, presented, close, drag]);

  useEffect(() => {
    if (!presented || !visible) return;
    const frame = requestAnimationFrame(() => {
      Animated.timing(progress, {
        toValue: 1, duration: reduceMotion ? 0 : 300,
        easing: Easing.out(Easing.cubic), useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    });
    return () => cancelAnimationFrame(frame);
  }, [presented, visible, progress, reduceMotion]);

  useEffect(() => () => {
    progress.stopAnimation();
    drag.stopAnimation();
  }, [progress, drag]);

  useLayoutEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!presented) {
      webOpenerRef.current = document.activeElement;
      const trackFocus = (event: FocusEvent) => {
        // RN Web focuses its modal portal during the commit, before this effect cleans up.
        // Only remember elements in the application, never the portal's focus sentinels.
        if (event.target instanceof Element && document.getElementById('root')?.contains(event.target)) {
          webOpenerRef.current = event.target;
        }
      };
      document.addEventListener('focusin', trackFocus, true);
      return () => document.removeEventListener('focusin', trackFocus, true);
    }
    // Capture before the modal portal activates its own focus trap.
    const opener = webOpenerRef.current;
    const openerUrl = window.location.href;
    const openerId = opener?.getAttribute('data-testid');
    return () => {
      requestAnimationFrame(() => {
        if (window.location.href !== openerUrl) return;
        // A route refresh or an updated header can replace the original DOM button.
        const target = opener && document.contains(opener) ? opener :
          openerId ? document.querySelector(`[data-testid="${CSS.escape(openerId)}"]`) : null;
        if (target instanceof HTMLElement) target.focus({ preventScroll: true });
      });
    };
  }, [presented]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !presented) return;
    const marker = `sheet-${Date.now()}-${Math.random()}`;
    const url = window.location.href;
    window.history.pushState({ ...window.history.state, flirterSheet: marker }, '', window.location.href);
    const onPopState = (event: PopStateEvent) => {
      // This entry represents transient UI, not a route. Let Expo Router handle actual route changes.
      if (window.location.href !== url) return;
      event.stopImmediatePropagation();
      historyCloseRef.current();
    };
    window.addEventListener('popstate', onPopState, true);
    return () => {
      window.removeEventListener('popstate', onPopState, true);
      if (window.history.state?.flirterSheet !== marker) return;
      // Ignore the matching cleanup event as well, otherwise the router resets the screen and loses its draft.
      const finish = (event: PopStateEvent) => {
        if (window.location.href === url) event.stopImmediatePropagation();
        window.removeEventListener('popstate', finish, true);
        clearTimeout(timeout);
      };
      window.addEventListener('popstate', finish, true);
      const timeout = setTimeout(() => window.removeEventListener('popstate', finish, true), 1000);
      window.history.back();
    };
  }, [presented]);

  // PanResponder stores callbacks; it does not execute them during render.
  // eslint-disable-next-line react-hooks/refs
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) =>
      !closing.current && Math.abs(gesture.dy) > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderGrant: () => drag.stopAnimation(),
    onPanResponderMove: (_, gesture) => drag.setValue(Math.max(0, gesture.dy)),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy > Math.min(120, sheetHeight.current * 0.25) || (gesture.dy > 24 && gesture.vy > 0.7)) {
        close();
      } else {
        Animated.spring(drag, {
          toValue: 0, damping: 26, stiffness: 260, mass: 0.8,
          useNativeDriver: USE_NATIVE_DRIVER,
        }).start();
      }
    },
    onPanResponderTerminate: () => Animated.timing(drag, {
      toValue: 0, duration: reduceMotion ? 0 : 150, useNativeDriver: USE_NATIVE_DRIVER,
    }).start(),
  }), [close, drag, reduceMotion]);

  const translateY = Animated.add(
    progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }), drag,
  );
  const scrimOpacity = Animated.multiply(progress, drag.interpolate({
    inputRange: [0, Math.max(1, maxHeight)], outputRange: [1, 0], extrapolate: 'clamp',
  }));

  return (
    <Modal
      visible={presented} transparent animationType="none" onRequestClose={() => close()}
      statusBarTranslucent navigationBarTranslucent supportedOrientations={['portrait', 'landscape']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
        <Animated.View
          testID="sheet-scrim"
          style={[styles.backdrop, { backgroundColor: colors.overlay, opacity: scrimOpacity }]}>
          <Pressable
            style={StyleSheet.absoluteFill} onPress={() => close()} testID="sheet-backdrop"
            accessibilityRole="button" accessibilityLabel={t('common.close')}
          />
        </Animated.View>
        <Animated.View
          testID="bottom-sheet"
          onLayout={(event) => { sheetHeight.current = event.nativeEvent.layout.height; }}
          style={[styles.sheet, {
            backgroundColor: colors.surface, maxHeight,
            paddingBottom: Math.max(keyboardVisible ? 0 : insets.bottom, spacing.sm) + spacing.md,
            transform: [{ translateY }],
          }, Platform.OS === 'web' && styles.webHeight]}
          accessibilityViewIsModal aria-modal role="dialog" aria-label={title ?? t('common.close')}>
          <View testID="sheet-drag-handle" style={styles.dragArea} {...pan.panHandlers}>
            <View style={[styles.handle, { backgroundColor: colors.textSecondary }]} />
          </View>
          {title !== undefined && (
            <View style={styles.header}>
              <AppText variant="heading" style={styles.title}>{title}</AppText>
              <IconButton icon="close" onPress={() => close()} accessibilityLabel={t('common.close')} />
            </View>
          )}
          {scrollable ? (
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} {...scrollKeyboardDismiss}
              keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === 'web' ? 'none' : 'on-drag'} bounces={false}>
              {children}
            </ScrollView>
          ) : children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, justifyContent: 'flex-end', alignItems: 'center',
    ...Platform.select({ web: {
      position: 'fixed', top: 'var(--app-top, 0px)', left: 0, right: 0, width: '100%',
      height: 'var(--app-height, var(--app-viewport-height, 100dvh))',
      paddingLeft: 'env(safe-area-inset-left, 0px)', paddingRight: 'env(safe-area-inset-right, 0px)',
    } as object, default: {} }),
  },
  backdrop: { ...StyleSheet.absoluteFill },
  sheet: {
    width: '100%', maxWidth: sizes.maxContentWidth,
    borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card,
    paddingHorizontal: spacing.xl, paddingTop: spacing.xs, gap: spacing.md,
  },
  dragArea: {
    minHeight: sizes.tapTarget, alignItems: 'center', justifyContent: 'center',
    marginHorizontal: -spacing.xl, marginBottom: -spacing.md,
    ...Platform.select({ web: { touchAction: 'none', cursor: 'grab' } as object, default: {} }),
  },
  handle: { width: 36, height: 5, borderRadius: radius.pill, opacity: 0.5 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1 },
  scroll: { flexShrink: 1 },
  content: { gap: spacing.lg },
  webHeight: { maxHeight: 'min(92dvh, calc(var(--app-height, var(--app-viewport-height, 100dvh)) - env(safe-area-inset-top, 0px) - 12px))' } as object,
});
