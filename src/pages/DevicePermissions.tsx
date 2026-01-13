import React, { useState, useEffect } from 'react';
import { Button, Card, Row, message } from 'antd';
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
import type { DevicePermissionList, DevicePermissionInsert } from '../types';

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
            const response = await getPermissions({ page, size, userId, deviceId });
            if (response.code === 200 && response.data) {
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
        const userId = data.userId?.trim() || undefined;
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
            const response = await getPermissionById(permissionId);
            if (response.code === 200 && response.data) {
                const permission = response.data;
                setEditingPermission(permission);
                setModalVisible(true);
            } else {
                message.error(response.message || '获取权限详情失败');
            }
        } catch (error: any) {
            message.error(error.message || '获取权限详情失败');
        } finally {
            setLoading(false);
        }
    };

    // 提交表单
    const onSubmitForm = async (data: PermissionFormData) => {
        try {
            // 转换表单数据为后端需要的格式
            const permissionData: DevicePermissionInsert = {
                deviceId: data.deviceId,
                domainStatus: data.domainName ? 1 : 0, // 有域名则设置为1，否则为0
                domainName: data.domainName,
                domainGroup: data.domainGroup,
                noDomainReason: data.noDomainReason,
                // 转换 smartitStatus: '本地'->1, '远程'->1, '未安装'->0
                smartitStatus: data.smartitStatus === '本地' || data.smartitStatus === '远程' ? 1 : data.smartitStatus === '未安装' ? 0 : null,
                smartitStatusText: data.smartitStatus, // 保存文本值
                noSmartitReason: data.noSmartitReason,
                // 转换 usbStatus: '数据'->1, '3G网卡'->1, '关闭'->0
                usbStatus: data.usbStatus === '数据' || data.usbStatus === '3G网卡' ? 1 : data.usbStatus === '关闭' ? 0 : null,
                usbStatusText: data.usbStatus, // 保存文本值
                usbReason: data.usbReason,
                usbExpireDate: data.useEndDate ? data.useEndDate.format('YYYY-MM-DD') : null,
                // 转换 connectionStatus: '自动'->1, '手动'->0
                antivirusStatus: data.connectionStatus === '自动' ? 1 : data.connectionStatus === '手动' ? 0 : null,
                antivirusStatusText: data.connectionStatus, // 保存文本值
                noSymantecReason: data.noSymantecReason,
                remark: data.remarks,
            };

            // 编辑模式
            if (!editingPermission) {
                message.error('编辑权限信息不存在');
                return;
            }

            const response = await updatePermission(editingPermission.permissionId, permissionData);
            if (response.code === 200) {
                message.success('权限更新成功');
                setModalVisible(false);
                setEditingPermission(null);
                loadPermissions(pagination.current, pagination.pageSize);
            } else {
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
            <Card>
                {/* 搜索栏 */}
                <PermissionSearchForm onSearch={onSearch} onReset={onResetSearch} />

                {/* 表格 */}
                <div>
                    {/* 导出按钮 - 放在表格右上角（操作列上方） */}
                    <Row justify="end" style={{ marginBottom: 8 }}>
                        <Button icon={<ExportOutlined />} onClick={handleExport}>
                            导出Excel
                        </Button>
                    </Row>
                    <PermissionTable
                        data={permissions}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={(page, pageSize) => {
                            loadPermissions(page, pageSize);
                        }}
                        onEdit={handleEdit}
                    />
                </div>
            </Card>

            {/* 查看详情对话框 */}
            <PermissionDetailModal
                visible={modalVisible}
                loading={loading}
                editingPermission={editingPermission}
                onCancel={handleModalCancel}
                onSubmit={onSubmitForm}
            />
        </Layout>
    );
};

export default DevicePermissions;
