import type { SecurityCheck } from "../../types";
import { get, put, getToken } from "../api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// API応答タイプ
export interface SecurityCheckResponse {
  code: number;
  message: string;
  data: SecurityCheck[];
  total: number;
  page: number;
  size: number;
}
export interface UpdateSecurityCheckResponse {
  code: number;
  message: string;
  data?: SecurityCheck;
}

//パラメータの検索
export interface GetSecurityChecksParams {
  page: number;
  size?: number;
  userId?: string;
}

//検索方法 
export const getSecurityChecks = (params: GetSecurityChecksParams): Promise<SecurityCheckResponse> => {
  const query = new URLSearchParams();

  query.append('page', params.page.toString());
  query.append('size', (params.size ?? 10).toString());

  if (params.userId) {
    query.append('userId', params.userId);
  }

  return get<SecurityCheckResponse>(`/security-checks?${query.toString()}`);
};


//更新方法
export const updateSecurityCheck = (
  samplingId: string,
  data: Partial<SecurityCheck>
): Promise<UpdateSecurityCheckResponse> => {
  return put<UpdateSecurityCheckResponse>(`/security-checks/${samplingId}`, data);
};


//パラメータのエクスポート
export interface ExportSecurityChecksParams {
  reportCode?: string; 
}

//エクスポート方法
export const exportSecurityChecksExcel = async (params?: ExportSecurityChecksParams): Promise<void> => {
  try {
    const query = new URLSearchParams();
    
    if (params?.reportCode) {
      query.append('reportCode', params.reportCode);
    }
    
    const endpoint = `/security-checks/export${query.toString() ? '?' + query.toString() : ''}`;
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getToken();
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    
    if (!response.ok) {
      throw new Error(`导出失败: ${response.status}`);
    }
    
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = '月度检查表.xlsx'; 
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
        if (filename.includes('UTF-8')) {
          const utf8Match = filename.match(/UTF-8''(.+)/);
          if (utf8Match) {
            filename = decodeURIComponent(utf8Match[1]);
          }
        }
      }
    }
    // ファイルのダウンロード
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('导出失败:', error);
    throw error;
  }
};