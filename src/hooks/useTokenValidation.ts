/**
 * Token 検証 Hook
 * ProtectedRoute の token 検証ロジックを簡素化するために使用
 */

import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useAuthStore } from '../stores/authStore';
import { isTokenValid } from '../utils/token';

interface UseTokenValidationResult {
  isChecking: boolean;
  isTokenExpired: boolean;
  handleTokenExpired: () => void;
}

export const useTokenValidation = (): UseTokenValidationResult => {
  const { token, logout, tokenExpiredBy401, setTokenExpiredBy401, checkTokenExpired } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const hasShownMessageRef = useRef(false);
  const redirectTimerRef = useRef<number | null>(null);

  // token が期限切れかどうかをチェック
  useEffect(() => {
    checkTokenExpired();
    setIsChecking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // tokenExpiredBy401 状態の変化を監視
  useEffect(() => {
    if (tokenExpiredBy401) {
      // 既にリダイレクト処理が実行されている場合はスキップ
      if (redirectTimerRef.current !== null) {
        return;
      }

      // メッセージは一度だけ表示
      if (!hasShownMessageRef.current) {
        message.warning('トークンの有効期限が切れました。3秒後にログイン画面にリダイレクトします。');
        hasShownMessageRef.current = true;
      }

      // Token が期限切れ、ログアウト処理を実行
      redirectTimerRef.current = window.setTimeout(() => {
        // 状態をクリア
        sessionStorage.removeItem('token_expired_401');
        setTokenExpiredBy401(false);
        logout();
        // リダイレクト
        navigate('/login', { replace: true });
        // タイマーとメッセージフラグをクリア
        redirectTimerRef.current = null;
        hasShownMessageRef.current = false;
      }, 3000);

      return () => {
        if (redirectTimerRef.current !== null) {
          clearTimeout(redirectTimerRef.current);
          redirectTimerRef.current = null;
        }
      };
    } else {
      // Token が有効、期限切れマークをクリア
      sessionStorage.removeItem('token_expired_401');
      hasShownMessageRef.current = false;
      // 既存のタイマーをクリア
      if (redirectTimerRef.current !== null) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    }
  }, [tokenExpiredBy401, logout, navigate, setTokenExpiredBy401]);

  const handleTokenExpired = useMemo(
    () => () => {
      setTokenExpiredBy401(true);
    },
    [setTokenExpiredBy401]
  );

  const isTokenExpired = useMemo(
    () => tokenExpiredBy401 || (token ? !isTokenValid(token) : false),
    [tokenExpiredBy401, token]
  );

  return {
    isChecking,
    isTokenExpired,
    handleTokenExpired,
  };
};
