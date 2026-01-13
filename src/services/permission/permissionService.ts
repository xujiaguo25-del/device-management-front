/**
 * 权限管理相关服务
 */

// import { get, post, del, request } from '../api';
import type { DevicePermissionList, DevicePermissionInsert, ApiResponse } from '../../types';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import {get} from '../api'

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
        domainName: 'D1',
        domainGroup: 'IT组',
        noDomainReason: '',
        smartitStatus: 1,
        smartitStatusText: '本地',
        noSmartitReason: '',
        usbStatus: 1,
        usbStatusText: '数据',
        usbReason: '工作需要',
        usbExpireDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
        antivirusStatus: 1,
        antivirusStatusText: '自动',
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
        domainName: 'D2',
        domainGroup: '测试组',
        noDomainReason: '',
        smartitStatus: 0,
        smartitStatusText: '未安装',
        noSmartitReason: '设备不支持',
        usbStatus: 0,
        usbStatusText: '关闭',
        usbReason: '',
        usbExpireDate: null,
        antivirusStatus: 1,
        antivirusStatusText: '自动',
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
        domainName: '',
        domainGroup: '',
        noDomainReason: '新设备，尚未加入域',
        smartitStatus: 1,
        smartitStatusText: '远程',
        noSmartitReason: '',
        usbStatus: 1,
        usbStatusText: '3G网卡',
        usbReason: '设计工作需要',
        usbExpireDate: dayjs().add(60, 'day').format('YYYY-MM-DD'),
        antivirusStatus: 0,
        antivirusStatusText: '手动',
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
        domainName: 'D3',
        domainGroup: 'IT组',
        noDomainReason: '',
        smartitStatus: 1,
        smartitStatusText: '本地',
        noSmartitReason: '',
        usbStatus: 0,
        usbStatusText: '关闭',
        usbReason: '',
        usbExpireDate: null,
        antivirusStatus: 1,
        antivirusStatusText: '自动',
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
        domainName: 'D4',
        domainGroup: '运维组',
        noDomainReason: '',
        smartitStatus: 1,
        smartitStatusText: '本地',
        noSmartitReason: '',
        usbStatus: 1,
        usbStatusText: '数据',
        usbReason: '系统维护需要',
        usbExpireDate: dayjs().add(90, 'day').format('YYYY-MM-DD'),
        antivirusStatus: 1,
        antivirusStatusText: '自动',
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
    
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.deviceId) queryParams.append('deviceId', params.deviceId);

    const endpoint = `/permissions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return get(endpoint);
    

    // 模拟数据 - 用于开发/演示
    // return new Promise((resolve) => {
    //     setTimeout(() => {
    //         let filteredData = [...mockPermissions];

    //         // 应用筛选
    //         if (params.userId) {
    //             filteredData = filteredData.filter(p => p.userId.includes(params.userId!));
    //         }
    //         if (params.deviceId) {
    //             filteredData = filteredData.filter(p => p.deviceId.includes(params.deviceId!));
    //         }

    //         // 分页处理
    //         const page = params.page || 1;
    //         const size = params.size || 10;
    //         const start = (page - 1) * size;
    //         const end = start + size;
    //         const paginatedData = filteredData.slice(start, end);

    //         resolve({
    //             code: 200,
    //             message: '获取成功',
    //             data: paginatedData,
    //             total: filteredData.length,
    //             page: page,
    //             size: size,
    //         });
    //     }, 300);
    // });
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
                    domainName: permissionData.domainName ?? existingPermission.domainName,
                    domainGroup: permissionData.domainGroup ?? existingPermission.domainGroup,
                    noDomainReason: permissionData.noDomainReason ?? existingPermission.noDomainReason,
                    smartitStatus: permissionData.smartitStatus ?? existingPermission.smartitStatus,
                    smartitStatusText: permissionData.smartitStatusText ?? existingPermission.smartitStatusText,
                    noSmartitReason: permissionData.noSmartitReason ?? existingPermission.noSmartitReason,
                    usbStatus: permissionData.usbStatus ?? existingPermission.usbStatus,
                    usbStatusText: permissionData.usbStatusText ?? existingPermission.usbStatusText,
                    usbReason: permissionData.usbReason ?? existingPermission.usbReason,
                    usbExpireDate: permissionData.usbExpireDate ?? existingPermission.usbExpireDate,
                    antivirusStatus: permissionData.antivirusStatus ?? existingPermission.antivirusStatus,
                    antivirusStatusText: permissionData.antivirusStatusText ?? existingPermission.antivirusStatusText,
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
 * 导出权限列表为Excel（美化版）
 * 直接保存到下载文件夹，用户可以选择保存到桌面
 */
export const exportPermissionsExcel = async (): Promise<void> => {
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

    const blob = await response.blob();
    const fileName = `权限列表_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;
    saveAs(blob, fileName);
    return;
    */

    // 模拟数据 - 用于开发/演示
    return new Promise((resolve) => {
        setTimeout(() => {
            // 准备表头
            const headers = [
                '权限ID', '设备ID', '电脑名', '用户ID', '用户名', '登录用户名',
                'IP地址', 'Domain状态', 'Domain组', '无Domain原因',
                'SmartIT状态', '无SmartIT原因', 'USB状态', 'USB原因', 'USB过期日期',
                '防病毒状态', '无Symantec原因', '备注'
            ];

            // 准备Excel数据
            const excelData = mockPermissions.map(p => [
                p.permissionId,
                p.deviceId,
                p.computerName,
                p.userId,
                p.name,
                p.loginUsername,
                p.ipAddress?.join(', ') || '',
                p.domainStatus === 1 ? '是' : '否',
                p.domainGroup || '',
                p.noDomainReason || '',
                p.smartitStatus === 1 ? '是' : '否',
                p.noSmartitReason || '',
                p.usbStatus === 1 ? '是' : '否',
                p.usbReason || '',
                p.usbExpireDate || '',
                p.antivirusStatus === 1 ? '是' : '否',
                p.noSymantecReason || '',
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
                    
                    // 状态列特殊处理（是/否）
                    const colIndex = C;
                    if ([7, 10, 12, 15].includes(colIndex)) { // Domain状态、SmartIT状态、USB状态、防病毒状态
                        const value = ws[cellAddress].v;
                        if (value === '是') {
                            ws[cellAddress].s = {
                                ...cellStyle,
                                fill: { fgColor: { rgb: 'C6EFCE' } }, // 浅绿色
                                font: { color: { rgb: '006100' } } // 深绿色文字
                            };
                        } else if (value === '否') {
                            ws[cellAddress].s = {
                                ...cellStyle,
                                fill: { fgColor: { rgb: 'FFC7CE' } }, // 浅红色
                                font: { color: { rgb: '9C0006' } } // 深红色文字
                            };
                        }
                    }
                }
            }

            // 冻结首行
            ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };

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

            resolve();
        }, 500);
    });
};
