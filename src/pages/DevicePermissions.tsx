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
    IdcardOutlined,
    LaptopOutlined,
    UsbOutlined,
    CalendarOutlined,
    BankOutlined,
    TeamOutlined,
    SafetyOutlined,
    ExclamationCircleOutlined,
    SettingOutlined,
    EyeOutlined,
    FileTextOutlined,
    FolderOpenOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useForm, Controller, useWatch } from 'react-hook-form';
import dayjs from 'dayjs';
import Layout from '../components/common/Layout';
import {
    getPermissions,
    getPermissionById,
    updatePermission,
    exportPermissionsExcel,
} from '../services/permission/permissionService';
import type { DevicePermissionList, DevicePermissionInsert } from '../types';

import './DevicePermissions.css';

const { Option } = Select;

const COMPACT_FORM_ITEM_STYLE = {
    marginBottom: 6,
} as const;

const LABEL_STYLE = {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    color: '#434343',
    fontWeight: 500,
    fontSize: '13px',
    marginBottom: 2
} as const;

const VALUE_STYLE = {
    color: '#262626',
    fontWeight: 400,
    fontSize: '13px'
} as const;

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
    const { control: formControl, handleSubmit: handleFormSubmit, reset: resetForm, setValue, formState: { errors } } = useForm<PermissionFormData>();
    const domainNameValue = useWatch({ control: formControl, name: 'domainName' });
    const smartitStatusValue = useWatch({ control: formControl, name: 'smartitStatus' });
    const connectionStatusValue = useWatch({ control: formControl, name: 'connectionStatus' });
    const usbStatusValue = useWatch({ control: formControl, name: 'usbStatus' });

    useEffect(() => {
        if (domainNameValue === '无') {
            setValue('domainGroup', '');
        } else if (domainNameValue && domainNameValue !== '') {
            setValue('noDomainReason', '');
        }
    }, [domainNameValue, setValue]);

    useEffect(() => {
        if (smartitStatusValue !== '未安装') {
            setValue('noSmartitReason', '');
        }
    }, [smartitStatusValue, setValue]);

    useEffect(() => {
        if (connectionStatusValue !== '无连接') {
            setValue('noSymantecReason', '');
        }
    }, [connectionStatusValue, setValue]);

    useEffect(() => {
        if (usbStatusValue !== '数据' && usbStatusValue !== '3G网卡') {
            setValue('usbReason', '');
            setValue('useEndDate', null);
        }
    }, [usbStatusValue, setValue]);

    // 加载权限列表
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

    useEffect(() => {
        loadPermissions();
    }, []);

    // 搜索
    const onSearch = (data: SearchFormData) => {
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
                setValue('domainName', permission.domainName || '');
                setValue('domainGroup', permission.domainGroup || '');
                setValue('noDomainReason', permission.noDomainReason || '');
                setValue('smartitStatus', permission.smartitStatus === 1 ? '本地' : permission.smartitStatus === 0 ? '未安装' : '');
                setValue('noSmartitReason', permission.noSmartitReason || '');
                setValue('usbStatus', permission.usbStatus === 1 ? '数据' : permission.usbStatus === 0 ? '关闭' : '');
                setValue('usbReason', permission.usbReason || '');
                setValue('useEndDate', permission.usbExpireDate ? dayjs(permission.usbExpireDate) : null);
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
            const permissionData: DevicePermissionInsert = {
                deviceId: data.deviceId,
                domainStatus: data.domainName && data.domainName !== '无' ? 1 : 0,
                domainName: data.domainName,
                domainGroup: data.domainGroup,
                noDomainReason: data.noDomainReason,
                smartitStatus: data.smartitStatus === '本地' || data.smartitStatus === '远程' ? 1 : data.smartitStatus === '未安装' ? 0 : null,
                smartitStatusText: data.smartitStatus,
                noSmartitReason: data.noSmartitReason,
                usbStatus: data.usbStatus === '数据' || data.usbStatus === '3G网卡' ? 1 : data.usbStatus === '关闭' ? 0 : null,
                usbStatusText: data.usbStatus,
                usbReason: data.usbReason,
                usbExpireDate: data.useEndDate ? data.useEndDate.format('YYYY-MM-DD') : null,
                antivirusStatus: data.connectionStatus === '自动' ? 1 : data.connectionStatus === '手动' ? 0 : null,
                antivirusStatusText: data.connectionStatus,
                noSymantecReason: data.noSymantecReason,
                remark: data.remarks,
            };

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
            title: 'IP地址',
            dataIndex: 'ipAddress',
            key: 'ipAddress',
            width: 150,
            render: (ips: string[]) => (ips && ips.length > 0 ? ips.join(', ') : '-'),
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
            title: '部门',
            dataIndex: 'deptId',
            key: 'deptId',
            width: 120,
        },
        {
            title: 'Domain状态',
            dataIndex: 'domainName',
            key: 'domainName',
            width: 120,
            render: (domainName: string) => domainName ? <Tag color="blue">{domainName}</Tag> : '-',
        },
        {
            title: 'SmartIT状态',
            dataIndex: 'smartitStatus',
            key: 'smartitStatus',
            width: 120,
            render: (_: number, record: DevicePermissionList) => {
                const statusText = record.smartitStatusText;
                if (statusText) {
                    const color = statusText === '本地' || statusText === '远程' ? 'green' :
                        statusText === '未安装' ? 'red' : 'orange';
                    return <Tag color={color}>{statusText}</Tag>;
                } else {
                    const status = record.smartitStatus;
                    if (status === 1) return <Tag color="green">本地</Tag>;
                    if (status === 0) return <Tag color="red">未安装</Tag>;
                    return <Tag>-</Tag>;
                }
            },
        },
        {
            title: 'USB状态',
            dataIndex: 'usbStatus',
            key: 'usbStatus',
            width: 100,
            render: (_: number, record: DevicePermissionList) => {
                const statusText = record.usbStatusText;
                if (statusText) {
                    const color = statusText === '数据' || statusText === '3G网卡' ? 'green' :
                        statusText === '关闭' ? 'red' : 'orange';
                    return <Tag color={color}>{statusText}</Tag>;
                } else {
                    const status = record.usbStatus;
                    if (status === 1) return <Tag color="green">数据</Tag>;
                    if (status === 0) return <Tag color="red">关闭</Tag>;
                    return <Tag>-</Tag>;
                }
            },
        },
        {
            title: '防病毒状态',
            dataIndex: 'antivirusStatus',
            key: 'antivirusStatus',
            width: 120,
            render: (status: number, record: DevicePermissionList) => {
                let statusText = record.antivirusStatusText;
                let color = 'default';

                if (!statusText) {
                    if (status === 1) {
                        statusText = '自动';
                        color = 'green';
                    } else if (status === 0) {
                        statusText = '手动';
                        color = 'orange';
                    } else {
                        statusText = '-';
                    }
                } else {
                    if (statusText === '自动') color = 'green';
                    else if (statusText === '手动') color = 'orange';
                }
                return <Tag color={color}>{statusText || '-'}</Tag>;
            },
        },
        {
            title: '操作',
            key: 'action',
            width: 110,
            fixed: 'right',
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => handleEdit(record.permissionId)}
                    className="action-column-button"
                >
                    查看详情
                </Button>
            ),
        },
    ];

    return (
        <Layout title="设备权限管理">
            <Card
                title={
                    <div className="card-header-title">
                        <SettingOutlined className="icon-blue" />
                        <span>权限管理</span>
                    </div>
                }
                bordered={false}
                headStyle={{ borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}
            >
                {/* 搜索栏 */}
                <div className="search-area">
                    <Form layout="inline" onFinish={handleSearchSubmit(onSearch)}>
                        <Row gutter={16} align="middle">
                            <Col>
                                <Form.Item label="用户ID">
                                    <Controller
                                        name="userId"
                                        control={searchControl}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="请输入用户ID"
                                                style={{ width: 180 }}
                                                allowClear
                                                size="small"
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col>
                                <Form.Item label="设备ID">
                                    <Controller
                                        name="deviceId"
                                        control={searchControl}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="请输入设备ID"
                                                style={{ width: 180 }}
                                                allowClear
                                                size="small"
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<SearchOutlined />}
                                        htmlType="submit"
                                        className="search-button"
                                        size="small"
                                    >
                                        搜索
                                    </Button>
                                    <Button
                                        onClick={onResetSearch}
                                        icon={<ReloadOutlined />}
                                        className="search-button"
                                        size="small"
                                    >
                                        重置
                                    </Button>
                                    <Button
                                        icon={<ExportOutlined />}
                                        onClick={handleExport}
                                        className="search-button"
                                        size="small"
                                    >
                                        导出Excel
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </Form>
                </div>

                {/* 表格 */}
                <div>
                    <Table
                        columns={columns}
                        dataSource={permissions}
                        rowKey="permissionId"
                        loading={loading}
                        scroll={{ x: 1500 }}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total) => `共 ${total} 条记录`,
                            onChange: (page, pageSize) => loadPermissions(page, pageSize),
                            onShowSizeChange: (_current, size) => loadPermissions(1, size),
                            style: { marginTop: 12 }
                        }}
                        bordered
                        size="small"
                        className="custom-table"
                    />
                </div>
            </Card>

            {/* 设备权限详情模态框 */}
            <Modal
                title={
                    <div className="modal-title">
                        <FileTextOutlined className="icon-blue" />
                        <span>{`设备权限详情 - ${editingPermission?.permissionId || ''}`}</span>
                    </div>
                }
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    resetForm();
                    setEditingPermission(null);
                }}
                footer={null}
                width={725}
                confirmLoading={loading}
                style={{ top: 20 }}
                bodyStyle={{ padding: '12px 16px', maxHeight: '80vh', overflowY: 'auto' }}
                destroyOnClose
                className="device-permission-modal"
            >
                <Form
                    layout="vertical"
                    onFinish={handleFormSubmit(onSubmitForm)}
                    style={{ padding: '4px 0' }}
                >
                    {/* 设备基本信息区域 */}
                    <Card
                        title={
                            <div className="card-header-title">
                                <FolderOpenOutlined className="icon-green" />
                                <span style={{ color: '#52c41a' }}>设备基本信息</span>
                            </div>
                        }
                        size="small"
                        style={{ marginBottom: 12 }}
                        headStyle={{ background: 'linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)', padding: '8px 12px', borderRadius: '6px 6px 0 0', borderBottom: '1px solid #b5f5ec', fontSize: '14px', fontWeight: 600, color: '#08979c' }}
                        bodyStyle={{ padding: '12px', background: '#ffffff', borderRadius: '0 0 6px 6px' }}
                        bordered={false}
                    >
                        <Descriptions
                            column={2}
                            size="small"
                            labelStyle={LABEL_STYLE}
                            contentStyle={VALUE_STYLE}
                        >
                            <Descriptions.Item label={<><IdcardOutlined />设备ID</>} >
                                <strong>{editingPermission?.deviceId || '-'}</strong>
                            </Descriptions.Item>
                            <Descriptions.Item label={<><LaptopOutlined />电脑名</>}>
                                {editingPermission?.computerName || '-'}
                            </Descriptions.Item>
                            {/*<Descriptions.Item label={<><GlobalOutlined />IP地址</>}>*/}
                            {/*    {editingPermission?.ipAddress*/}
                            {/*        ? (Array.isArray(editingPermission.ipAddress)*/}
                            {/*            ? editingPermission.ipAddress.join(', ')*/}
                            {/*            : editingPermission.ipAddress)*/}
                            {/*        : '-'}*/}
                            {/*</Descriptions.Item>*/}
                        </Descriptions>
                    </Card>

                    {/* 权限配置信息区域 */}
                    <Card
                        title={
                            <div className="card-header-title">
                                <SettingOutlined className="icon-blue" />
                                <span style={{ color: '#1890ff' }}>权限配置信息</span>
                            </div>
                        }
                        size="small"
                        style={{ marginBottom: 12 }}
                        headStyle={{ background: 'linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)', padding: '8px 12px', borderRadius: '6px 6px 0 0', borderBottom: '1px solid #b5f5ec', fontSize: '14px', fontWeight: 600, color: '#08979c' }}
                        bodyStyle={{ padding: '12px', background: '#ffffff', borderRadius: '0 0 6px 6px' }}
                        bordered={false}
                    >
                        {/* 域配置和SmartIT配置在同一行 */}
                        <div className="section-block">
                            <Row gutter={16}>
                                {/* 域配置 */}
                                <Col span={12}>
                                    <div className="section-title">
                                        <span>域配置</span>
                                    </div>
                                    <Row gutter={8} align="middle">
                                        <Col span={12}>
                                            <Form.Item
                                                label={<span className="form-label"><BankOutlined />域名</span>}
                                                style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                            >
                                                <Controller
                                                    name="domainName"
                                                    control={formControl}
                                                    render={({ field }) => (
                                                        <Select
                                                            {...field}
                                                            style={{ width: '100%' }}
                                                            placeholder="请选择域名"
                                                            size="small"
                                                            allowClear
                                                        >
                                                            <Option value="无">无</Option>
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

                                        {domainNameValue && domainNameValue !== '' && domainNameValue !== '无' && (
                                            <Col span={12}>
                                                <Form.Item
                                                    label={<span className="form-label"><TeamOutlined />域内组名</span>}
                                                    validateStatus={errors.domainGroup ? 'error' : undefined}
                                                    help={errors.domainGroup?.message}
                                                    style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                                >
                                                    <Controller
                                                        name="domainGroup"
                                                        control={formControl}
                                                        rules={{
                                                            required: '请填写域内组名',
                                                            maxLength: { value: 50, message: '最大50个字符' }
                                                        }}
                                                        render={({ field }) => (
                                                            <Input
                                                                {...field}
                                                                placeholder="请输入域内组名"
                                                                allowClear
                                                                size="small"
                                                            />
                                                        )}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        )}

                                        {domainNameValue === '无' && (
                                            <Col span={12}>
                                                <Form.Item
                                                    label={<span className="form-label"><ExclamationCircleOutlined className="icon-orange" />不加域理由</span>}
                                                    validateStatus={errors.noDomainReason ? 'error' : undefined}
                                                    help={errors.noDomainReason?.message}
                                                    style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                                >
                                                    <Controller
                                                        name="noDomainReason"
                                                        control={formControl}
                                                        rules={{
                                                            required: '请填写不加域理由',
                                                            maxLength: { value: 20, message: '最大20个字符' }
                                                        }}
                                                        render={({ field }) => (
                                                            <Input.TextArea
                                                                {...field}
                                                                placeholder="请填写不加域理由"
                                                                rows={1}
                                                                showCount
                                                                maxLength={20}
                                                                size="small"
                                                            />
                                                        )}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        )}
                                    </Row>
                                </Col>

                                {/* SmartIT配置 */}
                                <Col span={12}>
                                    <div className="section-title">
                                        <span>SmartIT配置</span>
                                    </div>
                                    <Row gutter={8} align="middle">
                                        <Col span={12}>
                                            <Form.Item
                                                label={<span className="form-label"><SafetyOutlined />状态</span>}
                                                style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                            >
                                                <Controller
                                                    name="smartitStatus"
                                                    control={formControl}
                                                    render={({ field }) => (
                                                        <Select
                                                            {...field}
                                                            style={{ width: '100%' }}
                                                            placeholder="请选择状态"
                                                            size="small"
                                                            allowClear
                                                        >
                                                            <Option value="本地">本地</Option>
                                                            <Option value="远程">远程</Option>
                                                            <Option value="未安装">未安装</Option>
                                                        </Select>
                                                    )}
                                                />
                                            </Form.Item>
                                        </Col>

                                        {smartitStatusValue === '未安装' && (
                                            <Col span={12}>
                                                <Form.Item
                                                    label={<span className="form-label"><ExclamationCircleOutlined className="icon-orange" />不安装理由</span>}
                                                    validateStatus={errors.noSmartitReason ? 'error' : undefined}
                                                    help={errors.noSmartitReason?.message}
                                                    style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                                >
                                                    <Controller
                                                        name="noSmartitReason"
                                                        control={formControl}
                                                        rules={{
                                                            required: '请填写不安装理由',
                                                            maxLength: { value: 20, message: '最大20个字符' }
                                                        }}
                                                        render={({ field }) => (
                                                            <Input.TextArea
                                                                {...field}
                                                                placeholder="请填写不安装理由"
                                                                rows={1}
                                                                showCount
                                                                maxLength={20}
                                                                size="small"
                                                            />
                                                        )}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        )}
                                    </Row>
                                </Col>
                            </Row>
                        </div>

                        {/* USB配置 */}
                        <div className="section-block">
                            <div className="section-title">
                                <span>USB配置</span>
                            </div>
                            <Row gutter={8} align="middle">
                                <Col span={8}>
                                    <Form.Item
                                        label={<span className="form-label"><UsbOutlined />USB状态</span>}
                                        style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                    >
                                        <Controller
                                            name="usbStatus"
                                            control={formControl}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    style={{ width: '100%' }}
                                                    placeholder="请选择状态"
                                                    size="small"
                                                    allowClear
                                                >
                                                    <Option value="关闭">关闭</Option>
                                                    <Option value="数据">数据</Option>
                                                    <Option value="3G网卡">3G网卡</Option>
                                                </Select>
                                            )}
                                        />
                                    </Form.Item>
                                </Col>

                                {(usbStatusValue === '数据' || usbStatusValue === '3G网卡') && (
                                    <>
                                        <Col span={8}>
                                            <Form.Item
                                                label={<span className="form-label"><ExclamationCircleOutlined className="icon-orange" />开通理由</span>}
                                                validateStatus={errors.usbReason ? 'error' : undefined}
                                                help={errors.usbReason?.message}
                                                style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                            >
                                                <Controller
                                                    name="usbReason"
                                                    control={formControl}
                                                    rules={{
                                                        required: '请填写USB开通理由',
                                                        maxLength: { value: 20, message: '最大20个字符' }
                                                    }}
                                                    render={({ field }) => (
                                                        <Input.TextArea
                                                            {...field}
                                                            placeholder="请填写开通理由"
                                                            rows={1}
                                                            showCount
                                                            maxLength={20}
                                                            size="small"
                                                        />
                                                    )}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item
                                                label={<span className="form-label"><CalendarOutlined />使用截止日期</span>}
                                                validateStatus={errors.useEndDate ? 'error' : undefined}
                                                help={errors.useEndDate?.message}
                                                style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                            >
                                                <Controller
                                                    name="useEndDate"
                                                    control={formControl}
                                                    rules={{
                                                        required: usbStatusValue === '数据' || usbStatusValue === '3G网卡' ? '请选择截止日期' : false
                                                    }}
                                                    render={({ field }) => (
                                                        <DatePicker
                                                            {...field}
                                                            style={{ width: '100%' }}
                                                            placeholder="请选择日期"
                                                            format="YYYY-MM-DD"
                                                            allowClear={false}
                                                            size="small"
                                                        />
                                                    )}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </>
                                )}
                            </Row>
                        </div>

                        {/* 防病毒配置 */}
                        <div className="section-block">
                            <div className="section-title">
                                <span>防病毒配置</span>
                            </div>
                            <Row gutter={8} align="middle">
                                <Col span={8}>
                                    <Form.Item
                                        label={<span className="form-label"><SafetyOutlined />连接状态</span>}
                                        style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                    >
                                        <Controller
                                            name="connectionStatus"
                                            control={formControl}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    style={{ width: '100%' }}
                                                    placeholder="请选择状态"
                                                    size="small"
                                                    allowClear
                                                >
                                                    <Option value="无连接">无连接</Option>
                                                    <Option value="自动">自动</Option>
                                                    <Option value="手动">手动</Option>
                                                </Select>
                                            )}
                                        />
                                    </Form.Item>
                                </Col>

                                {connectionStatusValue === '无连接' && (
                                    <Col span={8}>
                                        <Form.Item
                                            label={<span className="form-label"><ExclamationCircleOutlined className="icon-orange" />无Symantec理由</span>}
                                            validateStatus={errors.noSymantecReason ? 'error' : undefined}
                                            help={errors.noSymantecReason?.message}
                                            style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                        >
                                            <Controller
                                                name="noSymantecReason"
                                                control={formControl}
                                                rules={{
                                                    required: '请填写无Symantec理由',
                                                    maxLength: { value: 20, message: '最大20个字符' }
                                                }}
                                                render={({ field }) => (
                                                    <Input.TextArea
                                                        {...field}
                                                        placeholder="请填写无Symantec理由"
                                                        rows={1}
                                                        showCount
                                                        maxLength={20}
                                                        size="small"
                                                    />
                                                )}
                                            />
                                        </Form.Item>
                                    </Col>
                                )}
                            </Row>
                        </div>

                        {/* 备注信息 */}
                        <div className="section-block">
                            <div className="section-title">
                                <ExclamationCircleOutlined className="icon-orange" />
                                <span>备注</span>
                            </div>
                            <Row gutter={8}>
                                <Col span={18}>
                                    <Form.Item
                                        validateStatus={errors.remarks ? 'error' : undefined}
                                        help={errors.remarks?.message}
                                        style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                    >
                                        <Controller
                                            name="remarks"
                                            control={formControl}
                                            rules={{ maxLength: { value: 200, message: '最大200个字符' } }}
                                            render={({ field }) => (
                                                <Input.TextArea
                                                    {...field}
                                                    placeholder="请输入备注信息"
                                                    rows={1}
                                                    showCount
                                                    maxLength={200}
                                                    style={{ resize: 'vertical', width: '100%' }}
                                                    size="small"
                                                />
                                            )}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    </Card>

                    {/* 操作按钮 */}
                    <div style={{
                        paddingTop: 12,
                        borderTop: '1px solid #f0f0f0',
                        textAlign: 'center'
                    }}>
                        <Space size="middle">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                size="middle"
                                className="action-button"
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
                                className="action-button"
                            >
                                取消
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Modal>
        </Layout>
    );
};

export default DevicePermissions;