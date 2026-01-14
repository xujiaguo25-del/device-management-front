/**
 * 認証関連サービス
 */

import { post } from '../api';
import type { LoginRequest, LoginResponse, ChangePasswordRequest, UserInfo } from '../../types';

// API レスポンスの型定義
interface ApiResponse<T = unknown> {
  code: number;
  message?: string;
  data?: T;
}

interface LoginData {
  token?: string;
  accessToken?: string;
  jwt?: string;
  userDTO?: Partial<UserInfo> & Record<string, unknown>;
  userInfo?: Partial<UserInfo> & Record<string, unknown>;
  user?: Partial<UserInfo> & Record<string, unknown>;
  userInfoDto?: Partial<UserInfo> & Record<string, unknown>;
}

/**
 * ログイン
 * @param loginData ログインデータ
 * @returns Promise ログイン応答
 */
export const loginService = async (loginData: LoginRequest): Promise<LoginResponse> => {
  const response = await post<ApiResponse<LoginData>>('/auth/login', loginData);

  // ApiResponse<LoginData> として解析
  // { code, message, data: { token, userInfo } }
  if (response && typeof response === 'object' && 'code' in response) {
    const api = response as ApiResponse<LoginData>;

    // code が 200 以外の場合はバックエンドの message をそのまま投げる（例：パスワード誤り等）
    if (api.code !== 200) {
      throw new Error(api.message || 'ログインに失敗しました');
    }

    const data = api.data || {};

    const token: string | undefined =
      data.token || data.accessToken || data.jwt;

    if (!token) {
      throw new Error('ログイン応答に token フィールドがありません。管理者に連絡してください');
    }

    // バックエンドの data.userDTO からユーザー情報を抽出（複数のフィールド名に互換対応）
    const rawUserInfo = data.userDTO || data.userInfo || data.user || data.userInfoDto || {};

    const userInfo: UserInfo = {
      USER_ID: (rawUserInfo.userId as string) ?? (rawUserInfo.USER_ID as string) ?? '',
      DEPT_ID: (rawUserInfo.deptId as string) ?? (rawUserInfo.DEPT_ID as string) ?? '',
      NAME: (rawUserInfo.name as string) ?? (rawUserInfo.NAME as string) ?? '',
      USER_TYPE_NAME: (rawUserInfo.userTypeName as string) ?? (rawUserInfo.USER_TYPE_NAME as string) ?? '',
    };

    // types/LoginResponse の定義と一致する構造で返す
    return {
      code: api.code,
      message: api.message || '',
      data: {
        token,
        userDTO: userInfo,
      },
    };
  }

  // フォールバック：未知の構造
  throw new Error('ログイン応答の形式が不正です。管理者に連絡してください');
};

/**
 * パスワード変更
 * @param changePasswordData パスワード変更データ
 * @returns Promise
 */
export const changePasswordService = async (
  changePasswordData: ChangePasswordRequest
): Promise<ApiResponse> => {
  const response = await post<ApiResponse>('/auth/change-password', changePasswordData);
  
  // ApiResponse として解析
  if (response && typeof response === 'object' && 'code' in response) {
    const api = response as ApiResponse;
    
    // code が 200 以外の場合はバックエンドの message をそのまま投げる
    if (api.code !== 200) {
      throw new Error(api.message || 'パスワード変更に失敗しました');
    }
    
    return response;
  }
  
  return response;
};

/**
 * ログアウト
 * @returns Promise
 */
export const logoutService = async (): Promise<ApiResponse> => {
  return post<ApiResponse>('/auth/logout');
};
