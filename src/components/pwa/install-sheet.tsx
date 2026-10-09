import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { usePwaInstall } from '@/lib/pwa-install';
import { colors, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface InstallSheetProps {
  visible: boolean;
  onClose: () => void;
}

type IconName = ComponentProps<typeof Ionicons>['name'];

const BENEFITS: readonly { icon: IconName; text: string }[] = [
  { icon: 'flash-outline', text: 'Швидкий запуск з головного екрана' },
  { icon: 'browsers-outline', text: 'Окреме вікно без панелі браузера' },
  { icon: 'notifications-outline', text: 'Сповіщення на підтримуваних пристроях' },
];

function Step({ index, children }: { index: number; children: string }) {
  const { colors } = useTheme();

  return (
    <View style={styles.step}>
      <View style={[styles.stepIndex, { backgroundColor: colors.brandSubtle }]}>
        <AppText variant="caption" color="brand">
          {index}
        </AppText>
      </View>
      <AppText variant="body" style={styles.stepText}>
        {children}
      </AppText>
    </View>
  );
}

/** S23. Додати на головний екран: інструкції залежать від середовища. */
export function InstallSheet({ visible, onClose }: InstallSheetProps) {
  const { colors } = useTheme();
  const { platform, canPromptNatively, promptInstall } = usePwaInstall();

  const handleNativeInstall = async () => {
    const outcome = await promptInstall();
    if (outcome !== 'dismissed') onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Додати на головний екран">
      <View style={styles.benefits}>
        {BENEFITS.map((benefit) => (
          <View key={benefit.text} style={styles.benefit}>
            <Ionicons name={benefit.icon} size={20} color={colors.brand} />
            <AppText variant="body">{benefit.text}</AppText>
          </View>
        ))}
      </View>

      {canPromptNatively ? (
        <Button label="Встановити" icon="download-outline" onPress={handleNativeInstall} />
      ) : platform === 'ios' ? (
        <View style={[styles.steps, { backgroundColor: colors.surfaceMuted }]}>
          <Step index={1}>Натисни «Поділитися» в меню Safari.</Step>
          <Step index={2}>Обери «На початковий екран».</Step>
          <Step index={3}>Залиш увімкненим «Відкривати як вебпрограму» і натисни «Додати».</Step>
        </View>
      ) : platform === 'in-app-browser' ? (
        <View style={[styles.steps, { backgroundColor: colors.surfaceMuted }]}>
          <Step index={1}>Відкрий меню цього застосунку (⋯).</Step>
          <Step index={2}>Обери «Відкрити в браузері» — Safari або Chrome.</Step>
          <Step index={3}>Там додай Flirter на головний екран.</Step>
        </View>
      ) : (
        <View style={[styles.steps, { backgroundColor: colors.surfaceMuted }]}>
          <Step index={1}>Відкрий меню браузера (⋮).</Step>
          <Step index={2}>Обери «Встановити застосунок» або «Додати на головний екран».</Step>
        </View>
      )}

      <Button label="Не зараз" variant="secondary" onPress={onClose} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  benefits: {
    gap: spacing.md,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  steps: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
  step: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  stepIndex: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    flex: 1,
  },
});
