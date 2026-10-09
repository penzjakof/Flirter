import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const DOT_SIZE = 7;
const DOT_DELAYS = [0, 150, 300] as const;

function Dot({ delay }: { delay: number }) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.3);
  const isReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isReducedMotion) {
      opacity.set(0.7);
      return;
    }
    opacity.set(withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 300 }), withTiming(0.3, { duration: 300 })), -1)));
  }, [delay, isReducedMotion, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return <Animated.View style={[styles.dot, { backgroundColor: colors.textSecondary }, style]} />;
}

/** Індикатор «персонаж готує відповідь». */
export function TypingIndicator() {
  const { colors } = useTheme();

  return (
    <View style={styles.row} accessibilityLabel="Персонаж друкує" accessibilityLiveRegion="polite">
      <View style={[styles.bubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {DOT_DELAYS.map((delay) => (
          <Dot key={delay} delay={delay} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    flexDirection: 'row',
  },
  bubble: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.bubble,
    borderBottomLeftRadius: radius.sm - 2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.textSecondary,
  },
});
