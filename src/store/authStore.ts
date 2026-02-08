import { create } from 'zustand';
import type { User } from '../types/auth';
import type { LoginCredentials, LoginResult } from '../types/auth';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { login as loginApi } from '../services/authApi';

type AuthState = {
  token: string | null;
  user: User | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  loadFromStorage: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isReady: false,
  isLoading: false,
  error: null,

  loadFromStorage: async () => {
    try {
      const [token, user] = await Promise.all([
        storage.get<string>(STORAGE_KEYS.AUTH_TOKEN),
        storage.get<User>(STORAGE_KEYS.AUTH_USER),
      ]);
      set({
        token: token ?? null,
        user: user ?? null,
        isReady: true,
      });
    } catch {
      set({ token: null, user: null, isReady: true });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const result: LoginResult = await loginApi(credentials);
      const { token, user } = result;
      const remember = credentials.rememberMe ?? false;

      set({ token, user: user ?? null, isLoading: false, error: null });

      if (remember) {
        await Promise.all([
          storage.set(STORAGE_KEYS.AUTH_TOKEN, token),
          storage.set(STORAGE_KEYS.AUTH_USER, user ?? {}),
        ]);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : '登录失败，请重试';
      set({ isLoading: false, error: message });
      throw e;
    }
  },

  logout: async () => {
    await Promise.all([
      storage.remove(STORAGE_KEYS.AUTH_TOKEN),
      storage.remove(STORAGE_KEYS.AUTH_USER),
    ]);
    set({ token: null, user: null, error: null });
  },

  clearError: () => set({ error: null }),
}));

export const selectIsLoggedIn = (s: AuthState) => !!s.token;
export const selectUser = (s: AuthState) => s.user;
export const selectAuthReady = (s: AuthState) => s.isReady;
