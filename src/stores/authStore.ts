import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, UserInfo } from '../types';
import { isTokenValid } from '../utils/token';

interface AuthStore extends AuthState {
  setToken: (token: string | null) => void;
  setUserInfo: (userInfo: UserInfo | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (token: string, userInfo: UserInfo) => void;
  logout: () => void;
  clearError: () => void;
  tokenExpiredBy401: boolean;
  setTokenExpiredBy401: (expired: boolean) => void;
  checkTokenExpired: () => void;
}

export const authStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      userInfo: null,
      isLoading: false,
      error: null,
      tokenExpiredBy401: false,
      
      setToken: (token) => {
        set({ token });
      },
      
      setUserInfo: (userInfo) => {
        set({ userInfo });
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      login: (token, userInfo) => {
        set({ token, userInfo, error: null });
      },
      
      logout: () => {
        // すべての認証関連の状態をクリア
        sessionStorage.removeItem('token_expired_401');
        set({ token: null, userInfo: null, error: null, tokenExpiredBy401: false });
      },
      
      clearError: () => set({ error: null }),
      
      setTokenExpiredBy401: (expired: boolean) => {
        set({ tokenExpiredBy401: expired });
        if (expired) {
          sessionStorage.setItem('token_expired_401', 'true');
        } else {
          sessionStorage.removeItem('token_expired_401');
        }
      },
      
      checkTokenExpired: () => {
        const state = get();
        const expiredBy401 = sessionStorage.getItem('token_expired_401') === 'true';
        const tokenInvalid = state.token ? !isTokenValid(state.token) : false;
        
        if (expiredBy401 || tokenInvalid) {
          get().setTokenExpiredBy401(true);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        userInfo: state.userInfo,
      }),
    }
  )
);

// React hook
export const useAuthStore = authStore;

// 非React環境でstoreにアクセスする方法
export const getAuthStore = () => authStore.getState();
