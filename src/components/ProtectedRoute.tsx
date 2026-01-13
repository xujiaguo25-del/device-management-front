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

  // 初期チェックとトークン検証を行います
  useEffect(() => {
    // トークン期限切れを処理する関数
    const handleTokenExpired = () => {
      if (hasShownMessage.current) return;
      
      hasShownMessage.current = true;
      
      // 401 フラグをクリアします
      sessionStorage.removeItem('token_expired_401');
      
      // 3 秒後にログインページへリダイレクトします
      redirectTimerRef.current = window.setTimeout(() => {
        logout();
        navigate('/login', { replace: true, state: { from: location } });
      }, 3000);
    }; 

    // 関数を ref に保存し、イベントリスナーで使用します
    handleTokenExpiredRef.current = handleTokenExpired;

    // 以前のタイマーをクリアします
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }

    // トークンが読み込まれるまで短時間遅延させます
    const checkTimer = setTimeout(() => {
      setIsChecking(false);
      
      // 401 期限切れフラグがあるかチェックします
      const expiredBy401 = sessionStorage.getItem('token_expired_401') === 'true';
      
      // トークンが期限切れかどうか（JWT 検証または 401 フラグ）をチェックします
      if (expiredBy401 || (token && !isTokenValid(token))) {
        handleTokenExpired();
      } else if (token && isTokenValid(token)) {
        // トークンが有効な場合、状態をリセットします
        hasShownMessage.current = false;
      }
    }, 100);

    // トークン期限切れイベント（API インターセプターから発行）をリッスンします
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
