import { Link, router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View, type TextInput } from 'react-native';

import { OnboardingGate } from '@/components/onboarding/onboarding-gate';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { sanitizeDigits, validateBirthDate, type BirthDateValidation } from '@/lib/validation';
import { getNextOnboardingRoute, useSessionStore } from '@/store/session-store';
import { colors, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const ERROR_MESSAGES: Record<Exclude<BirthDateValidation, { ok: true }>['reason'], string | null> = {
  incomplete: 'Введи повну дату: день, місяць і рік.',
  invalid: 'Такої дати не існує. Перевір день і місяць.',
  future: 'Дата не може бути в майбутньому.',
  unrealistic: 'Перевір рік народження.',
  underage: null,
};

/** S02. Віковий контроль: ручне введення без prefill і без нескінченного скролу років. */
function AgeScreenContent() {
  const { colors } = useTheme();
  const ageRestricted = useSessionStore((state) => state.ageRestricted);
  const confirmBirthDate = useSessionStore((state) => state.confirmBirthDate);
  const markUnderage = useSessionStore((state) => state.markUnderage);

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState<string | null>(null);

  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  if (ageRestricted) return <UnderageState />;

  const handleSubmit = () => {
    const result = validateBirthDate(day, month, year);
    if (result.ok) {
      confirmBirthDate(result.isoDate);
      router.push(getNextOnboardingRoute(useSessionStore.getState()) ?? '/');
      return;
    }
    if (result.reason === 'underage') {
      markUnderage();
      return;
    }
    setError(ERROR_MESSAGES[result.reason]);
  };

  const isComplete = day.length > 0 && month.length > 0 && year.length === 4;

  return (
    <OnboardingLayout
      stepNumber={1}
      title="Сервіс для повнолітніх"
      subtitle="Вкажи дату народження. Її не буде видно персонажам чи іншим людям."
      footer={<Button label="Продовжити" onPress={handleSubmit} disabled={!isComplete} testID="age-submit" />}>
      <View style={styles.dateRow} accessibilityRole="none" accessibilityLabel="Дата народження">
        <View style={styles.dayField}>
          <TextField
            testID="age-day"
            label="День"
            placeholder="ДД"
            value={day}
            center
            keyboardType="number-pad"
            inputMode="numeric"
            autoComplete="birthdate-day"
            maxLength={2}
            onChangeText={(value) => {
              const digits = sanitizeDigits(value, 2);
              setDay(digits);
              setError(null);
              if (digits.length === 2) monthRef.current?.focus();
            }}
          />
        </View>
        <View style={styles.dayField}>
          <TextField
            testID="age-month"
            ref={monthRef}
            label="Місяць"
            placeholder="ММ"
            value={month}
            center
            keyboardType="number-pad"
            inputMode="numeric"
            autoComplete="birthdate-month"
            maxLength={2}
            onChangeText={(value) => {
              const digits = sanitizeDigits(value, 2);
              setMonth(digits);
              setError(null);
              if (digits.length === 2) yearRef.current?.focus();
            }}
          />
        </View>
        <View style={styles.yearField}>
          <TextField
            testID="age-year"
            ref={yearRef}
            label="Рік"
            placeholder="РРРР"
            value={year}
            center
            keyboardType="number-pad"
            inputMode="numeric"
            autoComplete="birthdate-year"
            maxLength={4}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            onChangeText={(value) => {
              setYear(sanitizeDigits(value, 4));
              setError(null);
            }}
          />
        </View>
      </View>

      {error && (
        <AppText variant="secondary" color="danger" accessibilityRole="alert" accessibilityLiveRegion="polite">
          ⚠︎ {error}
        </AppText>
      )}

      <View style={[styles.privacyNote, { backgroundColor: colors.surfaceMuted }]}>
        <AppText variant="secondary" color="textSecondary">
          Дата потрібна, щоб підтвердити, що тобі вже є 18. Деталі — у{' '}
          <Link href="/legal/privacy">
            <AppText variant="secondary" color="brand">
              Політиці приватності
            </AppText>
          </Link>
          .
        </AppText>
      </View>
    </OnboardingLayout>
  );
}

/** Нейтральний стан недоступності — без пропозиції змінити рік. */
function UnderageState() {
  return (
    <OnboardingLayout
      stepNumber={1}
      title="Сервіс недоступний"
      subtitle="Flirter доступний лише для повнолітніх користувачів. Дякуємо за розуміння."
      onBack={() => router.replace('/welcome')}
      footer={<Button label="Умови використання" variant="secondary" onPress={() => router.push('/legal/terms')} />}>
      <View />
    </OnboardingLayout>
  );
}

export default function AgeScreen() {
  return (
    <OnboardingGate route="/age">
      <AgeScreenContent />
    </OnboardingGate>
  );
}

const styles = StyleSheet.create({
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dayField: {
    flex: 1,
  },
  yearField: {
    flex: 1.5,
  },
  privacyNote: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
});
