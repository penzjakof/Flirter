import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { OnboardingGate } from '@/components/onboarding/onboarding-gate';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { isValidEmail, normalizeEmail } from '@/lib/validation';
import { useSessionStore } from '@/store/session-store';
import { spacing } from '@/theme/tokens';

/** Мок запиту коду. Замінюється на POST /auth/email/code (з rate limit на сервері). */
async function requestEmailCode(_email: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 700));
}

/** S03. Створення акаунту / вхід: один email-input, passwordless. */
function SignInScreenContent() {
  const authMode = useSessionStore((state) => state.authMode);
  const storedEmail = useSessionStore((state) => state.email);
  const setPendingEmail = useSessionStore((state) => state.setPendingEmail);

  const [email, setEmail] = useState(storedEmail ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = authMode === 'signup';

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setError('Перевір адресу — схоже, в ній помилка.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const normalizedEmail = normalizeEmail(email);
      await requestEmailCode(normalizedEmail);
      setPendingEmail(normalizedEmail);
      router.push('/verify');
    } catch {
      setError('Не вдалося надіслати код. Перевір з’єднання й спробуй ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      stepNumber={2}
      title={isSignup ? 'Створи акаунт' : 'З поверненням!'}
      subtitle={
        isSignup
          ? 'Акаунт зберігає розмови та енергію між пристроями. Пароль не потрібен — надішлемо код.'
          : 'Введи email, з яким реєструвався. Надішлемо одноразовий код.'
      }
      footer={
        <Button
          label="Отримати код"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={email.trim().length === 0}
          testID="signin-submit"
        />
      }>
      <TextField
        testID="signin-email"
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setError(null);
        }}
        error={error}
        keyboardType="email-address"
        inputMode="email"
        autoComplete="email"
        textContentType="emailAddress"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="send"
        onSubmitEditing={handleSubmit}
        maxLength={254}
      />

      <View style={styles.legal}>
        <AppText variant="secondary" color="textSecondary">
          Продовжуючи, ти переходиш до{' '}
          <Link href="/legal/terms">
            <AppText variant="secondary" color="brand">
              Умов
            </AppText>
          </Link>{' '}
          та{' '}
          <Link href="/legal/privacy">
            <AppText variant="secondary" color="brand">
              Політики приватності
            </AppText>
          </Link>
          . Погодитися з ними потрібно буде окремо.
        </AppText>
      </View>
    </OnboardingLayout>
  );
}

export default function SignInScreen() {
  return (
    <OnboardingGate route="/sign-in">
      <SignInScreenContent />
    </OnboardingGate>
  );
}

const styles = StyleSheet.create({
  legal: {
    paddingHorizontal: spacing.xs,
  },
});
