import { create } from 'zustand';
import type { Message } from '../types/message';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { generateId } from '../utils/id';

const MAX_MESSAGES = 100;

type ChatState = {
  messages: Message[];
  isLoading: boolean;
  streamingContent: string | null;
  loadFromStorage: () => Promise<void>;
  addMessage: (role: Message['role'], blocks: Message['blocks']) => Message;
  setStreamingContent: (content: string | null) => void;
  commitStreamingToMessage: (blocks: Message['blocks']) => void;
  clearMessages: () => void;
  persist: () => Promise<void>;
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  streamingContent: null,

  loadFromStorage: async () => {
    const data = await storage.get<Message[]>(STORAGE_KEYS.CHAT_MESSAGES);
    if (data?.length) set({ messages: data });
  },

  addMessage: (role, blocks) => {
    const msg: Message = {
      id: generateId(),
      role,
      blocks,
      createdAt: Date.now(),
    };
    set((s) => ({
      messages: [...s.messages, msg].slice(-MAX_MESSAGES),
    }));
    return msg;
  },

  setStreamingContent: (content) => set({ streamingContent: content }),

  commitStreamingToMessage: (blocks) => {
    set((s) => ({
      messages: s.messages.length
        ? [
            ...s.messages.slice(0, -1),
            { ...s.messages[s.messages.length - 1], blocks },
          ]
        : s.messages,
      streamingContent: null,
    }));
  },

  clearMessages: () => set({ messages: [], streamingContent: null }),

  persist: async () => {
    await storage.set(STORAGE_KEYS.CHAT_MESSAGES, get().messages);
  },
}));
