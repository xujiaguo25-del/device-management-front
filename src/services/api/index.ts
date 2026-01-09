/**
 * API 設定と基本リクエスト処理
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

type RequestOptions = RequestInit & { skipAuthRedirect?: boolean };

// token を取得
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// 共通リクエスト
export const request = async (
  endpoint: string,
  options: RequestOptions = {}
): Promise<any> => {
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

      // その他の API：ローカル状態をクリアしてログインへリダイレクト
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      window.location.href = '/login';
      throw new Error('認証されていません。再度ログインしてください');
    }
    
    if (!response.ok) {
      // エラー内容を解析
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // JSON でない場合はデフォルトのエラーを使う
      }
      throw new Error(errorMessage);
    }
    
    // レスポンステキストを取得（デバッグ用）
    const responseText = await response.clone().text();
    console.log('API 生レスポンステキスト:', responseText);
    
    // JSON を解析
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('レスポンスが有効な JSON ではありません:', responseText);
      throw new Error('バックエンドの返却データ形式が不正です（JSON ではありません）');
    }
    
    console.log('API 解析後データ:', data);
    return data;
  } catch (error: any) {
    console.error('API request failed:', error);
    // ネットワークエラー
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('ネットワーク接続に失敗しました。バックエンドが起動しているか確認してください');
    }
    throw error;
  }
};

// GET
export const get = (endpoint: string, options?: RequestOptions) => {
  return request(endpoint, { ...options, method: 'GET' });
};

// POST
export const post = (endpoint: string, body?: any, options?: RequestOptions) => {
  return request(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
};

// PUT
export const put = (endpoint: string, body?: any, options?: RequestOptions) => {
  return request(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
};

// DELETE
export const del = (endpoint: string, options?: RequestOptions) => {
  return request(endpoint, { ...options, method: 'DELETE' });
};
