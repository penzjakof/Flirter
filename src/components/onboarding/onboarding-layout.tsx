import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { IconButton } from '@/components/ui/icon-button';
import { colors, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

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
  const { colors } = useTheme();
  const handleBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/welcome')));
  const progress = Math.min(1, stepNumber / TOTAL_STEPS);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <IconButton icon="chevron-back" onPress={handleBack} accessibilityLabel="Назад" />
          <View
            style={[styles.progressTrack, { backgroundColor: colors.border }]}
            accessibilityRole="progressbar"
            accessibilityLabel={`Крок ${stepNumber} з ${TOTAL_STEPS}`}
            accessibilityValue={{ min: 0, max: TOTAL_STEPS, now: stepNumber }}>
            <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.brand }]} />
          </View>
          <View style={styles.topBarSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
        </ScrollView>

        <View style={styles.footer}>{footer}</View>
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
