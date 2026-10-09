import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { OnboardingGate } from '@/components/onboarding/onboarding-gate';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useSessionStore } from '@/store/session-store';
import { colors, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface DisclosureFact {
  icon: ComponentProps<typeof Ionicons>['name'];
  text: string;
}

const FACTS: readonly DisclosureFact[] = [
  { icon: 'sparkles-outline', text: 'Усі профілі — вигадані персонажі.' },
  { icon: 'image-outline', text: 'Фото, біографії та відповіді створені AI або сценаріями.' },
  { icon: 'people-outline', text: 'Тут немає реальних людей для знайомств.' },
  { icon: 'location-outline', text: 'Зустрітися офлайн неможливо.' },
];

/** Мок запису згод з версіями. У продакшені — POST /consents; Discover відкривається лише після успіху. */
async function persistConsents(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));
}

/** S06. AI disclosure та умови: два окремі незаповнені checkbox. */
function DisclosureContent() {
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
      setError('Не вдалося зберегти вибір. Відмітки збережено — спробуй ще раз.');
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      stepNumber={5}
      title="Це симулятор знайомств із AI"
      footer={
        <Button
          label="Перейти до знайомств"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!isAiAcknowledged || !isTermsAccepted}
          testID="disclosure-submit"
        />
      }>
      <View style={[styles.facts, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {FACTS.map((fact) => (
          <View key={fact.text} style={styles.factRow}>
            <View style={[styles.factIcon, { backgroundColor: colors.brandSubtle }]}>
              <Ionicons name={fact.icon} size={20} color={colors.brand} />
            </View>
            <AppText variant="body" style={styles.factText}>
              {fact.text}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.consents}>
        <Checkbox
          testID="consent-ai"
          checked={isAiAcknowledged}
          onChange={setIsAiAcknowledged}
          accessibilityLabel="Розумію, що спілкуюся з вигаданими AI-персонажами">
          <AppText variant="body">Розумію, що спілкуюся з вигаданими AI-персонажами, а не з реальними людьми.</AppText>
        </Checkbox>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Checkbox
          testID="consent-terms"
          checked={isTermsAccepted}
          onChange={setIsTermsAccepted}
          accessibilityLabel="Приймаю Умови використання та ознайомився з Політикою приватності">
          <AppText variant="body">
            Приймаю{' '}
            <Link href="/legal/terms">
              <AppText variant="bodyStrong" color="brand">
                Умови використання
              </AppText>
            </Link>{' '}
            та ознайомився з{' '}
            <Link href="/legal/privacy">
              <AppText variant="bodyStrong" color="brand">
                Політикою приватності
              </AppText>
            </Link>
            .
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
