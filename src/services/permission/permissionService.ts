/**
 * 权限管理相关服务
 */

// import { get, post, del, request } from '../api';
import type { DevicePermissionList, DevicePermissionInsert, ApiResponse } from '../../types';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

// 模拟数据
const mockPermissions: DevicePermissionList[] = [
    {
        permissionId: 'PERM001',
        deviceId: 'DEV001',
        monitorNames: ['显示器1', '显示器2'],
        computerName: '开发机-001',
        ipAddress: ['192.168.1.100', '192.168.1.101'],
        userId: 'U001',
        name: '张三',
        deptId: 'DEPT001',
        loginUsername: 'zhangsan',
        domainStatus: 1,
        domainGroup: 'IT组',
        noDomainReason: '',
        smartitStatus: 1,
        noSmartitReason: '',
        usbStatus: 1,
        usbReason: '工作需要',
        usbExpireDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
        antivirusStatus: 1,
        noSymantecReason: '',
        remark: '开发人员，需要USB权限',
        createTime: dayjs().subtract(10, 'day').format('YYYY-MM-DD HH:mm:ss'),
        creater: 'admin',
        updateTime: dayjs().subtract(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
        updater: 'admin',
    },
    {
        permissionId: 'PERM002',
        deviceId: 'DEV002',
        monitorNames: ['显示器1'],
        computerName: '测试机-002',
        ipAddress: ['192.168.1.102'],
        userId: 'U002',
        name: '李四',
        deptId: 'DEPT002',
        loginUsername: 'lisi',
        domainStatus: 1,
        domainGroup: '测试组',
        noDomainReason: '',
        smartitStatus: 0,
        noSmartitReason: '设备不支持',
        usbStatus: 0,
        usbReason: '',
        usbExpireDate: null,
        antivirusStatus: 1,
        noSymantecReason: '',
        remark: '测试人员',
        createTime: dayjs().subtract(8, 'day').format('YYYY-MM-DD HH:mm:ss'),
        creater: 'admin',
        updateTime: dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss'),
        updater: 'admin',
    },
    {
        permissionId: 'PERM003',
        deviceId: 'DEV003',
        monitorNames: ['显示器1', '显示器2', '显示器3'],
        computerName: '设计机-003',
        ipAddress: ['192.168.1.103', '192.168.1.104'],
        userId: 'U003',
        name: '王五',
        deptId: 'DEPT003',
        loginUsername: 'wangwu',
        domainStatus: 0,
        domainGroup: '',
        noDomainReason: '新设备，尚未加入域',
        smartitStatus: 1,
        noSmartitReason: '',
        usbStatus: 1,
        usbReason: '设计工作需要',
        usbExpireDate: dayjs().add(60, 'day').format('YYYY-MM-DD'),
        antivirusStatus: 0,
        noSymantecReason: '正在安装中',
        remark: '设计师，需要多显示器支持',
        createTime: dayjs().subtract(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
        creater: 'admin',
        updateTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
        updater: 'admin',
    },
    {
        permissionId: 'PERM004',
        deviceId: 'DEV004',
        monitorNames: ['显示器1'],
        computerName: '办公机-004',
        ipAddress: ['192.168.1.105'],
        userId: 'U004',
        name: '赵六',
        deptId: 'DEPT001',
        loginUsername: 'zhaoliu',
        domainStatus: 1,
        domainGroup: 'IT组',
        noDomainReason: '',
        smartitStatus: 1,
        noSmartitReason: '',
        usbStatus: 0,
        usbReason: '',
        usbExpireDate: null,
        antivirusStatus: 1,
        noSymantecReason: '',
        remark: '普通办公人员',
        createTime: dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss'),
        creater: 'admin',
        updateTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
        updater: 'admin',
    },
    {
        permissionId: 'PERM005',
        deviceId: 'DEV005',
        monitorNames: ['显示器1', '显示器2'],
        computerName: '服务器-005',
        ipAddress: ['192.168.1.106'],
        userId: 'U005',
        name: '孙七',
        deptId: 'DEPT004',
        loginUsername: 'sunqi',
        domainStatus: 1,
        domainGroup: '运维组',
        noDomainReason: '',
        smartitStatus: 1,
        noSmartitReason: '',
        usbStatus: 1,
        usbReason: '系统维护需要',
        usbExpireDate: dayjs().add(90, 'day').format('YYYY-MM-DD'),
        antivirusStatus: 1,
        noSymantecReason: '',
        remark: '运维人员，需要USB权限进行系统维护',
        createTime: dayjs().subtract(15, 'day').format('YYYY-MM-DD HH:mm:ss'),
        creater: 'admin',
        updateTime: dayjs().subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
        updater: 'admin',
    },
];

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
    // 注释掉实际API调用，使用模拟数据
    /*
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.deviceId) queryParams.append('deviceId', params.deviceId);

    const endpoint = `/permissions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return get(endpoint);
    */

    // 模拟数据 - 用于开发/演示
    return new Promise((resolve) => {
        setTimeout(() => {
            let filteredData = [...mockPermissions];

            // 应用筛选
            if (params.userId) {
                filteredData = filteredData.filter(p => p.userId.includes(params.userId!));
            }
            if (params.deviceId) {
                filteredData = filteredData.filter(p => p.deviceId.includes(params.deviceId!));
            }

            // 分页处理
            const page = params.page || 1;
            const size = params.size || 10;
            const start = (page - 1) * size;
            const end = start + size;
            const paginatedData = filteredData.slice(start, end);

            resolve({
                code: 200,
                message: '获取成功',
                data: paginatedData,
                total: filteredData.length,
                page: page,
                size: size,
            });
        }, 300);
    });
};

/**
 * 新增权限
 * @param permissionData 权限数据
 * @returns Promise
 */
export const addPermission = async (permissionData: DevicePermissionInsert): Promise<ApiResponse<any>> => {
    // 注释掉实际API调用，使用模拟数据
    /*
    return post('/permissions', permissionData);
    */

    // 模拟数据 - 用于开发/演示
    return new Promise((resolve) => {
        setTimeout(() => {
            const newPermission: DevicePermissionList = {
                permissionId: `PERM${String(mockPermissions.length + 1).padStart(3, '0')}`,
                deviceId: permissionData.deviceId,
                monitorNames: [],
                computerName: '',
                ipAddress: [],
                userId: '',
                name: '',
                deptId: '',
                loginUsername: '',
                domainStatus: permissionData.domainStatus ?? 0,
                domainGroup: permissionData.domainGroup ?? '',
                noDomainReason: permissionData.noDomainReason ?? '',
                smartitStatus: permissionData.smartitStatus ?? 0,
                noSmartitReason: permissionData.noSmartitReason ?? '',
                usbStatus: permissionData.usbStatus ?? 0,
                usbReason: permissionData.usbReason ?? '',
                usbExpireDate: permissionData.usbExpireDate ?? null,
                antivirusStatus: permissionData.antivirusStatus ?? 0,
                noSymantecReason: permissionData.noSymantecReason ?? '',
                remark: permissionData.remark ?? '',
                createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                creater: 'admin',
                updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                updater: 'admin',
            };
            mockPermissions.push(newPermission);

            resolve({
                code: 200,
                message: '权限添加成功',
            });
        }, 300);
    });
};

/**
 * 获取权限详情
 * @param permissionId 权限ID
 * @returns Promise 权限详情响应
 */
export const getPermissionById = async (permissionId: string): Promise<ApiResponse<DevicePermissionList>> => {
    // 注释掉实际API调用，使用模拟数据
    /*
    return get(`/permissions/${permissionId}`);
    */

    // 模拟数据 - 用于开发/演示
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const permission = mockPermissions.find(p => p.permissionId === permissionId);
            if (permission) {
                resolve({
                    code: 200,
                    message: '获取成功',
                    data: permission,
                });
            } else {
                reject({
                    code: 404,
                    message: '权限不存在',
                });
            }
        }, 300);
    });
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
    // 注释掉实际API调用，使用模拟数据
    /*
    return put(`/permissions/${permissionId}`, permissionData);
    */

    // 模拟数据 - 用于开发/演示
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockPermissions.findIndex(p => p.permissionId === permissionId);
            if (index !== -1) {
                // 更新权限数据
                const existingPermission = mockPermissions[index];
                mockPermissions[index] = {
                    ...existingPermission,
                    deviceId: permissionData.deviceId,
                    domainStatus: permissionData.domainStatus ?? existingPermission.domainStatus,
                    domainGroup: permissionData.domainGroup ?? existingPermission.domainGroup,
                    noDomainReason: permissionData.noDomainReason ?? existingPermission.noDomainReason,
                    smartitStatus: permissionData.smartitStatus ?? existingPermission.smartitStatus,
                    noSmartitReason: permissionData.noSmartitReason ?? existingPermission.noSmartitReason,
                    usbStatus: permissionData.usbStatus ?? existingPermission.usbStatus,
                    usbReason: permissionData.usbReason ?? existingPermission.usbReason,
                    usbExpireDate: permissionData.usbExpireDate ?? existingPermission.usbExpireDate,
                    antivirusStatus: permissionData.antivirusStatus ?? existingPermission.antivirusStatus,
                    noSymantecReason: permissionData.noSymantecReason ?? existingPermission.noSymantecReason,
                    remark: permissionData.remark ?? existingPermission.remark,
                    updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    updater: 'admin',
                };

                resolve({
                    code: 200,
                    message: '权限更新成功',
                });
            } else {
                reject({
                    code: 404,
                    message: '权限不存在',
                });
            }
        }, 300);
    });
};

