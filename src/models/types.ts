import type { ImageSourcePropType } from 'react-native';

/** Гендер вигаданого персонажа. */
export type CharacterGender = 'female' | 'male' | 'nonbinary';

/** Фільтр гендеру в Discover (ширший за onboarding preference). */
export type GenderFilter = 'everyone' | 'women' | 'men' | 'nonbinary';

/**
 * Етнічний тип зовнішності вигаданого персонажа — атрибут згенерованого образу,
 * а не дані про реальну людину.
 */
export type Ethnicity = 'european' | 'asian' | 'african' | 'latin' | 'middle-eastern' | 'mixed';

/** Укрупнені категорії інтересів для фільтрів — сирі інтереси надто дрібні. */
export type InterestCategory = 'active' | 'art' | 'music' | 'travel' | 'food' | 'books' | 'nature';

/** Домінантний стиль спілкування персонажа. */
export type CommunicationStyle = 'romantic' | 'playful' | 'intellectual' | 'caring';

/** Вигаданий AI-персонаж. Місто — елемент сюжету, а не реальна відстань. */
export interface Character {
  id: string;
  name: string;
  age: number;
  gender: CharacterGender;
  ethnicity: Ethnicity;
  interestCategories: InterestCategory[];
  communicationStyle: CommunicationStyle;
  tagline: string;
  bio: string;
  storyCity: string;
  interests: string[];
  traits: string[];
  lifestyle: string[];
  photos: ImageSourcePropType[];
  greeting: string;
  /** Ініціативне повідомлення персонажа для «Запиту на діалог» (S12). */
  requestMessage: string;
  suggestedReplies: string[];
}

export type Gender = 'male' | 'female' | 'other';
export type CharacterPreference = 'women' | 'men' | 'everyone';

export interface UserProfile {
  email: string;
  nickname: string;
  birthDate: string; // ISO YYYY-MM-DD
  gender: Gender | null;
  preference: CharacterPreference | null;
}

export type MessageAuthor = 'user' | 'character' | 'system';

/** Стан повідомлення згідно S13: submitting → accepted → completed / failed. */
export type MessageStatus = 'sending' | 'sent' | 'failed';

/**
 * Тип вмісту повідомлення:
 * - text — звичайний текст;
 * - like — стікер «Ви вподобали профіль» від користувача;
 * - disclaimer — службове AI-нагадування, завжди перше в історії.
 */
export type MessageKind = 'text' | 'like' | 'disclaimer';

export interface ChatMessage {
  id: string;
  author: MessageAuthor;
  /** Відсутнє у старих збережених повідомленнях — трактується як 'text'. */
  kind?: MessageKind;
  text: string;
  createdAt: number;
  status: MessageStatus;
}

/**
 * Як почалася розмова:
 * - like — ♥ на картці (стікер симпатії);
 * - chat — «Почати чат» у профілі;
 * - request — ініціативне повідомлення персонажа (запит, доки користувач не відповів).
 */
export type ConversationOrigin = 'like' | 'chat' | 'request';

export interface Conversation {
  characterId: string;
  /** Відсутнє у старих збережених розмовах — трактується як 'chat'. */
  origin?: ConversationOrigin;
  matchedAt: number;
  messages: ChatMessage[];
  unreadCount: number;
}
