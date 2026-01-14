/**
 * 认证相关服务
 */

// import { post } from './api';
import type { LoginRequest, LoginResponse, ChangePasswordRequest } from '../../types';

/**
 * 用户登录
 * @param loginData 登录数据
 * @returns Promise 登录响应
 */
export const loginService = async (loginData: LoginRequest): Promise<LoginResponse> => {
  // 注释掉实际API调用，使用假数据
  /*
  return post('/auth/login', loginData);
  */
  
  // 假数据 - 用于开发/演示
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (loginData.userId && loginData.password) {
        if (loginData.password === 'password123') {
          resolve({
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
            userInfo: {
              USER_ID: loginData.userId,
              USER_NAME: '张三',
              DEPARTMENT_CODE: 'DEPT001',
              USER_LEVEL: 'ADMIN',
              CREATED_DATE: new Date().toISOString(),
              UPDATED_DATE: new Date().toISOString(),
            },
          });
        } else {
          reject(new Error('用户名或密码错误'));
        }
      } else {
        reject(new Error('请输入用户名和密码'));
      }
    }, 500);
  });
};

/**
 * 修改密码
 * @param changePasswordData 修改密码数据
 * @returns Promise
 */
export const changePasswordService = async (changePasswordData: ChangePasswordRequest): Promise<any> => {
  // 注释掉实际API调用
  /*
  return post('/auth/change-password', changePasswordData);
  */
  
  // 假数据
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (changePasswordData.currentPassword === 'password123') {
        resolve({ success: true, message: '密码修改成功' });
      } else {
        reject(new Error('当前密码不正确'));
      }
    }, 500);
  });
};

/**
 * 登出
 * @returns Promise
 */
export const logoutService = async (): Promise<any> => {
  // 注释掉实际API调用
  /*
  return post('/auth/logout');
  */
  
  // 假数据
  return Promise.resolve({ success: true });
};
