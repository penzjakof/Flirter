import { Link, router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const authMode = useSessionStore((state) => state.authMode);
  const storedEmail = useSessionStore((state) => state.email);
  const setPendingEmail = useSessionStore((state) => state.setPendingEmail);

  const [email, setEmail] = useState(storedEmail ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = authMode === 'signup';

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setError(t('onboarding.sign_in.errors.invalid_email'));
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
      setError(t('onboarding.sign_in.errors.network_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      stepNumber={2}
      title={isSignup ? t('onboarding.sign_in.signup_title') : t('onboarding.sign_in.login_title')}
      subtitle={
        isSignup
          ? t('onboarding.sign_in.signup_subtitle')
          : t('onboarding.sign_in.login_subtitle')
      }
      footer={
        <Button
          label={t('onboarding.sign_in.get_code_button')}
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={email.trim().length === 0}
          testID="signin-submit"
        />
      }>
      <TextField
        testID="signin-email"
        label={t('onboarding.sign_in.email_label')}
        placeholder={t('onboarding.sign_in.email_placeholder')}
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
          {t('onboarding.sign_in.legal_prefix')}
          <Link href="/legal/terms">
            <AppText variant="secondary" color="brand">
              {t('onboarding.sign_in.terms_link')}
            </AppText>
          </Link>
          {t('onboarding.sign_in.and')}
          <Link href="/legal/privacy">
            <AppText variant="secondary" color="brand">
              {t('onboarding.sign_in.privacy_link')}
            </AppText>
          </Link>
          {t('onboarding.sign_in.legal_suffix')}
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
