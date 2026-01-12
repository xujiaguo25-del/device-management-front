/**
 * 权限管理相关服务
 */

import { get, post, del, request } from '../api';
import type { DevicePermissionList, DevicePermissionInsert, ApiResponse } from '../../types';

/**
 * 获取权限列表
 * @param params 查询参数
 * @returns Promise 权限列表响应
 */
export const getPermissions = async (params: {
    page?: number;
    size?: number;
    userId?: string;
    deviceId?: string;
}): Promise<ApiResponse<DevicePermissionList[]>> => {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.deviceId) queryParams.append('deviceId', params.deviceId);

    const endpoint = `/permissions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return get(endpoint);
};

/**
 * 新增权限
 * @param permissionData 权限数据
 * @returns Promise
 */
export const addPermission = async (permissionData: DevicePermissionInsert): Promise<ApiResponse<any>> => {
    return post('/permissions', permissionData);
};

/**
 * 删除权限
 * @param permissionId 权限ID
 * @returns Promise
 */
export const deletePermission = async (permissionId: string): Promise<ApiResponse<any>> => {
    return del(`/permissions/${permissionId}`);
};

/**
 * 导出权限列表为Excel
 * @returns Promise Blob
 */
export const exportPermissionsExcel = async (): Promise<Blob> => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${API_BASE_URL}/permissions/export`, {
        method: 'GET',
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
};
