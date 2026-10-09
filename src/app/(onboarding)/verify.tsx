import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { OnboardingGate } from '@/components/onboarding/onboarding-gate';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { OTP_LENGTH, sanitizeDigits } from '@/lib/validation';
import { getNextOnboardingRoute, useSessionStore } from '@/store/session-store';
import { colors, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const RESEND_COOLDOWN_SECONDS = 30;
/** Поки немає бекенду авторизації — показуємо підказку для демо. */
const IS_MOCK_AUTH = true;

/**
 * Мок перевірки коду: у прототипі приймається будь-який повний код.
 * У продакшені — POST /auth/email/verify, сервер ставить HttpOnly cookie.
 */
async function verifyEmailCode(code: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return code.length === OTP_LENGTH;
}

/** S04. Підтвердження email: autofill, resend з реальним cooldown. */
function VerifyScreenContent() {
  const { colors } = useTheme();
  const email = useSessionStore((state) => state.email);
  const confirmEmailVerified = useSessionStore((state) => state.confirmEmailVerified);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timeoutId = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timeoutId);
  }, [cooldown]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const isValid = await verifyEmailCode(code);
      if (!isValid) {
        setError('Код неправильний або прострочений. Спробуй ще раз або надішли новий.');
        return;
      }
      confirmEmailVerified();
      router.replace(getNextOnboardingRoute(useSessionStore.getState()) ?? '/');
    } catch {
      setError('Немає з’єднання. Код збережено — спробуй ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      stepNumber={3}
      title="Введи код із листа"
      subtitle={`Ми надіслали ${OTP_LENGTH}-значний код на ${email ?? 'твою пошту'}.`}
      footer={
        <>
          <Button
            label="Підтвердити"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={code.length !== OTP_LENGTH}
            testID="verify-submit"
          />
          <Button
            label={cooldown > 0 ? `Надіслати знову через ${cooldown} с` : 'Надіслати код знову'}
            variant="ghost"
            disabled={cooldown > 0}
            onPress={() => {
              setCooldown(RESEND_COOLDOWN_SECONDS);
              setError(null);
            }}
          />
        </>
      }>
      <TextField
        testID="verify-code"
        label="Код підтвердження"
        placeholder={'•'.repeat(OTP_LENGTH)}
        value={code}
        center
        onChangeText={(value) => {
          setCode(sanitizeDigits(value, OTP_LENGTH));
          setError(null);
        }}
        error={error}
        keyboardType="number-pad"
        inputMode="numeric"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={OTP_LENGTH}
        autoFocus
      />

      <Button label="Змінити email" variant="secondary" icon="create-outline" onPress={() => router.back()} />

      {IS_MOCK_AUTH && (
        <View style={[styles.demoNote, { backgroundColor: colors.brandSubtle }]}>
          <AppText variant="secondary" color="textSecondary">
            Демо-режим: підійде будь-який {OTP_LENGTH}-значний код.
          </AppText>
        </View>
      )}
    </OnboardingLayout>
  );
}

export default function VerifyScreen() {
  return (
    <OnboardingGate route="/verify">
      <VerifyScreenContent />
    </OnboardingGate>
  );
}

const styles = StyleSheet.create({
  demoNote: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.brandSubtle,
  },
});
