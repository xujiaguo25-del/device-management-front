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
    Card,
    Row,
    Col,
    Tag,
    Descriptions,
} from 'antd';
import {
    ExportOutlined,
    SearchOutlined,
    ReloadOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import Layout from '../components/common/Layout';
import {
    getPermissions,
    getPermissionById,
    updatePermission,
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
        // 过滤空字符串，转换为 undefined
        const userId = data.userId?.trim() || undefined;
        const deviceId = data.deviceId?.trim() || undefined;
        loadPermissions(1, pagination.pageSize, userId, deviceId);
    };

    // 重置搜索
    const onResetSearch = () => {
        resetSearch();
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

            // 编辑模式
            if (!editingPermission) {
                message.error('编辑权限信息不存在');
                return;
            }

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
            title: '操作',
            key: 'action',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => handleEdit(record.permissionId)}
                >
                    查看详情
                </Button>
            ),
        },
    ];

    return (
        <Layout title="权限管理">
            <Card>
                {/* 搜索栏 */}
                <div style={{ marginBottom: 16 }}>
                    <Space>
                        <Form.Item label="用户ID" style={{ marginBottom: 0 }}>
                            <Controller
                                name="userId"
                                control={searchControl}
                                render={({ field }) => <Input {...field} placeholder="请输入用户ID" style={{ width: 150 }} />}
                            />
                        </Form.Item>
                        <Form.Item label="设备ID" style={{ marginBottom: 0 }}>
                            <Controller
                                name="deviceId"
                                control={searchControl}
                                render={({ field }) => <Input {...field} placeholder="请输入设备ID" style={{ width: 150 }} />}
                            />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0 }}>
                            <Space>
                                <Button 
                                    type="primary" 
                                    icon={<SearchOutlined />}
                                    onClick={handleSearchSubmit(onSearch)}
                                >
                                    搜索
                                </Button>
                                <Button onClick={onResetSearch} icon={<ReloadOutlined />}>
                                    重置
                                </Button>
                            </Space>
                        </Form.Item>
                    </Space>
                </div>

                {/* 表格 */}
                <div>
                    {/* 导出按钮 - 放在表格右上角（操作列上方） */}
                    <Row justify="end" style={{ marginBottom: 8 }}>
                        <Button icon={<ExportOutlined />} onClick={handleExport}>
                            导出Excel
                        </Button>
                    </Row>
                    <style>{`
                        .ant-pagination {
                            display: flex !important;
                            justify-content: center !important;
                        }
                    `}</style>
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
                            onShowSizeChange: (_current, size) => {
                                loadPermissions(1, size);
                            },
                        }}
                    />
                </div>
            </Card>

            {/* 查看详情对话框 */}
            <Modal
                title={`设备权限详情 - ${editingPermission?.deviceId || ''}`}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    resetForm();
                    setEditingPermission(null);
                }}
                footer={null}
                width={1000}
                style={{ top: 20 }}
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    onFinish={handleFormSubmit(onSubmitForm)}
                >
                    {/* 设备基本信息区域 - 不可编辑 */}
                    <Card
                        title="设备基本信息"
                        size="small"
                        style={{ marginBottom: 24 }}
                        bordered={false}
                    >
                        <Descriptions column={2} bordered size="small">
                            <Descriptions.Item label="权限ID" span={2}>
                                {editingPermission?.permissionId || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="设备ID" span={2}>
                                {editingPermission?.deviceId || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="电脑名">
                                {editingPermission?.computerName || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="IP地址">
                                {editingPermission?.ipAddress && editingPermission.ipAddress.length > 0 
                                    ? editingPermission.ipAddress.join(', ') 
                                    : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="用户ID">
                                {editingPermission?.userId || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="用户名">
                                {editingPermission?.name || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="登录用户名">
                                {editingPermission?.loginUsername || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="部门ID">
                                {editingPermission?.deptId || '-'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* 可编辑区域 */}
                    <Card
                        title="权限配置信息"
                        size="small"
                        style={{ marginBottom: 24 }}
                        bordered={false}
                    >
                        {/* 域相关配置 */}
                        <div style={{ marginBottom: 20 }}>
                            <h4 style={{ marginBottom: 12, color: '#1890ff' }}>域配置</h4>
                            <Row gutter={24} style={{ marginBottom: 16 }}>
                                <Col span={6}>
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
                                <Col span={6}>
                                    <Form.Item label="Domain组">
                                        <Controller
                                            name="domainGroup"
                                            control={formControl}
                                            render={({ field }) => <Input {...field} placeholder="请输入Domain组" />}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="无Domain原因">
                                        <Controller
                                            name="noDomainReason"
                                            control={formControl}
                                            render={({ field }) => <TextArea {...field} placeholder="如设备无需加入域，请填写理由" rows={2} />}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* SmartIT配置 */}
                        <div style={{ marginBottom: 20 }}>
                            <h4 style={{ marginBottom: 12, color: '#1890ff' }}>SmartIT配置</h4>
                            <Row gutter={24} style={{ marginBottom: 16 }}>
                                <Col span={6}>
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
                                <Col span={18}>
                                    <Form.Item label="无SmartIT原因">
                                        <Controller
                                            name="noSmartitReason"
                                            control={formControl}
                                            render={({ field }) => <TextArea {...field} placeholder="如不安装SmartIT，请填写理由" rows={2} />}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* USB配置 */}
                        <div style={{ marginBottom: 20 }}>
                            <h4 style={{ marginBottom: 12, color: '#1890ff' }}>USB配置</h4>
                            <Row gutter={24} style={{ marginBottom: 16 }}>
                                <Col span={6}>
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
                                <Col span={8}>
                                    <Form.Item label="USB原因">
                                        <Controller
                                            name="usbReason"
                                            control={formControl}
                                            render={({ field }) => <TextArea {...field} placeholder="如开通USB权限，请填写理由" rows={2} />}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label="USB过期日期">
                                        <Controller
                                            name="usbExpireDate"
                                            control={formControl}
                                            render={({ field }) => (
                                                <DatePicker
                                                    {...field}
                                                    style={{ width: '100%' }}
                                                    format="YYYY-MM-DD"
                                                    placeholder="截止日期"
                                                    value={field.value ? dayjs(field.value) : null}
                                                    onChange={(date) => field.onChange(date)}
                                                />
                                            )}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* 防病毒配置 */}
                        <div style={{ marginBottom: 20 }}>
                            <h4 style={{ marginBottom: 12, color: '#1890ff' }}>防病毒配置</h4>
                            <Row gutter={24} style={{ marginBottom: 16 }}>
                                <Col span={6}>
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
                                <Col span={18}>
                                    <Form.Item label="无Symantec原因">
                                        <Controller
                                            name="noSymantecReason"
                                            control={formControl}
                                            render={({ field }) => <TextArea {...field} placeholder="如未安装Symantec防病毒软件，请填写理由" rows={2} />}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* 备注 */}
                        <div style={{ marginBottom: 20 }}>
                            <h4 style={{ marginBottom: 12, color: '#1890ff' }}>备注</h4>
                            <Form.Item
                                name="remark"
                            >
                                <Controller
                                    name="remark"
                                    control={formControl}
                                    render={({ field }) => <TextArea {...field} placeholder="请输入备注信息" rows={2} style={{ width: '70%' }} />}
                                />
                            </Form.Item>
                        </div>
                    </Card>

                    {/* 操作按钮 */}
                    <Row gutter={24} style={{ marginTop: 24 }}>
                        <Col span={12}>
                            <Space size="middle">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    size="middle"
                                >
                                    更新
                                </Button>
                                <Button
                                    onClick={() => {
                                        setModalVisible(false);
                                        resetForm();
                                        setEditingPermission(null);
                                    }}
                                    size="middle"
                                >
                                    取消
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </Layout>
    );
};

export default DevicePermissions;
