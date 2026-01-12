import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Input,
    Space,
    Modal,
    Form,
    Select,
    DatePicker,
    message,
    Popconfirm,
    Card,
    Row,
    Col,
    Tag,
} from 'antd';
import {
    PlusOutlined,
    ExportOutlined,
    SearchOutlined,
    DeleteOutlined,
    ReloadOutlined,
    EditOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import Layout from '../components/common/Layout';
import {
    getPermissions,
    getPermissionById,
    addPermission,
    updatePermission,
    deletePermission,
    exportPermissionsExcel,
} from '../services/permission/permissionService';
import type { DevicePermissionList, DevicePermissionInsert } from '../types';

const { Option } = Select;
const { TextArea } = Input;

interface PermissionFormData {
    deviceId: string;
    domainStatus?: number | null;
    domainGroup?: string;
    noDomainReason?: string;
    smartitStatus?: number | null;
    noSmartitReason?: string;
    usbStatus?: number | null;
    usbReason?: string;
    usbExpireDate?: dayjs.Dayjs | null;
    antivirusStatus?: number | null;
    noSymantecReason?: string;
    remark?: string;
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

    const { control: searchControl, handleSubmit: handleSearchSubmit, reset: resetSearch } = useForm<SearchFormData>();
    const { control: formControl, handleSubmit: handleFormSubmit, reset: resetForm, setValue } = useForm<PermissionFormData>();

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
        loadPermissions(1, pagination.pageSize, data.userId, data.deviceId);
    };

    // 重置搜索
    const onResetSearch = () => {
        resetSearch();
        loadPermissions(1, pagination.pageSize);
    };

    // 打开新增对话框
    const handleAdd = () => {
        setEditingPermission(null);
        resetForm();
        setModalVisible(true);
    };

    // 打开编辑对话框
    const handleEdit = async (permissionId: string) => {
        try {
            setLoading(true);
            const response = await getPermissionById(permissionId);
            if (response.code === 200 && response.data) {
                const permission = response.data;
                setEditingPermission(permission);
                // 填充表单数据
                setValue('deviceId', permission.deviceId);
                setValue('domainStatus', permission.domainStatus);
                setValue('domainGroup', permission.domainGroup);
                setValue('noDomainReason', permission.noDomainReason);
                setValue('smartitStatus', permission.smartitStatus);
                setValue('noSmartitReason', permission.noSmartitReason);
                setValue('usbStatus', permission.usbStatus);
                setValue('usbReason', permission.usbReason);
                setValue('usbExpireDate', permission.usbExpireDate ? dayjs(permission.usbExpireDate) : null);
                setValue('antivirusStatus', permission.antivirusStatus);
                setValue('noSymantecReason', permission.noSymantecReason);
                setValue('remark', permission.remark);
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
            const permissionData: DevicePermissionInsert = {
                deviceId: data.deviceId,
                domainStatus: data.domainStatus !== undefined ? Number(data.domainStatus) : null,
                domainGroup: data.domainGroup,
                noDomainReason: data.noDomainReason,
                smartitStatus: data.smartitStatus !== undefined ? Number(data.smartitStatus) : null,
                noSmartitReason: data.noSmartitReason,
                usbStatus: data.usbStatus !== undefined ? Number(data.usbStatus) : null,
                usbReason: data.usbReason,
                usbExpireDate: data.usbExpireDate ? data.usbExpireDate.format('YYYY-MM-DD') : null,
                antivirusStatus: data.antivirusStatus !== undefined ? Number(data.antivirusStatus) : null,
                noSymantecReason: data.noSymantecReason,
                remark: data.remark,
            };

            if (editingPermission) {
                // 编辑模式
                const response = await updatePermission(editingPermission.permissionId, permissionData);
                if (response.code === 200) {
                    message.success('权限更新成功');
                    setModalVisible(false);
                    resetForm();
                    setEditingPermission(null);
                    loadPermissions(pagination.current, pagination.pageSize);
                } else {
                    message.error(response.message || '权限更新失败');
                }
            } else {
                // 新增模式
                const response = await addPermission(permissionData);
                if (response.code === 200) {
                    message.success('权限添加成功');
                    setModalVisible(false);
                    resetForm();
                    loadPermissions(pagination.current, pagination.pageSize);
                } else {
                    message.error(response.message || '权限添加失败');
                }
            }
        } catch (error: any) {
            message.error(error.message || (editingPermission ? '权限更新失败' : '权限添加失败'));
        }
    };

    // 删除权限
    const handleDelete = async (permissionId: string) => {
        try {
            const response = await deletePermission(permissionId);
            if (response.code === 200) {
                message.success('权限删除成功');
                loadPermissions(pagination.current, pagination.pageSize);
            } else {
                message.error(response.message || '权限删除失败');
            }
        } catch (error: any) {
            message.error(error.message || '权限删除失败');
        }
    };

    // 导出Excel
    const handleExport = async () => {
        try {
            setLoading(true);
            const blob = await exportPermissionsExcel();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `权限列表_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            message.success('导出成功');
        } catch (error: any) {
            message.error(error.message || '导出失败');
        } finally {
            setLoading(false);
        }
    };

    // 表格列定义
    const columns: ColumnsType<DevicePermissionList> = [
        {
            title: '权限ID',
            dataIndex: 'permissionId',
            key: 'permissionId',
            width: 120,
            fixed: 'left',
        },
        {
            title: '设备ID',
            dataIndex: 'deviceId',
            key: 'deviceId',
            width: 120,
        },
        {
            title: '电脑名',
            dataIndex: 'computerName',
            key: 'computerName',
            width: 150,
        },
        {
            title: '用户ID',
            dataIndex: 'userId',
            key: 'userId',
            width: 120,
        },
        {
            title: '用户名',
            dataIndex: 'name',
            key: 'name',
            width: 120,
        },
        {
            title: '登录用户名',
            dataIndex: 'loginUsername',
            key: 'loginUsername',
            width: 120,
        },
        {
            title: 'IP地址',
            dataIndex: 'ipAddress',
            key: 'ipAddress',
            width: 150,
            render: (ips: string[]) => (ips && ips.length > 0 ? ips.join(', ') : '-'),
        },
        {
            title: 'Domain状态',
            dataIndex: 'domainStatus',
            key: 'domainStatus',
            width: 100,
            render: (status: number) => (
                <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '是' : '否'}</Tag>
            ),
        },
        {
            title: 'Domain组',
            dataIndex: 'domainGroup',
            key: 'domainGroup',
            width: 120,
        },
        {
            title: 'SmartIT状态',
            dataIndex: 'smartitStatus',
            key: 'smartitStatus',
            width: 120,
            render: (status: number) => (
                <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '是' : '否'}</Tag>
            ),
        },
        {
            title: 'USB状态',
            dataIndex: 'usbStatus',
            key: 'usbStatus',
            width: 100,
            render: (status: number) => (
                <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '是' : '否'}</Tag>
            ),
        },
        {
            title: 'USB过期日期',
            dataIndex: 'usbExpireDate',
            key: 'usbExpireDate',
            width: 120,
            render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
        },
        {
            title: '防病毒状态',
            dataIndex: 'antivirusStatus',
            key: 'antivirusStatus',
            width: 120,
            render: (status: number) => (
                <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '是' : '否'}</Tag>
            ),
        },
        {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
            width: 200,
            ellipsis: true,
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 180,
            render: (time: string) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'),
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record.permissionId)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这条权限吗？"
                        onConfirm={() => handleDelete(record.permissionId)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />} size="small">
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Layout title="权限管理">
            <Card>
                {/* 搜索栏 */}
                <Form layout="inline" onFinish={handleSearchSubmit(onSearch)} style={{ marginBottom: 16 }}>
                    <Form.Item label="用户ID">
                        <Controller
                            name="userId"
                            control={searchControl}
                            render={({ field }) => <Input {...field} placeholder="请输入用户ID" style={{ width: 150 }} />}
                        />
                    </Form.Item>
                    <Form.Item label="设备ID">
                        <Controller
                            name="deviceId"
                            control={searchControl}
                            render={({ field }) => <Input {...field} placeholder="请输入设备ID" style={{ width: 150 }} />}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                                搜索
                            </Button>
                            <Button onClick={onResetSearch} icon={<ReloadOutlined />}>
                                重置
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>

                {/* 操作栏 */}
                <Row justify="space-between" style={{ marginBottom: 16 }}>
                    <Col>
                        <Space>
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                                新增权限
                            </Button>
                            <Button icon={<ExportOutlined />} onClick={handleExport}>
                                导出Excel
                            </Button>
                        </Space>
                    </Col>
                </Row>

                {/* 表格 */}
                <Table
                    columns={columns}
                    dataSource={permissions}
                    rowKey="permissionId"
                    loading={loading}
                    scroll={{ x: 2000 }}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => `共 ${total} 条`,
                        onChange: (page, pageSize) => {
                            loadPermissions(page, pageSize);
                        },
                        onShowSizeChange: (current, size) => {
                            loadPermissions(1, size);
                        },
                    }}
                />
            </Card>

            {/* 新增/编辑对话框 */}
            <Modal
                title={editingPermission ? '编辑权限' : '新增权限'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    resetForm();
                    setEditingPermission(null);
                }}
                footer={null}
                width={800}
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    onFinish={handleFormSubmit(onSubmitForm)}
                    style={{ marginTop: 20 }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="设备ID" required>
                                <Controller
                                    name="deviceId"
                                    control={formControl}
                                    rules={{ required: '请输入设备ID' }}
                                    render={({ field, fieldState: { error } }) => (
                                        <>
                                            <Input {...field} placeholder="请输入设备ID" disabled={!!editingPermission} />
                                            {error && <div style={{ color: 'red', fontSize: '12px', marginTop: 4 }}>{error.message}</div>}
                                        </>
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Domain状态">
                                <Controller
                                    name="domainStatus"
                                    control={formControl}
                                    render={({ field }) => (
                                        <Select {...field} placeholder="请选择" allowClear>
                                            <Option value={1}>是</Option>
                                            <Option value={0}>否</Option>
                                        </Select>
                                    )}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Domain组">
                                <Controller
                                    name="domainGroup"
                                    control={formControl}
                                    render={({ field }) => <Input {...field} placeholder="请输入Domain组" />}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="SmartIT状态">
                                <Controller
                                    name="smartitStatus"
                                    control={formControl}
                                    render={({ field }) => (
                                        <Select {...field} placeholder="请选择" allowClear>
                                            <Option value={1}>是</Option>
                                            <Option value={0}>否</Option>
                                        </Select>
                                    )}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="无Domain原因">
                        <Controller
                            name="noDomainReason"
                            control={formControl}
                            render={({ field }) => <TextArea {...field} placeholder="请输入无Domain原因" rows={2} />}
                        />
                    </Form.Item>

                    <Form.Item label="无SmartIT原因">
                        <Controller
                            name="noSmartitReason"
                            control={formControl}
                            render={({ field }) => <TextArea {...field} placeholder="请输入无SmartIT原因" rows={2} />}
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="USB状态">
                                <Controller
                                    name="usbStatus"
                                    control={formControl}
                                    render={({ field }) => (
                                        <Select {...field} placeholder="请选择" allowClear>
                                            <Option value={1}>是</Option>
                                            <Option value={0}>否</Option>
                                        </Select>
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="USB过期日期">
                                <Controller
                                    name="usbExpireDate"
                                    control={formControl}
                                    render={({ field }) => (
                                        <DatePicker
                                            {...field}
                                            style={{ width: '100%' }}
                                            format="YYYY-MM-DD"
                                            value={field.value ? dayjs(field.value) : null}
                                            onChange={(date) => field.onChange(date)}
                                        />
                                    )}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="USB原因">
                        <Controller
                            name="usbReason"
                            control={formControl}
                            render={({ field }) => <TextArea {...field} placeholder="请输入USB原因" rows={2} />}
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="防病毒状态">
                                <Controller
                                    name="antivirusStatus"
                                    control={formControl}
                                    render={({ field }) => (
                                        <Select {...field} placeholder="请选择" allowClear>
                                            <Option value={1}>是</Option>
                                            <Option value={0}>否</Option>
                                        </Select>
                                    )}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="无Symantec原因">
                        <Controller
                            name="noSymantecReason"
                            control={formControl}
                            render={({ field }) => <TextArea {...field} placeholder="请输入无Symantec原因" rows={2} />}
                        />
                    </Form.Item>

                    <Form.Item label="备注">
                        <Controller
                            name="remark"
                            control={formControl}
                            render={({ field }) => <TextArea {...field} placeholder="请输入备注" rows={3} />}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                提交
                            </Button>
                            <Button
                                onClick={() => {
                                    setModalVisible(false);
                                    resetForm();
                                    setEditingPermission(null);
                                }}
                            >
                                取消
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default DevicePermissions;
