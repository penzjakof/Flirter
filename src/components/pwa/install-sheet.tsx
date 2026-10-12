import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
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

interface BenefitItem {
  icon: IconName;
  key: 'quick_launch' | 'standalone' | 'notifications';
}

const BENEFIT_ITEMS: readonly BenefitItem[] = [
  { icon: 'flash-outline', key: 'quick_launch' },
  { icon: 'browsers-outline', key: 'standalone' },
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
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { platform, canPromptNatively, promptInstall } = usePwaInstall();

  const handleNativeInstall = async () => {
    const outcome = await promptInstall();
    if (outcome !== 'dismissed') onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('pwa_install.title')}>
      <View style={styles.benefits}>
        {BENEFIT_ITEMS.map((benefit) => (
          <View key={benefit.key} style={styles.benefit}>
            <Ionicons name={benefit.icon} size={20} color={colors.brand} />
            <AppText variant="body">{t(`pwa_install.benefits.${benefit.key}`)}</AppText>
          </View>
        ))}
      </View>

      {canPromptNatively ? (
        <Button label={t('pwa_install.install_button')} icon="download-outline" onPress={handleNativeInstall} />
      ) : platform === 'ios' ? (
        <View style={[styles.steps, { backgroundColor: colors.surfaceMuted }]}>
          <Step index={1}>{t('pwa_install.ios_steps.step_1')}</Step>
          <Step index={2}>{t('pwa_install.ios_steps.step_2')}</Step>
          <Step index={3}>{t('pwa_install.ios_steps.step_3')}</Step>
        </View>
      ) : platform === 'in-app-browser' ? (
        <View style={[styles.steps, { backgroundColor: colors.surfaceMuted }]}>
          <Step index={1}>{t('pwa_install.in_app_steps.step_1')}</Step>
          <Step index={2}>{t('pwa_install.in_app_steps.step_2')}</Step>
          <Step index={3}>{t('pwa_install.in_app_steps.step_3')}</Step>
        </View>
      ) : (
        <View style={[styles.steps, { backgroundColor: colors.surfaceMuted }]}>
          <Step index={1}>{t('pwa_install.default_steps.step_1')}</Step>
          <Step index={2}>{t('pwa_install.default_steps.step_2')}</Step>
        </View>
      )}

      <Button label={t('pwa_install.not_now_button')} variant="secondary" onPress={onClose} />
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
