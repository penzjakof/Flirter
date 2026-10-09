import type { Character } from '@/models/types';

/**
 * Мок AI-відповідей для прототипу. Замінюється на серверний endpoint
 * з ідемпотентним client_message_id (F04).
 * Тексти навмисно гендерно нейтральні: персонажі бувають обох статей, стать користувача невідома.
 */
const GENERIC_REPLIES = [
  'Ха, це звучить цікаво! Розкажи більше 😊',
  'Мені подобається, як ти думаєш. А що тебе в цьому найбільше захоплює?',
  'Ого, несподівано 😄 Ти завжди так відверто говориш?',
  'Знаєш, у мене сьогодні якраз схожі думки. Збіг? 😉',
  'Це мило. А як ти зазвичай проводиш вечори?',
  'Ти вмієш зацікавити 🙂 Що краще: спонтанна поїздка чи вечір удома з фільмом?',
];

const MIN_DELAY_MS = 1200;
const MAX_EXTRA_DELAY_MS = 1600;

export async function requestCharacterReply(character: Character, userMessage: string): Promise<string> {
  const delay = MIN_DELAY_MS + Math.random() * MAX_EXTRA_DELAY_MS;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const mentionsInterest = character.interests.find((interest) =>
    userMessage.toLowerCase().includes(interest.toLowerCase()),
  );
  if (mentionsInterest) {
    return `О, ${mentionsInterest.toLowerCase()} — це моя слабкість! 😍 Влучно!`;
  }

  return GENERIC_REPLIES[Math.floor(Math.random() * GENERIC_REPLIES.length)];
}
