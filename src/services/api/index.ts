/**
 * API 配置和基础请求拦截
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

type RequestOptions = RequestInit & { skipAuthRedirect?: boolean };

// 获取token
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// 通用请求方法
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
    
    // 处理token过期 / 登录失败
    if (response.status === 401) {
      // 登录接口或主动要求跳过重定向时，直接抛出后端错误信息
      if (skipAuthRedirect || endpoint.includes('/auth/login')) {
        let errorMessage = '未授权，请检查用户名或密码';
        try {
          const errorData = await response.clone().json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // ignore parse error
        }
        throw new Error(errorMessage);
      }

      // 其他接口：清除本地状态并重定向登录
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      window.location.href = '/login';
      throw new Error('未授权，请重新登录');
    }
    
    if (!response.ok) {
      // 尝试解析错误信息
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // 如果不是 JSON 格式，使用默认错误信息
      }
      throw new Error(errorMessage);
    }
    
    // 获取响应文本（用于调试）
    const responseText = await response.clone().text();
    console.log('API 原始响应文本:', responseText);
    
    // 解析 JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('响应不是有效的 JSON:', responseText);
      throw new Error('后端返回的数据格式不正确（不是 JSON）');
    }
    
    console.log('API 解析后的数据:', data);
    return data;
  } catch (error: any) {
    console.error('API request failed:', error);
    // 网络错误
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查后端服务是否运行');
    }
    throw error;
  }
};

// GET 请求
export const get = (endpoint: string, options?: RequestOptions) => {
  return request(endpoint, { ...options, method: 'GET' });
};

// POST 请求
export const post = (endpoint: string, body?: any, options?: RequestOptions) => {
  return request(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
};

// PUT 请求
export const put = (endpoint: string, body?: any, options?: RequestOptions) => {
  return request(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
};

// DELETE 请求
export const del = (endpoint: string, options?: RequestOptions) => {
  return request(endpoint, { ...options, method: 'DELETE' });
};
