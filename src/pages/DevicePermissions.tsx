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
                // 填充表单数据，转换数据格式以匹配表单
                setValue('deviceId', permission.deviceId);
                setValue('domainName', ''); // 域名需要从后端获取或设置默认值
                setValue('domainGroup', permission.domainGroup || '');
                setValue('noDomainReason', permission.noDomainReason || '');
                // 转换 smartitStatus: 1->'本地', 0->'未安装'，或其他映射
                setValue('smartitStatus', permission.smartitStatus === 1 ? '本地' : permission.smartitStatus === 0 ? '未安装' : '');
                setValue('noSmartitReason', permission.noSmartitReason || '');
                // 转换 usbStatus: 1->'数据', 0->'关闭'，或其他映射
                setValue('usbStatus', permission.usbStatus === 1 ? '数据' : permission.usbStatus === 0 ? '关闭' : '');
                setValue('usbReason', permission.usbReason || '');
                setValue('useEndDate', permission.usbExpireDate ? dayjs(permission.usbExpireDate) : null);
                // 转换 antivirusStatus: 1->'自动', 0->'手动'，或其他映射
                setValue('connectionStatus', permission.antivirusStatus === 1 ? '自动' : permission.antivirusStatus === 0 ? '手动' : '');
                setValue('noSymantecReason', permission.noSymantecReason || '');
                setValue('remarks', permission.remark || '');
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
                domainStatus: null, // 根据域名或其他逻辑设置
                domainGroup: data.domainGroup,
                noDomainReason: data.noDomainReason,
                // 转换 smartitStatus: '本地'->1, '远程'->1, '未安装'->0
                smartitStatus: data.smartitStatus === '本地' || data.smartitStatus === '远程' ? 1 : data.smartitStatus === '未安装' ? 0 : null,
                noSmartitReason: data.noSmartitReason,
                // 转换 usbStatus: '数据'->1, '3G网卡'->1, '关闭'->0
                usbStatus: data.usbStatus === '数据' || data.usbStatus === '3G网卡' ? 1 : data.usbStatus === '关闭' ? 0 : null,
                usbReason: data.usbReason,
                usbExpireDate: data.useEndDate ? data.useEndDate.format('YYYY-MM-DD') : null,
                // 转换 connectionStatus: '自动'->1, '手动'->0
                antivirusStatus: data.connectionStatus === '自动' ? 1 : data.connectionStatus === '手动' ? 0 : null,
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
                    message.info('已取消编辑');
                    setModalVisible(false);
                    resetForm();
                    setEditingPermission(null);
                }}
                footer={null}
                width={1000}
                confirmLoading={loading}
                style={{ top: 20 }}
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    onFinish={handleFormSubmit(onSubmitForm)}
                    initialValues={{ remember: true }}
                >
                    {/* 设备基本信息区域 - 不可编辑 */}
                    <Card
                        title="设备基本信息"
                        size="small"
                        style={{ marginBottom: 24 }}
                        bordered={false}
                    >
                        <Descriptions column={2} bordered size="small">
                            <Descriptions.Item label="设备ID" span={2}>
                                {editingPermission?.deviceId || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="主机设备编号">
                                -
                            </Descriptions.Item>
                            <Descriptions.Item label="电脑名">
                                {editingPermission?.computerName || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="主机型号">
                                -
                            </Descriptions.Item>
                            <Descriptions.Item label="所在项目">
                                -
                            </Descriptions.Item>
                            <Descriptions.Item label="所在开发室">
                                -
                            </Descriptions.Item>
                            <Descriptions.Item label="登录用户编号">
                                {editingPermission?.userId || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="登录用户名">
                                {editingPermission?.loginUsername || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="部门">
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
                                    <Form.Item
                                        label="域名："
                                        name="domainName"
                                    >
                                        <Controller
                                            name="domainName"
                                            control={formControl}
                                            render={({ field }) => (
                                                <Select {...field} placeholder="请选择">
                                                    <Option value="D1">D1</Option>
                                                    <Option value="D2">D2</Option>
                                                    <Option value="D3">D3</Option>
                                                    <Option value="D4">D4</Option>
                                                    <Option value="D5">D5</Option>
                                                    <Option value="D6">D6</Option>
                                                    <Option value="D7">D7</Option>
                                                    <Option value="EU">EU</Option>
                                                    <Option value="MG">MG</Option>
                                                    <Option value="EQU">EQU</Option>
                                                    <Option value="NRI-01">NRI-01</Option>
                                                    <Option value="MS">MS</Option>
                                                </Select>
                                            )}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        label="域内组名："
                                        name="domainGroup"
                                        rules={[
                                            { max: 50, message: '域内组名长度不能超过50个字符！' }
                                        ]}
                                    >
                                        <Controller
                                            name="domainGroup"
                                            control={formControl}
                                            render={({ field }) => <Input {...field} placeholder="请输入域内组名" />}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="不加域理由："
                                        name="noDomainReason"
                                        rules={[
                                            { max: 200, message: '不加域理由长度不能超过200个字符！' }
                                        ]}
                                    >
                                        <Controller
                                            name="noDomainReason"
                                            control={formControl}
                                            render={({ field }) => <TextArea {...field} rows={2} placeholder="如设备无需加入域，请填写理由" />}
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
                                    <Form.Item
                                        label="SmartIT状态："
                                        name="smartitStatus"
                                    >
                                        <Controller
                                            name="smartitStatus"
                                            control={formControl}
                                            render={({ field }) => (
                                                <Select {...field} placeholder="请选择">
                                                    <Option value="本地">本地</Option>
                                                    <Option value="远程">远程</Option>
                                                    <Option value="未安装">未安装</Option>
                                                </Select>
                                            )}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="不安装SmartIT理由："
                                        name="noSmartitReason"
                                        rules={[
                                            { max: 200, message: '不安装SmartIT理由长度不能超过200个字符！' }
                                        ]}
                                    >
                                        <Controller
                                            name="noSmartitReason"
                                            control={formControl}
                                            render={({ field }) => <TextArea {...field} rows={2} placeholder="如不安装SmartIT，请填写理由" />}
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
                                    <Form.Item
                                        label="USB状态："
                                        name="usbStatus"
                                    >
                                        <Controller
                                            name="usbStatus"
                                            control={formControl}
                                            render={({ field }) => (
                                                <Select {...field} placeholder="请选择">
                                                    <Option value="关闭">关闭</Option>
                                                    <Option value="数据">数据</Option>
                                                    <Option value="3G网卡">3G网卡</Option>
                                                </Select>
                                            )}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="USB开通理由："
                                        name="usbReason"
                                        rules={[
                                            { max: 200, message: 'USB开通理由长度不能超过200个字符！' }
                                        ]}
                                    >
                                        <Controller
                                            name="usbReason"
                                            control={formControl}
                                            render={({ field }) => <TextArea {...field} rows={2} placeholder="如开通USB权限，请填写理由" />}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        label="使用截止日期："
                                        name="useEndDate"
                                    >
                                        <Controller
                                            name="useEndDate"
                                            control={formControl}
                                            render={({ field }) => (
                                                <DatePicker
                                                    {...field}
                                                    style={{ width: '100%' }}
                                                    placeholder="截止日期"
                                                    format="YYYY-MM-DD"
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
                                    <Form.Item
                                        label="连接状态："
                                        name="connectionStatus"
                                    >
                                        <Controller
                                            name="connectionStatus"
                                            control={formControl}
                                            render={({ field }) => (
                                                <Select {...field} placeholder="请选择">
                                                    <Option value="自动">自动</Option>
                                                    <Option value="手动">手动</Option>
                                                </Select>
                                            )}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="无Symantec理由："
                                        name="noSymantecReason"
                                        rules={[
                                            { max: 200, message: '理由长度不能超过200个字符！' }
                                        ]}
                                    >
                                        <Controller
                                            name="noSymantecReason"
                                            control={formControl}
                                            render={({ field }) => <TextArea {...field} rows={2} placeholder="如未安装Symantec防病毒软件，请填写理由" />}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* 备注 */}
                        <div style={{ marginBottom: 20 }}>
                            <h4 style={{ marginBottom: 12, color: '#1890ff' }}>备注</h4>
                            <Form.Item
                                name="remarks"
                                rules={[
                                    { max: 500, message: '备注长度不能超过500个字符！' }
                                ]}
                            >
                                <Controller
                                    name="remarks"
                                    control={formControl}
                                    render={({ field }) => <TextArea {...field} rows={2} placeholder="请输入备注信息" style={{ width: '70%' }} />}
                                />
                            </Form.Item>
                        </div>
                    </Card>

                    {/* 操作按钮和更新信息 */}
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
                                        message.info('已取消编辑');
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
