import { router } from 'expo-router';
import { useState } from 'react';

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

const GENDER_OPTIONS: readonly Option<Gender>[] = [
  { value: 'male', label: 'Чоловік' },
  { value: 'female', label: 'Жінка' },
  { value: 'other', label: 'Інше' },
];

const PREFERENCE_OPTIONS: readonly Option<CharacterPreference>[] = [
  { value: 'women', label: 'Жінок' },
  { value: 'men', label: 'Чоловіків' },
  { value: 'everyone', label: 'Усіх' },
];

/** S05. Nickname і необов’язкові preferences. Пропуск ≠ автоматичний вибір. */
function ProfileSetupContent() {
  const saveProfile = useSessionStore((state) => state.saveProfile);
  const storedNickname = useSessionStore((state) => state.nickname);

  const [nickname, setNickname] = useState(() => storedNickname ?? suggestNickname());
  const [gender, setGender] = useState<Gender | null>(null);
  const [preference, setPreference] = useState<CharacterPreference | null>(null);
  const [error, setError] = useState<string | null>(null);

  const goNext = (profile: { gender: Gender | null; preference: CharacterPreference | null }) => {
    if (!isValidNickname(nickname)) {
      setError(`Від ${NICKNAME_MIN_LENGTH} до ${NICKNAME_MAX_LENGTH} символів.`);
      return;
    }
    saveProfile({ nickname: sanitizeNickname(nickname), ...profile });
    router.push(getNextOnboardingRoute(useSessionStore.getState()) ?? '/');
  };

  return (
    <OnboardingLayout
      stepNumber={4}
      title="Як до тебе звертатися?"
      subtitle="Персонажі називатимуть тебе так. Справжнє ім’я не обов’язкове."
      footer={
        <>
          <Button label="Продовжити" onPress={() => goNext({ gender, preference })} testID="profile-submit" />
          <Button
            label="Пропустити необов’язкове"
            variant="ghost"
            onPress={() => goNext({ gender: null, preference: null })}
            testID="profile-skip"
          />
        </>
      }>
      <TextField
        testID="profile-nickname"
        label="Нікнейм"
        value={nickname}
        onChangeText={(value) => {
          setNickname(value);
          setError(null);
        }}
        error={error}
        helper="Можна змінити будь-коли в профілі."
        autoComplete="nickname"
        autoCapitalize="words"
        maxLength={NICKNAME_MAX_LENGTH}
      />

      <OptionGroup label="Твій гендер (необов’язково)" options={GENDER_OPTIONS} value={gender} onChange={setGender} testIDPrefix="gender" />

      <OptionGroup
        label="Яких персонажів показувати (необов’язково)"
        options={PREFERENCE_OPTIONS}
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
