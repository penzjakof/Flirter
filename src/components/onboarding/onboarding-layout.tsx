import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { IconButton } from '@/components/ui/icon-button';
import { colors, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';
import { useScrollKeyboardDismiss } from '@/hooks/use-scroll-keyboard-dismiss';

const TOTAL_STEPS = 5;

interface OnboardingLayoutProps {
  /** Номер кроку 1..5 для прогрес-бару. */
  stepNumber: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Основна дія — завжди в межах viewport, над клавіатурою. */
  footer: ReactNode;
  onBack?: () => void;
}

export function OnboardingLayout({ stepNumber, title, subtitle, children, footer, onBack }: OnboardingLayoutProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const scrollKeyboardDismiss = useScrollKeyboardDismiss();
  const handleBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/welcome')));
  const progress = Math.min(1, stepNumber / TOTAL_STEPS);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <IconButton icon="chevron-back" onPress={handleBack} accessibilityLabel={t('common.back')} />
          <View
            style={[styles.progressTrack, { backgroundColor: colors.border }]}
            accessibilityRole="progressbar"
            accessibilityLabel={t('onboarding.layout.step_progress', { step: stepNumber, total: TOTAL_STEPS })}
            accessibilityValue={{ min: 0, max: TOTAL_STEPS, now: stepNumber }}
            aria-valuemin={0} aria-valuemax={TOTAL_STEPS} aria-valuenow={stepNumber}>
            <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.brand }]} />
          </View>
          <View style={styles.topBarSpacer} />
        </View>

        <ScrollView
          {...scrollKeyboardDismiss}
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'web' ? 'none' : Platform.OS === 'ios' ? 'interactive' : 'on-drag'}>
          <View style={styles.heading}>
            <AppText variant="title" accessibilityRole="header">
              {title}
            </AppText>
            {subtitle && (
              <AppText variant="body" color="textSecondary">
                {subtitle}
              </AppText>
            )}
          </View>
          {children}
          <View style={styles.footer}>{footer}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
    height: 56,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
  },
  topBarSpacer: {
    width: 44,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  heading: {
    gap: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
});
