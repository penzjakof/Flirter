import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { getCharacterById } from '@/data/characters';
import { createClientId } from '@/lib/format';
import { STORAGE_KEYS, persistStorage } from '@/lib/storage';
import type { ChatMessage, Conversation, ConversationOrigin, MessageKind } from '@/models/types';
import { requestCharacterReply } from '@/services/mock-ai';
import { ENERGY_CONFIG, useEnergyStore } from '@/store/energy-store';

export const MESSAGE_MAX_LENGTH = 1000;

export type SendMessageResult = 'sent' | 'insufficient-energy' | 'invalid';

export type { ConversationOrigin };

export const AI_DISCLAIMER_TEXT = 'Це розмова з вигаданим AI-персонажем. Відповіді можуть містити помилки.';
export const LIKE_MESSAGE_TEXT = 'Ви вподобали профіль';

interface ChatsState {
  conversations: Record<string, Conversation>;
  /** Персонажі, що «готують відповідь» — не персиститься. */
  typingCharacterIds: Record<string, true>;

  /** Ідемпотентно: повторний Like/CTA не створює другий чат (F03). */
  createMatch: (characterId: string, origin?: Exclude<ConversationOrigin, 'request'>) => void;
  /** Ініціативне повідомлення персонажа → «Запит на діалог». Ідемпотентно. */
  createIncomingRequest: (characterId: string) => void;
  /** Відхилити запит: розмова видаляється, персонаж знову доступний у Discover. */
  dismissRequest: (characterId: string) => void;
  sendMessage: (characterId: string, rawText: string) => SendMessageResult;
  markRead: (characterId: string) => void;
  resetForDemo: () => void;
}

function buildMessage(author: ChatMessage['author'], text: string, kind: MessageKind = 'text', createdAt = Date.now()): ChatMessage {
  return { id: createClientId('msg'), author, kind, text, createdAt, status: 'sent' };
}

function buildDisclaimer(createdAt: number): ChatMessage {
  return buildMessage('system', AI_DISCLAIMER_TEXT, 'disclaimer', createdAt);
}

/** Початкова історія: AI-нагадування → (стікер Like) → перше повідомлення персонажа. */
function buildOpeningMessages(characterText: string, origin: ConversationOrigin): ChatMessage[] {
  const now = Date.now();
  return [
    buildDisclaimer(now),
    ...(origin === 'like' ? [buildMessage('user', LIKE_MESSAGE_TEXT, 'like', now)] : []),
    buildMessage('character', characterText, 'text', now),
  ];
}

function buildConversation(characterId: string, characterText: string, origin: ConversationOrigin): Conversation {
  return { characterId, origin, matchedAt: Date.now(), messages: buildOpeningMessages(characterText, origin), unreadCount: 1 };
}

/** Запит — розмова, ініційована персонажем, на яку користувач ще не відповів. */
export function isPendingRequest(conversation: Conversation): boolean {
  return conversation.origin === 'request' && !conversation.messages.some((message) => message.author === 'user');
}

export const useChatsStore = create<ChatsState>()(
  persist(
    (set, get) => {
      const updateConversation = (characterId: string, updater: (conversation: Conversation) => Conversation) =>
        set((state) => {
          const existing = state.conversations[characterId];
          if (!existing) return state;
          return { conversations: { ...state.conversations, [characterId]: updater(existing) } };
        });

      const setTyping = (characterId: string, isTyping: boolean) =>
        set((state) => {
          const next = { ...state.typingCharacterIds };
          if (isTyping) next[characterId] = true;
          else delete next[characterId];
          return { typingCharacterIds: next };
        });

      const deliverReply = async (characterId: string, userText: string) => {
        const character = getCharacterById(characterId);
        if (!character) return;
        setTyping(characterId, true);
        try {
          const replyText = await requestCharacterReply(character, userText);
          updateConversation(characterId, (conversation) => ({
            ...conversation,
            messages: [...conversation.messages, buildMessage('character', replyText)],
            unreadCount: conversation.unreadCount + 1,
          }));
        } catch {
          // Технічна помилка до відповіді — повертаємо резерв (F04, крок 5).
          useEnergyStore.getState().refund(ENERGY_CONFIG.costs.textMessage);
          updateConversation(characterId, (conversation) => ({
            ...conversation,
            messages: [
              ...conversation.messages,
              buildMessage('system', 'Відповідь не вдалося підготувати. Енергію повернуто.'),
            ],
          }));
        } finally {
          setTyping(characterId, false);
        }
      };

      return {
        conversations: {},
        typingCharacterIds: {},

        createMatch: (characterId, origin = 'chat') => {
          const character = getCharacterById(characterId);
          if (!character || get().conversations[characterId]) return;
          const conversation = buildConversation(characterId, character.greeting, origin);
          set((state) => ({ conversations: { ...state.conversations, [characterId]: conversation } }));
        },

        createIncomingRequest: (characterId) => {
          const character = getCharacterById(characterId);
          if (!character || get().conversations[characterId]) return;
          const conversation = buildConversation(characterId, character.requestMessage, 'request');
          set((state) => ({ conversations: { ...state.conversations, [characterId]: conversation } }));
        },

        dismissRequest: (characterId) =>
          set((state) => {
            const conversation = state.conversations[characterId];
            if (!conversation || !isPendingRequest(conversation)) return state;
            const { [characterId]: _removed, ...rest } = state.conversations;
            return { conversations: rest };
          }),

        sendMessage: (characterId, rawText) => {
          const text = rawText.trim().slice(0, MESSAGE_MAX_LENGTH);
          const conversation = get().conversations[characterId];
          if (text.length === 0 || !conversation) return 'invalid';
          // Поки персонаж відповідає — не дозволяємо паралельні списання.
          if (get().typingCharacterIds[characterId]) return 'invalid';

          const isCharged = useEnergyStore.getState().trySpend(ENERGY_CONFIG.costs.textMessage);
          if (!isCharged) return 'insufficient-energy';

          updateConversation(characterId, (current) => ({
            ...current,
            messages: [...current.messages, buildMessage('user', text)],
          }));
          void deliverReply(characterId, text);
          return 'sent';
        },

        markRead: (characterId) =>
          updateConversation(characterId, (conversation) =>
            conversation.unreadCount === 0 ? conversation : { ...conversation, unreadCount: 0 },
          ),

        resetForDemo: () => set({ conversations: {}, typingCharacterIds: {} }),
      };
    },
    {
      name: STORAGE_KEYS.chats,
      storage: persistStorage,
      partialize: ({ conversations }) => ({ conversations }),
      version: 2,
      // v1 → v2: картка-нагадування замінена на перше службове повідомлення в історії.
      migrate: (persisted) => {
        const conversations = (persisted as { conversations?: Record<string, Conversation> } | undefined)?.conversations ?? {};
        return { conversations: Object.fromEntries(Object.entries(conversations).map(([id, conversation]) => [id, withDisclaimer(conversation)])) };
      },
    },
  ),
);

export function selectTotalUnread(state: ChatsState): number {
  return Object.values(state.conversations).reduce((sum, conversation) => sum + conversation.unreadCount, 0);
}

/** Гарантує, що AI-нагадування — перше повідомлення історії. */
function withDisclaimer(conversation: Conversation): Conversation {
  if (conversation.messages[0]?.kind === 'disclaimer') return conversation;
  return { ...conversation, messages: [buildDisclaimer(conversation.matchedAt), ...conversation.messages] };
}