/**
 * 删除权限
 * @param permissionId 权限ID
 * @returns Promise
 */
export const deletePermission = async (permissionId: string): Promise<ApiResponse<any>> => {
    // 注释掉实际API调用，使用模拟数据
    /*
    return del(`/permissions/${permissionId}`);
    */

    // 模拟数据 - 用于开发/演示
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockPermissions.findIndex(p => p.permissionId === permissionId);
            if (index !== -1) {
                mockPermissions.splice(index, 1);
                resolve({
                    code: 200,
                    message: '权限删除成功',
                });
            } else {
                reject({
                    code: 404,
                    message: '权限不存在',
                });
            }
        }, 300);
    });
};

/**
 * 导出权限列表为Excel
 * @returns Promise Blob
 */
export const exportPermissionsExcel = async (): Promise<Blob> => {
    // 注释掉实际API调用，使用模拟数据
    /*
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
    */

    // 模拟数据 - 用于开发/演示
    return new Promise((resolve) => {
        setTimeout(() => {
            // 准备Excel数据
            const excelData = mockPermissions.map(p => ({
                '权限ID': p.permissionId,
                '设备ID': p.deviceId,
                '电脑名': p.computerName,
                '用户ID': p.userId,
                '用户名': p.name,
                '登录用户名': p.loginUsername,
                'IP地址': p.ipAddress?.join(', ') || '',
                'Domain状态': p.domainStatus === 1 ? '是' : '否',
                'Domain组': p.domainGroup || '',
                '无Domain原因': p.noDomainReason || '',
                'SmartIT状态': p.smartitStatus === 1 ? '是' : '否',
                '无SmartIT原因': p.noSmartitReason || '',
                'USB状态': p.usbStatus === 1 ? '是' : '否',
                'USB原因': p.usbReason || '',
                'USB过期日期': p.usbExpireDate || '',
                '防病毒状态': p.antivirusStatus === 1 ? '是' : '否',
                '无Symantec原因': p.noSymantecReason || '',
                '备注': p.remark || '',
            }));

            // 创建工作簿
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelData);

            // 设置列宽
            const colWidths = [
                { wch: 12 }, // 权限ID
                { wch: 12 }, // 设备ID
                { wch: 15 }, // 电脑名
                { wch: 12 }, // 用户ID
                { wch: 12 }, // 用户名
                { wch: 15 }, // 登录用户名
                { wch: 20 }, // IP地址
                { wch: 12 }, // Domain状态
                { wch: 12 }, // Domain组
                { wch: 20 }, // 无Domain原因
                { wch: 15 }, // SmartIT状态
                { wch: 20 }, // 无SmartIT原因
                { wch: 12 }, // USB状态
                { wch: 20 }, // USB原因
                { wch: 15 }, // USB过期日期
                { wch: 15 }, // 防病毒状态
                { wch: 20 }, // 无Symantec原因
                { wch: 30 }, // 备注
            ];
            ws['!cols'] = colWidths;

            // 将工作表添加到工作簿
            XLSX.utils.book_append_sheet(wb, ws, '权限列表');

            // 将工作簿转换为二进制数据
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

            // 创建Blob对象
            const blob = new Blob([excelBuffer], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });

            resolve(blob);
        }, 500);
    });
};
