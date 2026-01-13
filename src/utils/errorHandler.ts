/**
 * 統一エラーハンドリングツール
 */

export const ErrorType = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

// エラーオブジェクトの型定義
interface ErrorResponse {
  response?: {
    status: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
  name?: string;
  message?: string;
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
  statusCode?: number;
}

/**
 * エラーを解析し、標準化されたエラーオブジェクトを返す
 */
export const parseError = (error: unknown): AppError => {
  // ネットワークエラー
  if (
    error &&
    typeof error === 'object' &&
    'name' in error &&
    'message' in error &&
    error.name === 'TypeError' &&
    typeof error.message === 'string' &&
    error.message.includes('fetch')
  ) {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: 'ネットワーク接続に失敗しました。バックエンドが起動しているか確認してください',
      originalError: error,
    };
  }

  // HTTP エラーレスポンス
  const errorObj = error as ErrorResponse;
  if (errorObj?.response) {
    const statusCode = errorObj.response.status;
    const errorData = errorObj.response.data || {};
    
    if (statusCode === 401) {
      return {
        type: ErrorType.AUTH_ERROR,
        message: errorData.message || errorData.error || '認証されていません。再度ログインしてください',
        originalError: error,
        statusCode,
      };
    }

    if (statusCode >= 400 && statusCode < 500) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        message: errorData.message || errorData.error || `リクエストエラー: ${statusCode}`,
        originalError: error,
        statusCode,
      };
    }

    if (statusCode >= 500) {
      return {
        type: ErrorType.SERVER_ERROR,
        message: errorData.message || errorData.error || 'サーバーエラーが発生しました',
        originalError: error,
        statusCode,
      };
    }
  }

  // Error オブジェクト
  if (error instanceof Error) {
    // 認証関連エラー
    if (error.message.includes('認証') || error.message.includes('token') || error.message.includes('401')) {
      return {
        type: ErrorType.AUTH_ERROR,
        message: error.message,
        originalError: error,
      };
    }

    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error.message || '予期しないエラーが発生しました',
      originalError: error,
    };
  }

  // 文字列エラー
  if (typeof error === 'string') {
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error,
    };
  }

  // 未知のエラー
  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: '予期しないエラーが発生しました',
    originalError: error,
  };
};

/**
 * ユーザーフレンドリーなエラーメッセージを取得
 */
export const getErrorMessage = (error: unknown): string => {
  const appError = parseError(error);
  return appError.message;
};

/**
 * エラーが認証エラーかどうかを判定
 */
export const isAuthError = (error: unknown): boolean => {
  const appError = parseError(error);
  return appError.type === ErrorType.AUTH_ERROR;
};

/**
 * エラーがネットワークエラーかどうかを判定
 */
export const isNetworkError = (error: unknown): boolean => {
  const appError = parseError(error);
  return appError.type === ErrorType.NETWORK_ERROR;
};
