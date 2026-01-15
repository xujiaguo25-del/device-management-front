/**
 * 权限管理相关服务
 */

import { get, post, put, del } from '../api';
import type { DevicePermissionList, DevicePermissionInsert, ApiResponse } from '../../types';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

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
    return get<ApiResponse<DevicePermissionList[]>>(endpoint);
};

/**
 * 新增权限
 * @param permissionData 权限数据
 * @returns Promise
 */
export const addPermission = async (permissionData: DevicePermissionInsert): Promise<ApiResponse<any>> => {
    return post<ApiResponse<any>>('/permissions', permissionData);
};

/**
 * 获取权限详情
 * @param permissionId 权限ID
 * @returns Promise 权限详情响应
 */
export const getPermissionById = async (permissionId: string): Promise<ApiResponse<DevicePermissionList>> => {
    return get<ApiResponse<DevicePermissionList>>(`/permissions/${permissionId}`);
};

/**
 * 编辑权限
 * @param permissionId 权限ID
 * @param permissionData 权限数据
 * @returns Promise
 */
export const updatePermission = async (
    permissionId: string,
    permissionData: DevicePermissionInsert
): Promise<ApiResponse<any>> => {
    return put<ApiResponse<any>>(`/permissions/${permissionId}`, permissionData);
};

/**
 * 删除权限
 * @param permissionId 权限ID
 * @returns Promise
 */
export const deletePermission = async (permissionId: string): Promise<ApiResponse<any>> => {
    return del<ApiResponse<any>>(`/permissions/${permissionId}`);
};

/**
 * 导出权限列表为Excel
 * 优先使用后端API，如果后端不支持则使用前端生成
 */
