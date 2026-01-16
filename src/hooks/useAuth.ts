/**
 * 自定义 hooks
 */

import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

/**
 * 认证检查 hook
 * 检查用户是否已登录，未登录则重定向到登录页
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
 * 防抖 hook
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
