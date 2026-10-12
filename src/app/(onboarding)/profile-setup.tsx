import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { OnboardingGate } from '@/components/onboarding/onboarding-gate';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { Button } from '@/components/ui/button';
import { OptionGroup, type Option } from '@/components/ui/option-group';
import { TextField } from '@/components/ui/text-field';
import {
  NICKNAME_MAX_LENGTH,
  NICKNAME_MIN_LENGTH,
  isValidNickname,
  sanitizeNickname,
  suggestNickname,
} from '@/lib/validation';
import type { CharacterPreference, Gender } from '@/models/types';
import { getNextOnboardingRoute, useSessionStore } from '@/store/session-store';

/** S05. Nickname і необов’язкові preferences. Пропуск ≠ автоматичний вибір. */
function ProfileSetupContent() {
  const { t } = useTranslation();
  const saveProfile = useSessionStore((state) => state.saveProfile);
  const storedNickname = useSessionStore((state) => state.nickname);

  const [nickname, setNickname] = useState(() => storedNickname ?? suggestNickname());
  const [gender, setGender] = useState<Gender | null>(null);
  const [preference, setPreference] = useState<CharacterPreference | null>(null);
  const [error, setError] = useState<string | null>(null);

  const genderOptions: readonly Option<Gender>[] = [
    { value: 'male', label: t('onboarding.profile_setup.genders.male') },
    { value: 'female', label: t('onboarding.profile_setup.genders.female') },
    { value: 'other', label: t('onboarding.profile_setup.genders.other') },
  ];

  const preferenceOptions: readonly Option<CharacterPreference>[] = [
    { value: 'women', label: t('onboarding.profile_setup.preferences.women') },
    { value: 'men', label: t('onboarding.profile_setup.preferences.men') },
    { value: 'everyone', label: t('onboarding.profile_setup.preferences.everyone') },
  ];

  const goNext = (profile: { gender: Gender | null; preference: CharacterPreference | null }) => {
    if (!isValidNickname(nickname)) {
      setError(
        t('onboarding.profile_setup.nickname_error', {
          min: NICKNAME_MIN_LENGTH,
          max: NICKNAME_MAX_LENGTH,
        }),
      );
      return;
    }
    saveProfile({ nickname: sanitizeNickname(nickname), ...profile });
    router.push(getNextOnboardingRoute(useSessionStore.getState()) ?? '/');
  };

  return (
    <OnboardingLayout
      stepNumber={4}
      title={t('onboarding.profile_setup.title')}
      subtitle={t('onboarding.profile_setup.subtitle')}
      footer={
        <>
          <Button
            label={t('onboarding.profile_setup.continue_button')}
            onPress={() => goNext({ gender, preference })}
            testID="profile-submit"
          />
          <Button
            label={t('onboarding.profile_setup.skip_button')}
            variant="ghost"
            onPress={() => goNext({ gender: null, preference: null })}
            testID="profile-skip"
          />
        </>
      }>
      <TextField
        testID="profile-nickname"
        label={t('onboarding.profile_setup.nickname_label')}
        value={nickname}
        onChangeText={(value) => {
          setNickname(value);
          setError(null);
        }}
        error={error}
        helper={t('onboarding.profile_setup.nickname_helper')}
        autoComplete="nickname"
        autoCapitalize="words"
        maxLength={NICKNAME_MAX_LENGTH}
      />

      <OptionGroup
        label={t('onboarding.profile_setup.gender_label')}
        options={genderOptions}
        value={gender}
        onChange={setGender}
        testIDPrefix="gender"
      />

      <OptionGroup
        label={t('onboarding.profile_setup.preference_label')}
        options={preferenceOptions}
        value={preference}
        onChange={setPreference}
        testIDPrefix="preference"
      />
    </OnboardingLayout>
  );
}

export default function ProfileSetupScreen() {
  return (
    <OnboardingGate route="/profile-setup">
      <ProfileSetupContent />
    </OnboardingGate>
  );
}
