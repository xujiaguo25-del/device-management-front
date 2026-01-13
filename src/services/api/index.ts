/**
 * API 設定と基本リクエスト処理
 */

import { getAuthStore } from '../../stores/authStore';
import { parseError } from '../../utils/errorHandler';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

type RequestOptions = RequestInit & { skipAuthRedirect?: boolean };

// token を取得
export const getToken = (): string | null => {
  return getAuthStore().token;
};

// 共通リクエスト
export const request = async <T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  const skipAuthRedirect = Boolean((options as RequestOptions).skipAuthRedirect);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // options の headers を追加
  if (options.headers) {
    const optionsHeaders = options.headers as Record<string, string>;
    Object.assign(headers, optionsHeaders);
  }
  
  // JWT token を追加
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // token 期限切れ / ログイン失敗の処理
    if (response.status === 401) {
      // ログイン API、または明示的にリダイレクトをスキップする場合は、バックエンドのエラー内容をそのまま返す
      if (skipAuthRedirect || endpoint.includes('/auth/login')) {
        let errorMessage = '認証されていません。ユーザーIDまたはパスワードをご確認ください';
        try {
          const errorData = await response.clone().json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // ignore parse error
        }
        throw new Error(errorMessage);
      }

      // その他の API：401期限切れとしてマーク
      // authStore を通じて状態を更新（ProtectedRoute が自動的に検知）
      const authStore = getAuthStore();
      authStore.setTokenExpiredBy401(true);
      throw new Error('認証されていません。再度ログインしてください');
    }
    
    if (!response.ok) {
      // 統一エラーハンドリング：エラーレスポンスを解析
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // JSON でない場合はデフォルトのエラーを使う
      }
      
      // 統一エラーハンドリングツールを使用してエラーを解析
      const appError = parseError({
        response: {
          status: response.status,
          data: { message: errorMessage },
        },
      });
      
      throw new Error(appError.message);
    }
    
    // JSON を解析
    let data;
    try {
      data = await response.json();
    } catch (e) {
      // 開発環境でのみエラーログを出力
      if (import.meta.env.DEV) {
        console.error('レスポンスが有効な JSON ではありません:', e);
      }
      throw new Error('バックエンドの返却データ形式が不正です（JSON ではありません）');
    }
    
    return data as T;
  } catch (error: unknown) {
    // 開発環境でのみエラーログを出力
    if (import.meta.env.DEV) {
      console.error('API request failed:', error);
    }
    
    // 統一エラーハンドリングツールを使用してエラーを解析し、スロー
    const appError = parseError(error);
    throw new Error(appError.message);
  }
};

// GET
export const get = <T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> => {
  return request<T>(endpoint, { ...options, method: 'GET' });
};

// POST
export const post = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions
): Promise<T> => {
  return request<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
};

// PUT
export const put = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions
): Promise<T> => {
  return request<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
};

// DELETE
export const del = (endpoint: string, options?: RequestOptions) => {
  return request(endpoint, { ...options, method: 'DELETE' });
};
