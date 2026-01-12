import React, { useState, useRef, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Spin } from 'antd';
import { isTokenValid } from '../utils/token';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component }) => {
  const { token, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const hasShownMessage = useRef(false);
  const redirectTimerRef = useRef<number | null>(null);
  const handleTokenExpiredRef = useRef<(() => void) | null>(null);

  // 初始化检查和token验证
  useEffect(() => {
    // 处理token过期的函数
    const handleTokenExpired = () => {
      if (hasShownMessage.current) return;
      
      hasShownMessage.current = true;
      
      // 清除401标志
      sessionStorage.removeItem('token_expired_401');
      
      // 3秒后重定向到登录页面
      redirectTimerRef.current = window.setTimeout(() => {
        logout();
        navigate('/login', { replace: true, state: { from: location } });
      }, 3000);
    };

    // 将函数保存到ref中，供事件监听器使用
    handleTokenExpiredRef.current = handleTokenExpired;

    // 清理之前的定时器
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }

    // 短暂延迟以确保token已加载
    const checkTimer = setTimeout(() => {
      setIsChecking(false);
      
      // 检查是否有401过期标志
      const expiredBy401 = sessionStorage.getItem('token_expired_401') === 'true';
      
      // 检查token是否过期（JWT验证或401标志）
      if (expiredBy401 || (token && !isTokenValid(token))) {
        handleTokenExpired();
      } else if (token && isTokenValid(token)) {
        // token有效，重置状态
        hasShownMessage.current = false;
      }
    }, 100);

    // 监听token过期事件（从API拦截器触发）
    const handleTokenExpiredEvent = () => {
      if (handleTokenExpiredRef.current) {
        handleTokenExpiredRef.current();
      }
    };
    window.addEventListener('token-expired-401', handleTokenExpiredEvent);

    return () => {
      clearTimeout(checkTimer);
      window.removeEventListener('token-expired-401', handleTokenExpiredEvent);
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [token, logout, navigate, location]);

  // チェック中はローディングを表示
  if (isChecking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // token がない場合はログイン画面へリダイレクト
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Component />;
};

export default ProtectedRoute;
