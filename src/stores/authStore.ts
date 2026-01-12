import { create } from 'zustand';
import type { AuthState, UserInfo } from '../types';

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
}

export const authStore = create<AuthStore>((set) => ({
  token: localStorage.getItem('auth_token') || null,
  userInfo: localStorage.getItem('user_info') ? JSON.parse(localStorage.getItem('user_info') || '{}') : null,
  isLoading: false,
  error: null,
  tokenExpiredBy401: false,
  
  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  },
  
  setUserInfo: (userInfo) => {
    set({ userInfo });
    if (userInfo) {
      localStorage.setItem('user_info', JSON.stringify(userInfo));
    } else {
      localStorage.removeItem('user_info');
    }
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  login: (token, userInfo) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_info', JSON.stringify(userInfo));
    set({ token, userInfo, error: null });
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    set({ token: null, userInfo: null, error: null, tokenExpiredBy401: false });
  },
  
  clearError: () => set({ error: null }),
  
  setTokenExpiredBy401: (expired: boolean) => set({ tokenExpiredBy401: expired }),
}));

// React hook
export const useAuthStore = authStore;

// 非React环境中访问store的方法
export const getAuthStore = () => authStore.getState();
