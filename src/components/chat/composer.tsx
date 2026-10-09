import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputContentSizeChangeEventData,
  type TextInputKeyPressEventData,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { GlassSurface } from '@/components/ui/glass-surface';
import { MESSAGE_MAX_LENGTH } from '@/store/chats-store';
import { colors, radius, sizes, spacing, typography } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Висота всіх трьох елементів в одному рядку — як у Telegram. */
const CONTROL_SIZE = sizes.tapTarget;
const LINE_HEIGHT = typography.body.lineHeight;
const MAX_VISIBLE_LINES = 4;
/** Вертикальний відступ поля, щоб один рядок + рамка скла (1 px) давали рівно CONTROL_SIZE. */
const GLASS_BORDER_WIDTH = 1;
const INPUT_VERTICAL_PADDING = (CONTROL_SIZE - LINE_HEIGHT - GLASS_BORDER_WIDTH * 2) / 2;
/** `rows` є лише в react-native-web (у типах RN його немає). */
const WEB_SINGLE_ROW_PROPS = (Platform.OS === 'web' ? { rows: 1 } : {}) as object;

function hasFinePointer(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(pointer: fine)').matches;
}

/** Висота тексту в межах 1…4 рядків (поза межами — внутрішній скрол). */
function clampTextHeight(contentHeight: number): number {
  return Math.min(Math.max(contentHeight, LINE_HEIGHT), LINE_HEIGHT * MAX_VISIBLE_LINES);
}

interface ComposerProps {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  onAttachPhoto: () => void;
  onRecordVoice: () => void;
  isBusy: boolean;
}

interface GlassRoundButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  testID: string;
}

const SPRING_CONFIG = { damping: 15, stiffness: 300, mass: 0.8 };

import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Кругла скляна кнопка composer’а (прикріплення / голосове). */
function GlassRoundButton({ icon, onPress, accessibilityLabel, testID }: GlassRoundButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Animated.View style={[styles.roundSurface, animatedStyle]}>
      <GlassSurface style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}>
        <Pressable
          testID={testID}
          onPress={onPress}
          onPressIn={() => scale.set(withSpring(1.15, SPRING_CONFIG))}
          onPressOut={() => scale.set(withSpring(1, SPRING_CONFIG))}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          style={({ pressed }) => [styles.roundPressable, pressed && styles.pressed]}>
          <Ionicons name={icon} size={sizes.icon + 2} color={colors.textSecondary} />
        </Pressable>
      </GlassSurface>
    </Animated.View>
  );
}

/**
 * Composer (S13) у стилі Liquid Glass: три окремі плаваючі елементи однієї висоти —
 * кнопка фото, поле-«пігулка», кнопка голосового (з текстом замінюється на стрілку надсилання).
 * Поле росте до 4 рядків, кнопки лишаються притиснутими донизу.
 */
export function Composer({ value, onChangeText, onSend, onAttachPhoto, onRecordVoice, isBusy }: ComposerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [textHeight, setTextHeight] = useState<number>(LINE_HEIGHT);
  const hasText = value.trim().length > 0;
  const canSend = hasText && !isBusy;

  // Desktop (точний вказівник): Enter — надіслати, Shift+Enter — новий рядок.
  // На сенсорних пристроях Enter лишається новим рядком.
  const handleKeyPress = (event: NativeSyntheticEvent<TextInputKeyPressEventData & { shiftKey?: boolean }>) => {
    if (!hasFinePointer()) return;
    if (event.nativeEvent.key === 'Enter' && !event.nativeEvent.shiftKey) {
      event.preventDefault();
      if (canSend) onSend();
    }
  };

  const handleContentSizeChange = (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
    setTextHeight(clampTextHeight(event.nativeEvent.contentSize.height));
  };

  // Після надсилання поле порожнє — повертаємо висоту в один рядок.
  const effectiveTextHeight = value.length === 0 ? LINE_HEIGHT : textHeight;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <GlassRoundButton icon="attach" onPress={onAttachPhoto} accessibilityLabel="Прикріпити фото" testID="chat-attach" />

      <GlassSurface style={styles.inputSurface}>
        <TextInput
          testID="chat-input"
          value={value}
          onChangeText={onChangeText}
          onContentSizeChange={handleContentSizeChange}
          placeholder="Повідомлення"
          placeholderTextColor={colors.textSecondary}
          multiline
          // Web: textarea за замовчуванням має 2 рядки — фіксуємо один (висоту далі веде onContentSizeChange).
          {...WEB_SINGLE_ROW_PROPS}
          maxLength={MESSAGE_MAX_LENGTH}
          onKeyPress={handleKeyPress}
          accessibilityLabel="Текст повідомлення"
          style={[styles.input, { height: effectiveTextHeight, color: colors.textPrimary }]}
          submitBehavior="newline"
        />
      </GlassSurface>

      {hasText ? (
        <Pressable
          testID="chat-send"
          onPress={onSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Надіслати"
          accessibilityState={{ disabled: !canSend }}
          style={({ pressed }) => [styles.sendButton, { backgroundColor: pressed ? colors.brandPressed : colors.brand }, !canSend && styles.sendDisabled]}>
          <Ionicons name="arrow-up" size={sizes.icon} color={colors.textOnBrand} />
        </Pressable>
      ) : (
        <GlassRoundButton icon="mic-outline" onPress={onRecordVoice} accessibilityLabel="Записати голосове повідомлення" testID="chat-voice" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    pointerEvents: 'box-none',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  roundSurface: {
    width: CONTROL_SIZE,
    height: CONTROL_SIZE,
    borderRadius: radius.pill,
  },
  roundPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  inputSurface: {
    flex: 1,
    minHeight: CONTROL_SIZE,
    borderRadius: CONTROL_SIZE / 2,
    paddingHorizontal: spacing.lg,
    paddingVertical: INPUT_VERTICAL_PADDING,
    justifyContent: 'center',
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
    textAlignVertical: 'top',
    ...Platform.select({ web: { outlineStyle: 'none', resize: 'none' } as object, default: {} }),
  },
  sendButton: {
    width: CONTROL_SIZE,
    height: CONTROL_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sendPressed: {
    backgroundColor: colors.brandPressed,
  },
});
