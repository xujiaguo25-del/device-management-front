/**
 * 权限管理相关服务
 */

// import { get, post, del, request } from '../api';
import type { DevicePermissionList, DevicePermissionInsert, ApiResponse } from '../../types';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

// 模拟数据
const mockPermissions: DevicePermissionList[] = [
    {
        permissionId: 'PERM001',
        deviceId: 'DEV001',
        monitorNames: ['显示器1', '显示器2'],
        computerName: '开发机-001',
        ipAddress: ['192.168.1.100', '192.168.1.101'],
        userId: 'U001',
        name: '用户001',
        deptId: 'DEPT001',
        loginUsername: 'user001',
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
        name: '用户002',
        deptId: 'DEPT002',
        loginUsername: 'user002',
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
        name: '用户003',
        deptId: 'DEPT003',
        loginUsername: 'user003',
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
        name: '用户004',
        deptId: 'DEPT001',
        loginUsername: 'user004',
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
        name: '用户005',
        deptId: 'DEPT004',
        loginUsername: 'user005',
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
    // 添加更多测试数据用于分页测试
    ...Array.from({ length: 45 }, (_, i) => {
        const num = i + 6;
        const statusVariants = [
            { smartit: '本地', usb: '数据', antivirus: '自动', domain: 1 },
            { smartit: '远程', usb: '3G网卡', antivirus: '自动', domain: 1 },
            { smartit: '未安装', usb: '关闭', antivirus: '手动', domain: 0 },
            { smartit: '本地', usb: '关闭', antivirus: '自动', domain: 1 },
            { smartit: '远程', usb: '数据', antivirus: '自动', domain: 1 },
        ];
        const variant = statusVariants[i % statusVariants.length];
        const deptIds = ['DEPT001', 'DEPT002', 'DEPT003', 'DEPT004', 'DEPT005'];
        const deptNames = ['IT组', '测试组', '设计组', '运维组', '产品组'];
        const deptIndex = i % deptIds.length;
        
        // 生成有效的IP地址（确保不超过255）
        const ipLastOctet = 100 + (num % 155); // 100-254范围
        const ipAddress = num % 4 === 0 
            ? [`192.168.1.${ipLastOctet}`, `192.168.1.${ipLastOctet + 1}`]
            : [`192.168.1.${ipLastOctet}`];
        
        // 生成显示器列表
        const monitorCount = num % 3 === 0 ? 2 : (num % 5 === 0 ? 3 : 1);
        const monitorNames = Array.from({ length: monitorCount }, (_, idx) => `显示器${idx + 1}`);
        
        // 详情框中的域名选项列表（详情框中原有的选项）
        const domainOptions = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'EU', 'MG', 'EQU', 'NRI-01', 'MS'];
        const selectedDomain = variant.domain === 1 ? domainOptions[num % domainOptions.length] : '';
        
        return {
            permissionId: `PERM${String(num).padStart(3, '0')}`,
            deviceId: `DEV${String(num).padStart(3, '0')}`,
            monitorNames: monitorNames,
            computerName: `${deptNames[deptIndex]}-${String(num).padStart(3, '0')}`,
            ipAddress: ipAddress,
            userId: `U${String(num).padStart(3, '0')}`,
            name: `用户${String(num).padStart(3, '0')}`,
            deptId: deptIds[deptIndex],
            loginUsername: `user${String(num).padStart(3, '0')}`,
            domainStatus: variant.domain,
            domainName: selectedDomain,
            domainGroup: variant.domain === 1 ? `${deptNames[deptIndex]}域组` : '',
            noDomainReason: variant.domain === 0 ? '新设备，尚未加入域' : '',
            smartitStatus: variant.smartit === '未安装' ? 0 : 1,
            smartitStatusText: variant.smartit,
            noSmartitReason: variant.smartit === '未安装' ? '设备型号不支持SmartIT' : '',
            usbStatus: variant.usb === '关闭' ? 0 : 1,
            usbStatusText: variant.usb,
            usbReason: variant.usb === '关闭' ? '' : (variant.usb === '3G网卡' ? '需要移动网络访问' : '工作需要数据传输'),
            usbExpireDate: variant.usb === '关闭' ? null : dayjs().add(30 + (i % 60), 'day').format('YYYY-MM-DD'),
            antivirusStatus: variant.antivirus === '自动' ? 1 : 0,
            antivirusStatusText: variant.antivirus,
            noSymantecReason: variant.antivirus === '手动' ? '正在配置自动更新规则' : '',
            remark: `${deptNames[deptIndex]} - 用户${String(num).padStart(3, '0')}使用的设备，${variant.smartit}安装SmartIT`,
            createTime: dayjs().subtract(20 + (i % 30), 'day').subtract(i % 24, 'hour').format('YYYY-MM-DD HH:mm:ss'),
            creater: 'admin',
            updateTime: dayjs().subtract(5 + (i % 10), 'day').subtract(i % 12, 'hour').format('YYYY-MM-DD HH:mm:ss'),
            updater: 'admin',
        } as DevicePermissionList;
    }),
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
                '权限ID', '设备ID', '电脑名', 'IP地址', '用户ID', '用户名', '部门', 
                '登录用户名', 'Domain状态', 'Domain组', 'SmartIT状态', 'USB状态', 'USB过期日期',
                '防病毒状态', '备注'
            ];

            // 准备Excel数据
            const excelData = mockPermissions.map(p => [
                p.permissionId,
                p.deviceId,
                p.computerName,
                p.ipAddress?.join(', ') || '',
                p.userId,
                p.name,
                p.deptId || '',
                p.loginUsername,
                p.domainName || '', // Domain状态显示domainName
                p.domainGroup || '',
                p.smartitStatusText || '', // SmartIT状态使用文本值
                p.usbStatusText || '', // USB状态使用文本值
                p.usbExpireDate || '', // USB过期日期
                p.antivirusStatusText || '', // 防病毒状态使用文本值
                p.remark || '', // 备注
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

            // 注意：xlsx-js-style 不支持冻结行功能，已移除 !freeze 属性

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
