/**
 * 认证相关服务
 */

import { post } from '../api';
import type { LoginRequest, LoginResponse, ChangePasswordRequest, UserInfo } from '../../types';

/**
 * 用户登录
 * @param loginData 登录数据
 * @returns Promise 登录响应
 */
export const loginService = async (loginData: LoginRequest): Promise<LoginResponse> => {
  const response = await post('/auth/login', loginData);

  // 按 ApiResponse<LoginData> 解析
  // { code, message, data: { token, userInfo } }
  if (response && typeof response === 'object' && 'code' in response) {
    const api: any = response;

    // 非 200 直接抛出后端消息，便于提示“密码错误”等
    if (api.code !== 200) {
      throw new Error(api.message || '登录失败');
    }

    const data = api.data || {};

    const token: string | undefined =
      data.token || data.accessToken || data.jwt;

    if (!token) {
      throw new Error('登录响应中缺少 token 字段，请联系管理员');
    }

    // 从后端返回的 data.userDTO 提取用户信息（兼容多个字段名）
    const rawUserInfo = data.userDTO || data.userInfo || data.user || data.userInfoDto || {};

    const userInfo: UserInfo = {
      USER_ID: rawUserInfo.userId ?? rawUserInfo.USER_ID ?? '',
      DEPT_ID: rawUserInfo.deptId ?? rawUserInfo.DEPT_ID ?? '',
      NAME: rawUserInfo.name ?? rawUserInfo.NAME ?? '',
      USER_TYPE_NAME: rawUserInfo.userTypeName ?? rawUserInfo.USER_TYPE_NAME ?? '',
    };

    // 返回与 types/LoginResponse 定义一致的结构
    return {
      code: api.code,
      message: api.message,
      data: {
        token,
        userDTO: userInfo,
      },
    };
  }

  // 兜底：未知结构，直接提示
  throw new Error('登录响应格式不正确，请联系管理员');
  
};

/**
 * 修改密码
 * @param changePasswordData 修改密码数据
 * @returns Promise
 */
export const changePasswordService = async (changePasswordData: ChangePasswordRequest): Promise<any> => {
  return post('/auth/change-password', changePasswordData);
  
};

/**
 * 登出
 * @returns Promise
 */
export const logoutService = async (): Promise<any> => {
  return post('/auth/logout');

};
