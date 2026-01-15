/**
 * カスタム hooks
 */

import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

/**
 * 認証チェック hook
 * ログイン状態を確認し、未ログインの場合はログイン画面へリダイレクト
 */
export const useAuth = () => {
  const { token, userInfo } = useAuthStore();
  const navigate = useNavigate();
  const isAuthenticated = !!token;
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  return { isAuthenticated, userInfo };
};

/**
 * デバウンス hook
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};
