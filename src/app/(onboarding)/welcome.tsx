import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { CHARACTERS } from '@/data/characters';
import { getNextOnboardingRoute, useSessionStore } from '@/store/session-store';
import { colors, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const COLLAGE = CHARACTERS.slice(0, 3);

/** S01. Welcome: за кілька секунд пояснити продукт і дати почати. */
export default function WelcomeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const setAuthMode = useSessionStore((state) => state.setAuthMode);

  const handleStart = () => {
    setAuthMode('signup');
    const nextRoute = getNextOnboardingRoute({ ...useSessionStore.getState(), authMode: 'signup' }) ?? '/age';
    router.push(nextRoute);
  };

  const handleLogin = () => {
    setAuthMode('login');
    router.push('/sign-in');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.collage} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Image source={COLLAGE[0].photos[0]} style={[styles.photo, styles.photoMain, { backgroundColor: colors.surfaceMuted }]} contentFit="cover" priority="high" />
        <View style={styles.photoColumn}>
          <Image source={COLLAGE[1].photos[0]} style={[styles.photo, styles.photoSmall, { backgroundColor: colors.surfaceMuted }]} contentFit="cover" />
          <Image source={COLLAGE[2].photos[0]} style={[styles.photo, styles.photoSmall, { backgroundColor: colors.surfaceMuted }]} contentFit="cover" />
        </View>
        <LinearGradient colors={[colors.fadeTransparent, colors.background]} style={styles.collageFade} pointerEvents="none" />
        <View style={styles.ageBadge}>
          <AppText variant="bodyStrong" color="textOnBrand">
            {t('common.age_badge')}
          </AppText>
        </View>
      </View>

      <View style={styles.content}>
        <BrandMark size={36} />
        <View style={styles.copy}>
          <AppText variant="hero" accessibilityRole="header">
            {t('onboarding.welcome.hero_title')}
          </AppText>
          <AppText variant="body" color="textSecondary">
            {t('onboarding.welcome.hero_subtitle')}
          </AppText>
        </View>

        <View style={styles.actions}>
          <Button label={t('onboarding.welcome.start_button')} onPress={handleStart} testID="welcome-start" />
          <Button label={t('onboarding.welcome.login_button')} variant="secondary" onPress={handleLogin} testID="welcome-login" />
        </View>

        <AppText variant="caption" color="textSecondary">{t('common.demo_notice')}</AppText>

        <View style={styles.legalRow}>
          <Link href="/legal/terms" style={styles.legalLink}>
            <AppText variant="secondary" color="textSecondary">
              {t('common.terms')}
            </AppText>
          </Link>
          <AppText variant="secondary" color="textSecondary">
            ·
          </AppText>
          <Link href="/legal/privacy" style={styles.legalLink}>
            <AppText variant="secondary" color="textSecondary">
              {t('common.privacy')}
            </AppText>
          </Link>
          <AppText variant="secondary" color="textSecondary">
            ·
          </AppText>
          <Link href="/legal/ai" style={styles.legalLink}>
            <AppText variant="secondary" color="textSecondary">
              {t('common.about_ai')}
            </AppText>
          </Link>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: { flexGrow: 1 },
  collage: {
    flex: 1,
    minHeight: 220,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  photo: {
    borderRadius: radius.card,
    backgroundColor: colors.surfaceMuted,
  },
  photoMain: {
    flex: 1.25,
  },
  photoColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  photoSmall: {
    flex: 1,
  },
  collageFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },
  ageBadge: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.xxl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.mediaScrim,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.xl,
  },
  copy: {
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.md,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legalLink: {
    paddingVertical: spacing.xs,
  },
});
