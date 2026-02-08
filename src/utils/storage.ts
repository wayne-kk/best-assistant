import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@task_assistant/';

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown): Promise<void> {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(PREFIX + key);
  },

  async clear(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const toRemove = keys.filter((k) => k.startsWith(PREFIX));
    if (toRemove.length) await AsyncStorage.multiRemove(toRemove);
  },
};

export const STORAGE_KEYS = {
  CHAT_MESSAGES: 'chat_messages',
  TASKS: 'tasks',
  CURRENT_TASK_ID: 'current_task_id',
  CURRENT_STEP_ID: 'current_step_id',
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
} as const;
