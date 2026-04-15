import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  userId: string | null;
  email: string | null;
  hasProfile: boolean;
  setAuth: (token: string, refreshToken: string, userId: string, email: string, hasProfile: boolean) => void;
  clearAuth: () => void;
  setHasProfile: (hasProfile: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      userId: null,
      email: null,
      hasProfile: false,
      setAuth: (token, refreshToken, userId, email, hasProfile) =>
        set({ token, refreshToken, userId, email, hasProfile }),
      clearAuth: () =>
        set({ token: null, refreshToken: null, userId: null, email: null, hasProfile: false }),
      setHasProfile: (hasProfile) => set({ hasProfile }),
    }),
    {
      name: 'kora-auth',
    }
  )
);
