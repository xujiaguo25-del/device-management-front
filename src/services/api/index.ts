/**
 * API 配置和基础请求拦截
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// 获取token
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// 通用请求方法
export const request = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // 添加来自options的headers
  if (options.headers) {
    const optionsHeaders = options.headers as Record<string, string>;
    Object.assign(headers, optionsHeaders);
  }
  
  // 添加JWT token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // 处理token过期
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      window.location.href = '/login';
      throw new Error('未授权，请重新登录');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// GET 请求
export const get = (endpoint: string, options?: RequestInit) => {
  return request(endpoint, { ...options, method: 'GET' });
};

// POST 请求
export const post = (endpoint: string, body?: any, options?: RequestInit) => {
  return request(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
};

// PUT 请求
export const put = (endpoint: string, body?: any, options?: RequestInit) => {
  return request(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
};

// DELETE 请求
export const del = (endpoint: string, options?: RequestInit) => {
  return request(endpoint, { ...options, method: 'DELETE' });
};
