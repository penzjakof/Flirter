import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/app-text';
import { radius, sizes, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface QuickReplyProps {
  reply: string;
  disabled: boolean;
  reduceMotion: boolean;
  onSend: (reply: string) => void;
}

export function QuickReply({ reply, disabled, reduceMotion, onSend }: QuickReplyProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reduceMotion ? 1 : scale.get() }],
  }));

  return (
    <AnimatedPressable
      testID="chat-quick-reply"
      disabled={disabled}
      onPressIn={() => { if (!reduceMotion) scale.set(withTiming(0.96, { duration: 90 })); }}
      onPressOut={() => { scale.set(reduceMotion ? 1 : withSpring(1, { damping: 18, stiffness: 260 })); }}
      onPress={() => onSend(reply)}
      accessibilityRole="button"
      accessibilityLabel={t('chat.send_suggestion_accessibility', { reply })}
      accessibilityState={{ disabled }}
      style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.brand }, animatedStyle]}>
      {({ pressed }) => (
        <AppText variant="secondary" color="brand" style={[styles.text, pressed && { opacity: 0.65 }]}>
          {reply}
        </AppText>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    maxWidth: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    minHeight: sizes.tapTarget,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  text: {
    fontWeight: '500',
  },
});