export const exportPermissionsExcel = async (): Promise<void> => {
    try {
        // 优先尝试使用后端API导出
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
        const token = localStorage.getItem('auth_token');

        const response = await fetch(`${API_BASE_URL}/permissions/export`, {
            method: 'GET',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
            },
        });

        if (response.ok) {
            const blob = await response.blob();
            const fileName = `权限列表_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;
            saveAs(blob, fileName);
            return;
        }
    } catch (error) {
        // 如果后端API不可用，使用前端生成（需要先获取数据）
        console.warn('后端导出API不可用，使用前端生成:', error);
    }

    // 前端生成Excel（需要先获取所有数据）
    try {
        const response = await getPermissions({ page: 1, size: 10000 });
        if (response.code !== 200 || !response.data) {
            throw new Error('获取权限数据失败');
        }

        const permissions = response.data;

        // 准备表头
        const headers = [
            '权限ID', '设备ID', '电脑名', 'IP地址', '用户ID', '用户名', '部门', 
            '登录用户名', 'Domain状态', 'Domain组', 'SmartIT状态', 'USB状态', 'USB过期日期',
            '防病毒状态', '备注'
        ];

        // 准备Excel数据
        const excelData = permissions.map(p => [
            p.permissionId,
            p.deviceId,
            p.computerName,
            p.ipAddress?.join(', ') || '',
            p.userId,
            p.name,
            p.deptId || '',
            p.loginUsername,
            p.domainName || '',
            p.domainGroup || '',
            p.smartitStatusText || '',
            p.usbStatusText || '',
            p.usbExpireDate || '',
            p.antivirusStatusText || '',
            p.remark || '',
        ]);

        // 创建工作簿
        const wb = XLSX.utils.book_new();
        
        // 创建数据数组（标题行 + 数据行）
        const allData = [headers, ...excelData];
        const ws = XLSX.utils.aoa_to_sheet(allData);

        // 设置列宽
        const colWidths = [
            { wch: 12 }, // 权限ID
            { wch: 12 }, // 设备ID
            { wch: 15 }, // 电脑名
            { wch: 20 }, // IP地址
            { wch: 12 }, // 用户ID
            { wch: 12 }, // 用户名
            { wch: 12 }, // 部门
            { wch: 15 }, // 登录用户名
            { wch: 15 }, // Domain状态
            { wch: 12 }, // Domain组
            { wch: 15 }, // SmartIT状态
            { wch: 15 }, // USB状态
            { wch: 15 }, // USB过期日期
            { wch: 15 }, // 防病毒状态
            { wch: 30 }, // 备注
        ];
        ws['!cols'] = colWidths;

        // 设置行高
        ws['!rows'] = [
            { hpt: 25 }, // 表头行高
        ];

        // 定义样式
        const headerStyle = {
            font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
            fill: { fgColor: { rgb: '4472C4' } }, // 蓝色背景
            alignment: { 
                horizontal: 'center', 
                vertical: 'center',
                wrapText: true
            },
            border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
            }
        };

        const cellStyle = {
            alignment: { 
                vertical: 'center',
                wrapText: true
            },
            border: {
                top: { style: 'thin', color: { rgb: 'D0D0D0' } },
                bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
                left: { style: 'thin', color: { rgb: 'D0D0D0' } },
                right: { style: 'thin', color: { rgb: 'D0D0D0' } }
            }
        };

        // 应用表头样式
        for (let C = 0; C <= headers.length - 1; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
            if (!ws[cellAddress]) continue;
            ws[cellAddress].s = headerStyle;
        }

        // 应用数据行样式
        for (let R = 1; R <= excelData.length; ++R) {
            for (let C = 0; C <= headers.length - 1; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellAddress]) continue;
                ws[cellAddress].s = cellStyle;
                
                // 状态列特殊处理（根据文本值设置颜色）
                const colIndex = C;
                const value = ws[cellAddress].v;
                
                if (colIndex === 10) { // SmartIT状态（第11列，索引10）
                    if (value === '本地' || value === '远程') {
                        ws[cellAddress].s = {
                            ...cellStyle,
                            fill: { fgColor: { rgb: 'C6EFCE' } }, // 浅绿色
                            font: { color: { rgb: '006100' } } // 深绿色文字
                        };
                    } else if (value === '未安装') {
                        ws[cellAddress].s = {
                            ...cellStyle,
                            fill: { fgColor: { rgb: 'FFC7CE' } }, // 浅红色
                            font: { color: { rgb: '9C0006' } } // 深红色文字
                        };
                    }
                } else if (colIndex === 11) { // USB状态（第12列，索引11）
                    if (value === '数据' || value === '3G网卡') {
                        ws[cellAddress].s = {
                            ...cellStyle,
                            fill: { fgColor: { rgb: 'C6EFCE' } }, // 浅绿色
                            font: { color: { rgb: '006100' } } // 深绿色文字
                        };
                    } else if (value === '关闭') {
                        ws[cellAddress].s = {
                            ...cellStyle,
                            fill: { fgColor: { rgb: 'FFC7CE' } }, // 浅红色
                            font: { color: { rgb: '9C0006' } } // 深红色文字
                        };
                    }
                } else if (colIndex === 13) { // 防病毒状态（第14列，索引13）
                    if (value === '自动') {
                        ws[cellAddress].s = {
                            ...cellStyle,
                            fill: { fgColor: { rgb: 'C6EFCE' } }, // 浅绿色
                            font: { color: { rgb: '006100' } } // 深绿色文字
                        };
                    } else if (value === '手动') {
                        ws[cellAddress].s = {
                            ...cellStyle,
                            fill: { fgColor: { rgb: 'FFE699' } }, // 浅黄色
                            font: { color: { rgb: '9C6500' } } // 深黄色文字
                        };
                    }
                }
            }
        }

        // 将工作表添加到工作簿
        XLSX.utils.book_append_sheet(wb, ws, '权限列表');

        // 将工作簿转换为二进制数据
        const excelBuffer = XLSX.write(wb, { 
            bookType: 'xlsx', 
            type: 'array',
            cellStyles: true
        });

        // 创建Blob对象并保存
        const blob = new Blob([excelBuffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });

        // 使用 file-saver 保存文件，文件名包含时间戳
        const fileName = `权限列表_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;
        saveAs(blob, fileName);
    } catch (error) {
        throw new Error('导出Excel失败: ' + (error instanceof Error ? error.message : String(error)));
    }
};
