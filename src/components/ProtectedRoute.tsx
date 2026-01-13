import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Spin } from 'antd';
import { useTokenValidation } from '../hooks/useTokenValidation';

interface ProtectedRouteProps {
  component: React.ComponentType<Record<string, never>>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component }) => {
  const { token, tokenExpiredBy401 } = useAuthStore();
  const { isChecking, isTokenExpired } = useTokenValidation();
  const location = useLocation();

  // チェック中はローディング状態を表示
  if (isChecking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // tokenExpiredBy401 が true の場合、useTokenValidation が処理するため、ここでは待機
  if (tokenExpiredBy401) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Token が存在しない、または期限切れの場合、ログイン画面にリダイレクト
  if (!token || isTokenExpired) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Component />;
};

export default ProtectedRoute;
