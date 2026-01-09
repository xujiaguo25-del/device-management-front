import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Spin } from 'antd';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component }) => {
  const { token } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // token の状態が更新されるまで少し待つ
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [token]);

  // チェック中はローディングを表示
  if (isChecking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // token がない場合はログイン画面へリダイレクトし、ログイン後に戻れるよう現在のパスを保存
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Component />;
};

export default ProtectedRoute;
