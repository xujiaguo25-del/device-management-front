import React from 'react';
import { Modal, Form, Card, Row, Col, Button, Space, Input, Select, DatePicker, Descriptions, message } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import type { DevicePermissionList, DevicePermissionInsert } from '../../types';

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

interface PermissionDetailModalProps {
    visible: boolean;
    loading: boolean;
    editingPermission: DevicePermissionList | null;
    onCancel: () => void;
    onSubmit: (data: PermissionFormData) => Promise<void>;
}

const PermissionDetailModal: React.FC<PermissionDetailModalProps> = ({
    visible,
    loading,
    editingPermission,
    onCancel,
    onSubmit,
}) => {
    const { control, handleSubmit, reset, setValue } = useForm<PermissionFormData>();

    const handleFormSubmit = handleSubmit(async (data) => {
        await onSubmit(data);
    });

    const handleCancel = () => {
        message.info('已取消编辑');
        onCancel();
        reset();
    };

    // 当编辑权限数据变化时，更新表单值
    React.useEffect(() => {
        if (editingPermission && visible) {
            setValue('deviceId', editingPermission.deviceId);
            setValue('domainName', editingPermission.domainName || '');
            setValue('domainGroup', editingPermission.domainGroup || '');
            setValue('noDomainReason', editingPermission.noDomainReason || '');
            // 优先使用 smartitStatusText，如果没有则根据 smartitStatus 转换
            const smartitStatusValue = editingPermission.smartitStatusText || 
                (editingPermission.smartitStatus === 1 ? '本地' : editingPermission.smartitStatus === 0 ? '未安装' : '');
            setValue('smartitStatus', smartitStatusValue);
            setValue('noSmartitReason', editingPermission.noSmartitReason || '');
            // 优先使用 usbStatusText，如果没有则根据 usbStatus 转换
            const usbStatusValue = editingPermission.usbStatusText || 
                (editingPermission.usbStatus === 1 ? '数据' : editingPermission.usbStatus === 0 ? '关闭' : '');
            setValue('usbStatus', usbStatusValue);
            setValue('usbReason', editingPermission.usbReason || '');
            setValue('useEndDate', editingPermission.usbExpireDate ? dayjs(editingPermission.usbExpireDate) : null);
            // 优先使用 antivirusStatusText，如果没有则根据 antivirusStatus 转换
            const antivirusStatusValue = editingPermission.antivirusStatusText || 
                (editingPermission.antivirusStatus === 1 ? '自动' : editingPermission.antivirusStatus === 0 ? '手动' : '');
            setValue('connectionStatus', antivirusStatusValue);
            setValue('noSymantecReason', editingPermission.noSymantecReason || '');
            setValue('remarks', editingPermission.remark || '');
        }
    }, [editingPermission, visible, setValue]);

    return (
        <Modal
            title={`设备权限详情 - ${editingPermission?.deviceId || ''}`}
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={1000}
            confirmLoading={loading}
            style={{ top: 20 }}
            destroyOnClose
        >
            <Form
                layout="vertical"
                onFinish={handleFormSubmit}
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
                        <Descriptions.Item label="登录用户ID">
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
                                        control={control}
                                        render={({ field }) => (
                                            <Select 
                                                {...field} 
                                                placeholder="请选择"
                                                value={field.value}
                                                onChange={field.onChange}
                                                allowClear
                                            >
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
                                        control={control}
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
                                        control={control}
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
                                        control={control}
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
                                        control={control}
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
                                        control={control}
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
                                        control={control}
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
                                        control={control}
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
                                        control={control}
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
                                        control={control}
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
                                control={control}
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
                                onClick={handleCancel}
                                size="middle"
                            >
                                取消
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default PermissionDetailModal;
