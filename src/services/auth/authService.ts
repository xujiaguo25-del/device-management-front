/**
 * 認証関連サービス
 */

import { post } from '../api';
import type { LoginRequest, LoginResponse, ChangePasswordRequest, UserInfo } from '../../types';

/**
 * ログイン
 * @param loginData ログインデータ
 * @returns Promise ログイン応答
 */
export const loginService = async (loginData: LoginRequest): Promise<LoginResponse> => {
  const response = await post('/auth/login', loginData);

  // ApiResponse<LoginData> として解析
  // { code, message, data: { token, userInfo } }
  if (response && typeof response === 'object' && 'code' in response) {
    const api: any = response;

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
      USER_ID: rawUserInfo.userId ?? rawUserInfo.USER_ID ?? '',
      DEPT_ID: rawUserInfo.deptId ?? rawUserInfo.DEPT_ID ?? '',
      NAME: rawUserInfo.name ?? rawUserInfo.NAME ?? '',
      USER_TYPE_NAME: rawUserInfo.userTypeName ?? rawUserInfo.USER_TYPE_NAME ?? '',
    };

    // types/LoginResponse の定義と一致する構造で返す
    return {
      code: api.code,
      message: api.message,
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
export const changePasswordService = async (changePasswordData: ChangePasswordRequest): Promise<any> => {
  const response = await post('/auth/change-password', changePasswordData);
  
  // ApiResponse として解析
  if (response && typeof response === 'object' && 'code' in response) {
    const api: any = response;
    
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
export const logoutService = async (): Promise<any> => {
  return post('/auth/logout');

};
