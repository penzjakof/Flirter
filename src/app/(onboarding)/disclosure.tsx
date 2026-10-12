import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OnboardingGate } from '@/components/onboarding/onboarding-gate';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useSessionStore } from '@/store/session-store';
import { colors, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface FactDefinition {
  icon: IconName;
  key: 'profiles' | 'ai_content' | 'no_real_people' | 'no_offline';
}

const FACT_DEFINITIONS: readonly FactDefinition[] = [
  { icon: 'sparkles-outline', key: 'profiles' },
  { icon: 'image-outline', key: 'ai_content' },
  { icon: 'people-outline', key: 'no_real_people' },
  { icon: 'location-outline', key: 'no_offline' },
];

/** Мок запису згод з версіями. У продакшені — POST /consents; Discover відкривається лише після успіху. */
async function persistConsents(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));
}

/** S06. AI disclosure та умови: два окремі незаповнені checkbox. */
function DisclosureContent() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const acceptDisclosure = useSessionStore((state) => state.acceptDisclosure);

  const [isAiAcknowledged, setIsAiAcknowledged] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await persistConsents();
      // Після запису згод guard у кореневому layout сам переведе в Discover.
      acceptDisclosure();
    } catch {
      setError(t('onboarding.disclosure.error_save'));
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      stepNumber={5}
      title={t('onboarding.disclosure.title')}
      footer={
        <Button
          label={t('onboarding.disclosure.submit_button')}
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!isAiAcknowledged || !isTermsAccepted}
          testID="disclosure-submit"
        />
      }>
      <View style={[styles.facts, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {FACT_DEFINITIONS.map((fact) => (
          <View key={fact.key} style={styles.factRow}>
            <View style={[styles.factIcon, { backgroundColor: colors.brandSubtle }]}>
              <Ionicons name={fact.icon} size={20} color={colors.brand} />
            </View>
            <AppText variant="body" style={styles.factText}>
              {t(`onboarding.disclosure.facts.${fact.key}`)}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.consents}>
        <Checkbox
          testID="consent-ai"
          checked={isAiAcknowledged}
          onChange={setIsAiAcknowledged}
          accessibilityLabel={t('onboarding.disclosure.consents.ai_label')}>
          <AppText variant="body">{t('onboarding.disclosure.consents.ai_text')}</AppText>
        </Checkbox>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Checkbox
          testID="consent-terms"
          checked={isTermsAccepted}
          onChange={setIsTermsAccepted}
          accessibilityLabel={t('onboarding.disclosure.consents.terms_label')}>
          <AppText variant="body">
            {t('onboarding.disclosure.consents.terms_prefix')}
            <Link href="/legal/terms">
              <AppText variant="bodyStrong" color="brand">
                {t('onboarding.disclosure.consents.terms_link')}
              </AppText>
            </Link>
            {t('onboarding.disclosure.consents.and')}
            <Link href="/legal/privacy">
              <AppText variant="bodyStrong" color="brand">
                {t('onboarding.disclosure.consents.privacy_link')}
              </AppText>
            </Link>
            {t('onboarding.disclosure.consents.terms_suffix')}
          </AppText>
        </Checkbox>
      </View>

      {error && (
        <AppText variant="secondary" color="danger" accessibilityRole="alert">
          ⚠︎ {error}
        </AppText>
      )}
    </OnboardingLayout>
  );
}

export default function DisclosureScreen() {
  return (
    <OnboardingGate route="/disclosure">
      <DisclosureContent />
    </OnboardingGate>
  );
}

const styles = StyleSheet.create({
  facts: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  factIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factText: {
    flex: 1,
  },
  consents: {
    gap: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
});
