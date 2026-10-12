import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/ui/glass-surface';
import { useKeyboardVisible } from '@/hooks/use-web-viewport';
import { MESSAGE_MAX_LENGTH } from '@/store/chats-store';
import { colors, radius, sizes, spacing, typography } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Shared touch target for the input and send control. */
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
  isBusy: boolean;
}

/**
 * Composer (S13) у стилі Liquid Glass:
 * поле-«пігулка» та кнопка надсилання. Медіа-дії з’являться після інтеграції сервера.
 * Поле росте до 4 рядків, кнопки лишаються притиснутими донизу.
 */
export function Composer({ value, onChangeText, onSend, isBusy }: ComposerProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();
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
    <View testID="chat-composer" style={[styles.container, { paddingBottom: Math.max(keyboardVisible ? 0 : insets.bottom, spacing.sm) }]}>
      <GlassSurface testID="chat-input-surface" style={styles.inputSurface}>
        <TextInput
          testID="chat-input"
          value={value}
          onChangeText={onChangeText}
          onContentSizeChange={handleContentSizeChange}
          placeholder={t('chat.composer.placeholder')}
          placeholderTextColor={colors.textSecondary}
          multiline
          // Web: textarea за замовчуванням має 2 рядки — фіксуємо один (висоту далі веде onContentSizeChange).
          {...WEB_SINGLE_ROW_PROPS}
          maxLength={MESSAGE_MAX_LENGTH}
          onKeyPress={handleKeyPress}
          accessibilityLabel={t('chat.composer.input_accessibility')}
          style={[styles.input, { height: effectiveTextHeight, color: colors.textPrimary }]}
          submitBehavior="newline"
        />
      </GlassSurface>

      <Pressable
          testID="chat-send"
          onPress={onSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel={t('chat.composer.send_accessibility')}
          accessibilityState={{ disabled: !canSend }}
          style={({ pressed }) => [styles.sendButton, { backgroundColor: pressed ? colors.brandPressed : colors.brand }, !canSend && styles.sendDisabled]}>
          <Ionicons name="arrow-up" size={sizes.icon} color={colors.textOnBrand} />
      </Pressable>
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
});
