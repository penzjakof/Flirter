import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { resolveDeviceLanguage } from '@/i18n';
import {
  LANGUAGE_REGISTRY,
  SUPPORTED_LANGUAGES,
  isRtlLanguage,
  type SupportedLanguage,
} from '@/i18n/types';
import {
  useLanguageStore,
  type LanguageMode,
} from '@/store/language-store';
import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface LanguageSelectionSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Модальний вибір мови: System Default + 10 підтримуваних мов.
 * Відображає прапорець, рідну назву (autonym), назву англійською, код та радіо-індикатор.
 * Обробляє повідомлення про перезавантаження інтерфейсу у разі зміни RTL на нативних платформах.
 */
export function LanguageSelectionSheet({ visible, onClose }: LanguageSelectionSheetProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const currentMode = useLanguageStore((state) => state.mode);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const [showReloadDialog, setShowReloadDialog] = useState(false);

  const handleSelect = async (mode: LanguageMode) => {
    const prevIsRTL = useLanguageStore.getState().isRTL;
    const resolvedLang = mode === 'system' ? resolveDeviceLanguage() : mode;
    const nextIsRTL = isRtlLanguage(resolvedLang);

    await setLanguage(mode);

    if (Platform.OS !== 'web' && prevIsRTL !== nextIsRTL) {
      setShowReloadDialog(true);
    } else {
      onClose();
    }
  };

  const handleReload = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Updates = require('expo-updates');
      if (Updates && typeof Updates.reloadAsync === 'function') {
        await Updates.reloadAsync();
        return;
      }
    } catch {
      // Ігноруємо, якщо модуль недоступний у даному середовищі
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.reload();
    }

    setShowReloadDialog(false);
    onClose();
  };

  if (showReloadDialog) {
    return (
      <BottomSheet
        visible={visible}
        onClose={() => {
          setShowReloadDialog(false);
          onClose();
        }}
        title={t('profile.language_modal.title')}>
        <View style={styles.reloadContent}>
          <View style={[styles.reloadIconBox, { backgroundColor: colors.brandSubtle }]}>
            <Ionicons name="swap-horizontal" size={32} color={colors.brand} />
          </View>
          <AppText variant="body" color="textSecondary" align="center">
            {t('profile.language_modal.restart_notice')}
          </AppText>
          <View style={styles.reloadActions}>
            <Button
              label={t('profile.language_modal.restart_button')}
              onPress={handleReload}
              testID="language-reload-confirm"
            />
            <Button
              label={t('profile.language_modal.cancel_button')}
              variant="secondary"
              onPress={() => {
                setShowReloadDialog(false);
                onClose();
              }}
              testID="language-reload-cancel"
            />
          </View>
        </View>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('profile.language_modal.title')} scrollable={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}>
        {/* Опція: Як у системі */}
        <Pressable
          testID="language-option-system"
          onPress={() => handleSelect('system')}
          accessibilityRole="radio"
          accessibilityState={{ selected: currentMode === 'system', checked: currentMode === 'system' }}
          aria-checked={currentMode === 'system'}
          style={({ pressed }) => [
            styles.row,
            { backgroundColor: currentMode === 'system' ? colors.surfaceMuted : colors.surface },
            pressed && { backgroundColor: colors.surfaceMuted },
          ]}>
          <View style={[styles.flagBadge, { backgroundColor: colors.surfaceMuted }]}>
            <Ionicons name="phone-portrait-outline" size={20} color={colors.textPrimary} />
          </View>
          <View style={styles.textContainer}>
            <AppText
              variant="bodyStrong"
              color={currentMode === 'system' ? 'brand' : 'textPrimary'}>
              {t('profile.theme_options.system')}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              System Default
            </AppText>
          </View>
          <View style={styles.selectionIndicator}>
            {currentMode === 'system' ? (
              <Ionicons name="checkmark-circle" size={22} color={colors.brand} />
            ) : (
              <View style={[styles.radioCircle, { borderColor: colors.border }]} />
            )}
          </View>
        </Pressable>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* 10 мов із LANGUAGE_REGISTRY */}
        {SUPPORTED_LANGUAGES.map((langCode: SupportedLanguage, index: number) => {
          const info = LANGUAGE_REGISTRY[langCode];
          const isSelected = currentMode === langCode;

          return (
            <View key={langCode}>
              {index > 0 && <View style={[styles.itemDivider, { backgroundColor: colors.border }]} />}
              <Pressable
                testID={`language-option-${langCode}`}
                onPress={() => handleSelect(langCode)}
                accessibilityRole="radio"
                accessibilityLabel={`${info.nativeName} (${info.name})`}
                accessibilityState={{ selected: isSelected, checked: isSelected }}
                aria-checked={isSelected}
                style={({ pressed }) => [
                  styles.row,
                  { backgroundColor: isSelected ? colors.surfaceMuted : colors.surface },
                  pressed && { backgroundColor: colors.surfaceMuted },
                ]}>
                <View style={[styles.flagBadge, { backgroundColor: colors.surfaceMuted }]}>
                  <AppText style={styles.flagEmoji}>{info.flag}</AppText>
                </View>
                <View style={styles.textContainer}>
                  <AppText
                    variant="bodyStrong"
                    color={isSelected ? 'brand' : 'textPrimary'}>
                    {info.nativeName}
                  </AppText>
                  <AppText variant="caption" color="textSecondary">
                    {info.name} • {info.code.toUpperCase()}
                  </AppText>
                </View>
                <View style={styles.selectionIndicator}>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.brand} />
                  ) : (
                    <View style={[styles.radioCircle, { borderColor: colors.border }]} />
                  )}
                </View>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexShrink: 1,
    maxHeight: 480,
  },
  list: {
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  flagBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  selectionIndicator: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  divider: {
    height: 1,
    marginVertical: spacing.xs,
  },
  itemDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 1,
  },
  reloadContent: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  reloadIconBox: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reloadActions: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
