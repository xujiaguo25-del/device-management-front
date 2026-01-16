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

// 文件下载方法
export const downloadFile = async (
  endpoint: string,
  filename: string = 'export.xlsx',
  options: RequestInit = {}
): Promise<void> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
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
    
    // 获取文件Blob
    const blob = await response.blob();
    
    // 创建下载链接
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // 从响应头获取文件名，如果后端设置了的话
    const contentDisposition = response.headers.get('content-disposition');
    let actualFilename = filename;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch && filenameMatch[1]) {
        actualFilename = filenameMatch[1];
      }
    }
    
    link.download = actualFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 释放URL对象
    window.URL.revokeObjectURL(downloadUrl);
    
  } catch (error) {
    console.error('文件下载失败:', error);
    throw error;
  }
};

// GET 请求
export const get =  (endpoint: string, options?: RequestInit): Promise<any> => {
  return request(endpoint, { ...options, method: 'GET' });
};

// POST 请求
export const post =  (endpoint: string, body?: any, options?: RequestInit): Promise<any> => {
  return request(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
};

// PUT 请求
export const put =  (endpoint: string, body?: any, options?: RequestInit): Promise<any> => {
  return request(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
};

// DELETE 请求
export const del =  (endpoint: string, options?: RequestInit): Promise<any> => {
  return request(endpoint, { ...options, method: 'DELETE' });
};