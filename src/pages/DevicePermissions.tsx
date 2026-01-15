import React, { useState, useEffect } from 'react';
import { Button, Card, Space, message } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Layout from '../components/common/Layout';
import PermissionSearchForm from '../components/permission/PermissionSearchForm';
import PermissionTable from '../components/permission/PermissionTable';
import PermissionDetailModal from '../components/permission/PermissionDetailModal';
import {
    getPermissions,
    getPermissionById,
    updatePermission,
    exportPermissionsExcel,
} from '../services/permission/permissionService';
import type { DevicePermissionList, DevicePermissionInsert, DictItem } from '../types';
import { useDicts } from '../hooks/useDicts';
import { useAuthStore } from '../stores/authStore';

interface PermissionFormData {
    deviceId: string;
    domainName?: string;
    domainGroup?: string;
    noDomainReason?: string;
    smartitStatus?: string;
    noSmartitReason?: string;
    usbStatus?: string;
    usbReason?: string;
    useEndDate?: dayjs.Dayjs | null;
    connectionStatus?: string;
    noSymantecReason?: string;
    remarks?: string;
}

interface SearchFormData {
    userId?: string;
    deviceId?: string;
}

const DevicePermissions: React.FC = () => {
    // 获取用户信息
    const { userInfo } = useAuthStore();
    
    // 判断是否是管理员
    const isAdmin = userInfo?.USER_TYPE_NAME?.toUpperCase() === 'ADMIN';
    
    // 获取字典数据
    const { map: dictMap } = useDicts([
        'DOMAIN_STATUS',
        'SMARTIT_STATUS',
        'USB_STATUS',
        'ANTIVIRUS_STATUS'
    ]);

    // 提取各字段的字典数据
    const domainStatusOptions = (dictMap?.['DOMAIN_STATUS'] || []) as DictItem[];
    const smartitStatusOptions = (dictMap?.['SMARTIT_STATUS'] || []) as DictItem[];
    const usbStatusOptions = (dictMap?.['USB_STATUS'] || []) as DictItem[];
    const antivirusStatusOptions = (dictMap?.['ANTIVIRUS_STATUS'] || []) as DictItem[];

    // 辅助函数：从 dictItemName 查找 dictId
    const findDictId = (options: DictItem[], dictItemName?: string) => {
        if (!dictItemName) return null;
        const it = options.find(o => o.dictItemName === dictItemName);
        return it?.dictId || null;
    };

    // 辅助函数：从 dictId 查找 dictItemName
    const findDictItemName = (options: DictItem[], dictId?: number | null) => {
        if (dictId == null) return '';
        const it = options.find(o => o.dictId === dictId);
        return it?.dictItemName || '';
    };

    const [permissions, setPermissions] = useState<DevicePermissionList[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPermission, setEditingPermission] = useState<DevicePermissionList | null>(null);
    const [pagination, setPagination] = useState({
        current: 0,
        pageSize: 10,
        total: 0,
    });

    // 加载权限列表（page从1开始）
    const loadPermissions = async (page: number = 1, size: number = 10, userId?: string, deviceId?: string) => {
        try {
            setLoading(true);
            // 如果不是管理员，自动过滤当前用户的权限
            const finalUserId = isAdmin ? userId : (userId || userInfo?.USER_ID);
            const response = await getPermissions({ page, size, userId: finalUserId, deviceId });
            console.log('获取权限列表响应:', response);
            if (response.code === 200 && response.data) {
                console.log('权限列表数据:', response.data);
                // 打印第一条数据的详细信息，检查字段是否正确
                if (response.data.length > 0) {
                    console.log('第一条权限数据详情:', {
                        permissionId: response.data[0].permissionId,
                        deviceId: response.data[0].deviceId,
                        domainStatus: response.data[0].domainStatus,
                        domainName: response.data[0].domainName,
                        domainGroup: response.data[0].domainGroup,
                        usbExpireDate: response.data[0].usbExpireDate,
                        remark: response.data[0].remark,
                    });
                }
                setPermissions(response.data);
                setPagination({
                    current: response.page || page,
                    pageSize: response.size || size,
                    total: response.total || response.data.length,
                });
            } else {
                message.error(response.message || '获取权限列表失败');
            }
        } catch (error: any) {
            console.error('获取权限列表失败:', error);
            message.error(error.message || '获取权限列表失败');
        } finally {
            setLoading(false);
        }
    };

    // 初始加载
    useEffect(() => {
        loadPermissions();
    }, []);

    // 搜索
    const onSearch = (data: SearchFormData) => {
        // 过滤空字符串，转换为 undefined
        // 如果不是管理员，不允许搜索其他用户的权限
        const userId = isAdmin ? (data.userId?.trim() || undefined) : undefined;
        const deviceId = data.deviceId?.trim() || undefined;
        loadPermissions(1, pagination.pageSize, userId, deviceId);
    };

    // 重置搜索
    const onResetSearch = () => {
        loadPermissions(1, pagination.pageSize);
    };

    // 打开编辑对话框
    const handleEdit = async (permissionId: string) => {
        try {
            setLoading(true);
            console.log('正在获取权限详情，permissionId:', permissionId);
            const response = await getPermissionById(permissionId);
            console.log('获取权限详情响应:', response);
            
            if (response.code === 200 && response.data) {
                const permission = response.data;
                console.log('权限详情数据:', permission);
                console.log('权限详情数据类型:', typeof permission);
                console.log('权限详情数据是否为null:', permission === null);
                console.log('权限详情数据是否为undefined:', permission === undefined);
                console.log('权限详情数据的所有键:', Object.keys(permission || {}));
                
                // 确保设置 editingPermission 后再打开模态框
                setEditingPermission(permission);
                // 使用 setTimeout 确保状态更新后再打开模态框
                setTimeout(() => {
                    setModalVisible(true);
                    console.log('模态框已打开，editingPermission:', permission);
                }, 0);
            } else {
                console.error('获取权限详情失败:', response);
                message.error(response.message || '获取权限详情失败');
            }
        } catch (error: any) {
            console.error('获取权限详情异常:', error);
            message.error(error.message || '获取权限详情失败');
        } finally {
            setLoading(false);
        }
    };

    // 提交表单
    const onSubmitForm = async (data: PermissionFormData) => {
        try {
            // 获取字典项对应的文本值
            const domainStatusText = data.domainName;
            const smartitStatusText = data.smartitStatus;
            const usbStatusText = data.usbStatus;
            const antivirusStatusText = data.connectionStatus;

            console.log('提交表单数据:', data);
            console.log('字典选项数量:', {
                domainStatusOptions: domainStatusOptions.length,
                smartitStatusOptions: smartitStatusOptions.length,
                usbStatusOptions: usbStatusOptions.length,
                antivirusStatusOptions: antivirusStatusOptions.length,
            });

            // 根据 dictItemName 查找对应的 dictId
            const domainStatusDictId = findDictId(domainStatusOptions, domainStatusText);
            const smartitStatusDictId = findDictId(smartitStatusOptions, smartitStatusText);
            const usbStatusDictId = findDictId(usbStatusOptions, usbStatusText);
            const antivirusStatusDictId = findDictId(antivirusStatusOptions, antivirusStatusText);

            console.log('转换后的 dictId:', {
                domainStatusText,
                domainStatusDictId,
                smartitStatusText,
                smartitStatusDictId,
                usbStatusText,
                usbStatusDictId,
                antivirusStatusText,
                antivirusStatusDictId,
            });

            // 转换表单数据为后端需要的格式
            const permissionData: DevicePermissionInsert = {
                deviceId: data.deviceId,
                // 直接使用 dictId，如果找不到则根据文本值判断（兼容处理）
                domainStatus: domainStatusDictId ?? (domainStatusText && domainStatusText !== '无' ? 1 : 0),
                domainName: domainStatusText,
                domainGroup: data.domainGroup,
                noDomainReason: data.noDomainReason,
                // 直接使用 dictId
                smartitStatus: smartitStatusDictId,
                smartitStatusText: smartitStatusText,
                noSmartitReason: data.noSmartitReason,
                // 直接使用 dictId
                usbStatus: usbStatusDictId,
                usbStatusText: usbStatusText,
                usbReason: data.usbReason,
                usbExpireDate: data.useEndDate ? data.useEndDate.format('YYYY-MM-DD') : null,
                // 直接使用 dictId
                antivirusStatus: antivirusStatusDictId,
                antivirusStatusText: antivirusStatusText,
                noSymantecReason: data.noSymantecReason,
                remark: data.remarks,
            };

            console.log('发送到后端的权限数据:', permissionData);

            // 编辑模式
            if (!editingPermission) {
                message.error('编辑权限信息不存在');
                return;
            }

            const response = await updatePermission(editingPermission.permissionId, permissionData);
            console.log('更新权限响应:', response);
            
            if (response.code === 200) {
                message.success('权限更新成功');
                setModalVisible(false);
                setEditingPermission(null);
                // 刷新列表数据
                await loadPermissions(pagination.current, pagination.pageSize);
                console.log('列表数据已刷新');
            } else {
                console.error('更新权限失败:', response);
                message.error(response.message || '权限更新失败');
            }
        } catch (error: any) {
            message.error(error.message || '权限更新失败');
        }
    };

    // 导出Excel
    const handleExport = async () => {
        try {
            setLoading(true);
            await exportPermissionsExcel();
            message.success('导出成功，文件已保存到下载文件夹');
        } catch (error: any) {
            message.error(error.message || '导出失败');
        } finally {
            setLoading(false);
        }
    };

    // 关闭对话框
    const handleModalCancel = () => {
        setModalVisible(false);
        setEditingPermission(null);
    };

    return (
        <Layout title="权限管理">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* 权限列表卡片 */}
                <Card
                    title="权限列表"
                    extra={
                        <Button icon={<ExportOutlined />} onClick={handleExport} loading={loading}>
                            导出Excel
                        </Button>
                    }
                >
                    {/* 搜索栏 */}
                    <PermissionSearchForm onSearch={onSearch} onReset={onResetSearch} isAdmin={isAdmin} />

                    {/* 表格 */}
                    <div style={{ marginTop: 16 }}>
                        <PermissionTable
                            data={permissions}
                            loading={loading}
                            pagination={pagination}
                            onPageChange={(page, pageSize) => {
                                loadPermissions(page, pageSize);
                            }}
                            onEdit={handleEdit}
                            isAdmin={isAdmin}
                        />
                    </div>
                </Card>
            </Space>

            {/* 查看详情对话框 */}
            <PermissionDetailModal
                visible={modalVisible}
                loading={loading}
                editingPermission={editingPermission}
                onCancel={handleModalCancel}
                onSubmit={onSubmitForm}
                isAdmin={isAdmin}
            />
        </Layout>
    );
};

export default DevicePermissions;
