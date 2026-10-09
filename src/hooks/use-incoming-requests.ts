import { useEffect } from 'react';

import { CHARACTERS } from '@/data/characters';
import type { CharacterGender, CharacterPreference } from '@/models/types';
import { isPendingRequest, useChatsStore } from '@/store/chats-store';
import { useSessionStore } from '@/store/session-store';

/**
 * Мок серверних ініціативних повідомлень персонажів («Запити на діалог», S12).
 * У продакшені розсилку планує бекенд (частота, тихі години, opt-out), а клієнт лише отримує події.
 */
const FIRST_REQUEST_DELAY_MS = 15 * 1000;
const REQUEST_INTERVAL_MS = 3 * 60 * 1000;
const MAX_PENDING_REQUESTS = 3;

const GENDER_BY_PREFERENCE: Record<Exclude<CharacterPreference, 'everyone'>, CharacterGender> = {
  women: 'female',
  men: 'male',
};

/** Обирає випадкового персонажа без розмови з урахуванням preference з онбордингу. */
function pickRequestCandidate(): string | null {
  const { conversations } = useChatsStore.getState();
  const pendingCount = Object.values(conversations).filter(isPendingRequest).length;
  if (pendingCount >= MAX_PENDING_REQUESTS) return null;

  const { preference } = useSessionStore.getState();
  const preferredGender = preference && preference !== 'everyone' ? GENDER_BY_PREFERENCE[preference] : null;
  const candidates = CHARACTERS.filter(
    (character) => !conversations[character.id] && (!preferredGender || character.gender === preferredGender),
  );
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)].id;
}

/** Періодично створює запит на діалог, поки відкрита продуктова частина застосунку. */
export function useIncomingRequests(): void {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = (delay: number) => {
      timeoutId = setTimeout(() => {
        const characterId = pickRequestCandidate();
        if (characterId) useChatsStore.getState().createIncomingRequest(characterId);
        tick(REQUEST_INTERVAL_MS);
      }, delay);
    };

    tick(FIRST_REQUEST_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, []);
}
