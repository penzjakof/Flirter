import { Link, router } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, StyleSheet, View, type TextInput } from 'react-native';

import { OnboardingGate } from '@/components/onboarding/onboarding-gate';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { sanitizeDigits, validateBirthDate } from '@/lib/validation';
import { getNextOnboardingRoute, useSessionStore } from '@/store/session-store';
import { colors, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const AGE_ERROR_KEYS = {
  incomplete: 'onboarding.age.errors.incomplete',
  invalid: 'onboarding.age.errors.invalid',
  future: 'onboarding.age.errors.future',
  unrealistic: 'onboarding.age.errors.unrealistic',
} as const;

type AgeErrorReason = keyof typeof AGE_ERROR_KEYS;

/** S02. Віковий контроль: ручне введення без prefill і без нескінченного скролу років. */
function AgeScreenContent() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const ageRestricted = useSessionStore((state) => state.ageRestricted);
  const confirmBirthDate = useSessionStore((state) => state.confirmBirthDate);
  const markUnderage = useSessionStore((state) => state.markUnderage);

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [errorKey, setErrorKey] = useState<AgeErrorReason | null>(null);

  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  if (ageRestricted) return <UnderageState />;

  const handleSubmit = async (dateParts = { day, month, year }) => {
    const result = validateBirthDate(dateParts.day, dateParts.month, dateParts.year);
    if (result.ok) {
      confirmBirthDate(result.isoDate);
      Keyboard.dismiss();
      await new Promise((resolve) => setTimeout(resolve, 180));
      router.push(getNextOnboardingRoute(useSessionStore.getState()) ?? '/');
      return;
    }
    if (result.reason === 'underage') {
      markUnderage();
      return;
    }
    setErrorKey(result.reason);
  };

  const isComplete = day.length > 0 && month.length > 0 && year.length === 4;

  return (
    <OnboardingLayout
      stepNumber={1}
      title={t('onboarding.age.title')}
      subtitle={t('onboarding.age.subtitle')}
      footer={
        <Button
          label={t('common.continue')}
          onPress={handleSubmit}
          disabled={!isComplete}
          testID="age-submit"
        />
      }>
      <View style={styles.dateRow} accessibilityRole="none" accessibilityLabel={t('onboarding.age.accessibility_label')}>
        <View style={styles.dayField}>
          <TextField
            testID="age-day"
            label={t('onboarding.age.day_label')}
            placeholder={t('onboarding.age.day_placeholder')}
            value={day}
            center
            keyboardType="number-pad"
            inputMode="numeric"
            autoComplete="birthdate-day"
            maxLength={2}
            onChangeText={(value) => {
              const digits = sanitizeDigits(value, 2);
              setDay(digits);
              setErrorKey(null);
              if (digits.length === 2) monthRef.current?.focus();
            }}
          />
        </View>
        <View style={styles.dayField}>
          <TextField
            testID="age-month"
            ref={monthRef}
            label={t('onboarding.age.month_label')}
            placeholder={t('onboarding.age.month_placeholder')}
            value={month}
            center
            keyboardType="number-pad"
            inputMode="numeric"
            autoComplete="birthdate-month"
            maxLength={2}
            onChangeText={(value) => {
              const digits = sanitizeDigits(value, 2);
              setMonth(digits);
              setErrorKey(null);
              if (digits.length === 2) yearRef.current?.focus();
            }}
          />
        </View>
        <View style={styles.yearField}>
          <TextField
            testID="age-year"
            ref={yearRef}
            label={t('onboarding.age.year_label')}
            placeholder={t('onboarding.age.year_placeholder')}
            value={year}
            center
            keyboardType="number-pad"
            inputMode="numeric"
            autoComplete="birthdate-year"
            maxLength={4}
            returnKeyType="done"
            onSubmitEditing={() => void handleSubmit()}
            onChangeText={(value) => {
              const digits = sanitizeDigits(value, 4);
              setYear(digits);
              setErrorKey(null);
              if (digits.length === 4) void handleSubmit({ day, month, year: digits });
            }}
          />
        </View>
      </View>

      {errorKey && (
        <AppText variant="secondary" color="danger" accessibilityRole="alert" accessibilityLiveRegion="polite">
          ⚠︎ {t(AGE_ERROR_KEYS[errorKey])}
        </AppText>
      )}

      <View style={[styles.privacyNote, { backgroundColor: colors.surfaceMuted }]}>
        <AppText variant="secondary" color="textSecondary">
          {t('onboarding.age.privacy_note_prefix')}
          <Link href="/legal/privacy">
            <AppText variant="secondary" color="brand">
              {t('onboarding.age.privacy_policy_link')}
            </AppText>
          </Link>
          {t('onboarding.age.privacy_note_suffix')}
        </AppText>
      </View>
    </OnboardingLayout>
  );
}

/** Нейтральний стан недоступності — без пропозиції змінити рік. */
function UnderageState() {
  const { t } = useTranslation();
  return (
    <OnboardingLayout
      stepNumber={1}
      title={t('onboarding.age.underage.title')}
      subtitle={t('onboarding.age.underage.subtitle')}
      onBack={() => router.replace('/welcome')}
      footer={
        <Button
          label={t('onboarding.age.underage.terms_button')}
          variant="secondary"
          onPress={() => router.push('/legal/terms')}
        />
      }>
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
