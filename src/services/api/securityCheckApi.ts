import type { SecurityCheck } from '../../types';  // 注意：这里应该是 SecurityCheck，不是 index
import { get, put, post } from './index';  // 导入 index.ts 中的方法

export interface SecurityCheckParams {
  page?: number;
  pageSize?: number;
  userId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string | number;
}

export const securityCheckApi = {
  // 获取安全检查列表
  getSecurityChecks: async (params: SecurityCheckParams): Promise<ApiResponse> => {
    try {
      // 构建查询字符串
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(params.page || 1));
      queryParams.append('pageSize', String(params.pageSize || 10));
      
      if (params.userId) {
        queryParams.append('userId', params.userId);
      }
      
      const endpoint = `/security-checks?${queryParams.toString()}`;
      return await get(endpoint);
    } catch (error: any) {
      console.error('获取安全检查列表失败:', error);
      throw error;
    }
  },

  // 更新安全检查记录
  updateSecurityCheck: async (id: string, data: Partial<SecurityCheck>): Promise<ApiResponse> => {
    try {
      return await put(`/security-checks/${id}`, data);
    } catch (error: any) {
      console.error('更新安全检查记录失败:', error);
      throw error;
    }
  },

  // 根据采样ID更新
  updateSecurityCheckBySamplingId: async (samplingId: string, data: Partial<SecurityCheck>): Promise<ApiResponse> => {
    try {
      return await put(`/security-checks/by-sampling/${samplingId}`, data);
    } catch (error: any) {
      console.error('根据采样ID更新失败:', error);
      throw error;
    }
  },

  // 创建安全检查记录
  createSecurityCheck: async (data: Partial<SecurityCheck>): Promise<ApiResponse> => {
    try {
      return await post('/security-checks', data);
    } catch (error: any) {
      console.error('创建安全检查记录失败:', error);
      throw error;
    }
  },
};