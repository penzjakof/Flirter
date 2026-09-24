import { create } from 'zustand';
import { Match, Message } from '../models';
import { api } from '../services/api';

interface ChatState {
  matches: Match[];
  messages: Record<string, Message[]>; // matchId -> Message[]
  isLoading: boolean;
  fetchMatches: () => Promise<void>;
  sendMessage: (matchId: string, text: string, senderId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  matches: [],
  messages: {},
  isLoading: false,
  fetchMatches: async () => {
    set({ isLoading: true });
    const matches = await api.getMatches();
    set({ matches, isLoading: false });
  },
  sendMessage: (matchId, text, senderId) => set((state) => {
    const newMessage: Message = {
      id: Math.random().toString(),
      matchId,
      senderId,
      text,
      createdAt: new Date(),
    };
    
    const updatedMatches = state.matches.map(m => 
      m.id === matchId ? { ...m, lastMessage: newMessage } : m
    );

    return {
      matches: updatedMatches,
      messages: {
        ...state.messages,
        [matchId]: [...(state.messages[matchId] || []), newMessage],
      }
    };
  }),
}));
