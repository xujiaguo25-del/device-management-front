import React from 'react';
import { Modal, Form, Card, Row, Col, Button, Space, Input, Select, DatePicker, Descriptions, message } from 'antd';
import {
    FileTextOutlined,
    FolderOpenOutlined,
    BankOutlined,
    TeamOutlined,
    SafetyOutlined,
    UsbOutlined,
    CalendarOutlined,
    ExclamationCircleOutlined,
    SettingOutlined,
    IdcardOutlined,
    LaptopOutlined,
} from '@ant-design/icons';
import { Controller, useForm, useWatch } from 'react-hook-form';
import dayjs from 'dayjs';
import type { DevicePermissionList, DevicePermissionInsert, DictItem } from '../../types';
import { useDicts } from '../../hooks/useDicts';
import './PermissionDetailModal.css';

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
    domainStatus?: number | null;
    domainGroup?: string;
    noDomainReason?: string;
    smartitStatus?: number | null;
    noSmartitReason?: string;
    usbStatus?: number | null;
    usbReason?: string;
    useEndDate?: dayjs.Dayjs | null;
    connectionStatus?: number | null;
    noSymantecReason?: string;
    remarks?: string;
}

// 用于传递给父组件的接口（保持向后兼容）
interface PermissionFormDataForParent {
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
    onSubmit: (data: PermissionFormDataForParent) => Promise<void>;
    isAdmin?: boolean;
}

const PermissionDetailModal: React.FC<PermissionDetailModalProps> = ({
    visible,
    loading,
    editingPermission,
    onCancel,
    onSubmit,
    isAdmin = true,
}) => {
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

    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<PermissionFormData>();
    
    // 用于标记是否正在初始化表单（避免初始化时清空数据库值）
    const isInitializingRef = React.useRef(false);
    
    const domainStatusValue = useWatch({ control, name: 'domainStatus' });
    const smartitStatusValue = useWatch({ control, name: 'smartitStatus' });
    const connectionStatusValue = useWatch({ control, name: 'connectionStatus' });
    const usbStatusValue = useWatch({ control, name: 'usbStatus' });

    // 获取当前选中值的文本
    const domainStatusText = findDictItemName(domainStatusOptions, domainStatusValue);
    const smartitStatusText = findDictItemName(smartitStatusOptions, smartitStatusValue);
    const usbStatusText = findDictItemName(usbStatusOptions, usbStatusValue);
    const connectionStatusText = findDictItemName(antivirusStatusOptions, connectionStatusValue);

    const handleFormSubmit = handleSubmit(async (data) => {
        // 如果不是管理员，阻止提交
        if (!isAdmin) {
            message.warning('您没有权限更新设备权限信息');
            return;
        }
        
        // 将 dictId 转换为 dictItemName，以保持与父组件的接口兼容
        const dataForParent: PermissionFormDataForParent = {
            deviceId: data.deviceId,
            domainName: findDictItemName(domainStatusOptions, data.domainStatus),
            domainGroup: data.domainGroup,
            noDomainReason: data.noDomainReason,
            smartitStatus: findDictItemName(smartitStatusOptions, data.smartitStatus),
            noSmartitReason: data.noSmartitReason,
            usbStatus: findDictItemName(usbStatusOptions, data.usbStatus),
            usbReason: data.usbReason,
            useEndDate: data.useEndDate,
            connectionStatus: findDictItemName(antivirusStatusOptions, data.connectionStatus),
            noSymantecReason: data.noSymantecReason,
            remarks: data.remarks,
        };
        await onSubmit(dataForParent);
    });

    const handleCancel = () => {
        onCancel();
        reset();
    };

    // 当字段值变化时，清空相关字段（仅在用户修改时，不在初始化时）
    React.useEffect(() => {
        // 如果正在初始化，不执行清空操作
        if (isInitializingRef.current) return;
        
        if (domainStatusText === '未参加' || domainStatusText === '无') {
            setValue('domainGroup', '');
        } else if (domainStatusValue && domainStatusText !== '未参加' && domainStatusText !== '无') {
            setValue('noDomainReason', '');
        }
    }, [domainStatusValue, domainStatusText, setValue]);

    React.useEffect(() => {
        // 如果正在初始化，不执行清空操作
        if (isInitializingRef.current) return;
        
        if (smartitStatusText !== '未インストール' && smartitStatusText !== '未安装') {
            setValue('noSmartitReason', '');
        }
    }, [smartitStatusValue, smartitStatusText, setValue]);

    React.useEffect(() => {
        // 如果正在初始化，不执行清空操作
        if (isInitializingRef.current) return;
        
        if (connectionStatusText !== '未インストール' && connectionStatusText !== '无连接') {
            setValue('noSymantecReason', '');
        }
    }, [connectionStatusValue, connectionStatusText, setValue]);

    React.useEffect(() => {
        // 如果正在初始化，不执行清空操作
        if (isInitializingRef.current) return;
        
        if (usbStatusText !== '許可' && usbStatusText !== '一時許可' && usbStatusText !== '数据' && usbStatusText !== '3G网卡') {
            setValue('usbReason', '');
            setValue('useEndDate', null);
        }
    }, [usbStatusValue, usbStatusText, setValue]);

    // 当编辑权限数据变化时，更新表单值 - 使用 dictId
    React.useEffect(() => {
        if (editingPermission && visible) {
            // 标记正在初始化，避免其他 useEffect 清空数据库值
            isInitializingRef.current = true;
            
            console.log('初始化详情表单，editingPermission 完整对象:', JSON.stringify(editingPermission, null, 2));
            console.log('editingPermission 的所有键:', Object.keys(editingPermission));
            console.log('关键字段值:', {
                domainStatus: editingPermission.domainStatus,
                domainName: editingPermission.domainName,
                domainGroup: editingPermission.domainGroup,
                smartitStatus: editingPermission.smartitStatus,
                smartitStatusText: editingPermission.smartitStatusText,
                usbStatus: editingPermission.usbStatus,
                usbStatusText: editingPermission.usbStatusText,
                usbExpireDate: editingPermission.usbExpireDate,
                antivirusStatus: editingPermission.antivirusStatus,
                antivirusStatusText: editingPermission.antivirusStatusText,
                remark: editingPermission.remark,
            });
            // 检查可能的字段名变体（下划线命名）
            console.log('检查可能的字段名变体:', {
                domain_group: (editingPermission as any).domain_group,
                usb_expire_date: (editingPermission as any).usb_expire_date,
                domain_status: (editingPermission as any).domain_status,
                smartit_status: (editingPermission as any).smartit_status,
                usb_status: (editingPermission as any).usb_status,
                antivirus_status: (editingPermission as any).antivirus_status,
            });
            console.log('字典数据:', {
                domainStatusOptions: domainStatusOptions.length,
                smartitStatusOptions: smartitStatusOptions.length,
                usbStatusOptions: usbStatusOptions.length,
                antivirusStatusOptions: antivirusStatusOptions.length,
            });
            
            // 优先使用后端返回的 dictId，如果没有则通过 domainName 查找
            let domainDictId: number | null = null;
            console.log('检查 domainStatus 字段:', {
                domainStatus: editingPermission.domainStatus,
                domainName: editingPermission.domainName,
                domainStatusType: typeof editingPermission.domainStatus,
                domainStatusIsNull: editingPermission.domainStatus === null,
                domainStatusIsUndefined: editingPermission.domainStatus === undefined,
            });
            
            // 检查 domainStatus 是否存在（包括 0，因为 0 也是有效的 dictId）
            if (editingPermission.domainStatus !== null && editingPermission.domainStatus !== undefined) {
                // 如果后端直接返回了 domainStatus (dictId)，直接使用
                domainDictId = editingPermission.domainStatus;
                console.log('使用后端返回的 domainStatus (dictId):', domainDictId);
            } else if (editingPermission.domainName && domainStatusOptions.length > 0) {
                // 如果只有 domainName，通过字典查找
                domainDictId = findDictId(domainStatusOptions, editingPermission.domainName);
                console.log('通过 domainName 查找 dictId:', editingPermission.domainName, '->', domainDictId);
            } else {
                console.warn('无法获取 domainDictId:', {
                    domainStatus: editingPermission.domainStatus,
                    domainName: editingPermission.domainName,
                    domainStatusOptionsLength: domainStatusOptions.length,
                });
            }
            
            // SmartIT 状态：优先使用 dictId，否则通过文本查找
            let smartitDictId: number | null = null;
            if (editingPermission.smartitStatus !== null && editingPermission.smartitStatus !== undefined) {
                smartitDictId = editingPermission.smartitStatus;
                console.log('使用后端返回的 smartitStatus (dictId):', smartitDictId);
            } else if (smartitStatusOptions.length > 0) {
                const smartitStatusName = editingPermission.smartitStatusText || 
                    (editingPermission.smartitStatus === 1 ? '本地' : editingPermission.smartitStatus === 0 ? '未安装' : '');
                smartitDictId = findDictId(smartitStatusOptions, smartitStatusName);
                console.log('通过 smartitStatusText 查找 dictId:', smartitStatusName, '->', smartitDictId);
            }
            
            // USB 状态：优先使用 dictId，否则通过文本查找
            let usbDictId: number | null = null;
            if (editingPermission.usbStatus !== null && editingPermission.usbStatus !== undefined) {
                usbDictId = editingPermission.usbStatus;
                console.log('使用后端返回的 usbStatus (dictId):', usbDictId);
            } else if (usbStatusOptions.length > 0) {
                const usbStatusName = editingPermission.usbStatusText || 
                    (editingPermission.usbStatus === 1 ? '数据' : editingPermission.usbStatus === 0 ? '关闭' : '');
                usbDictId = findDictId(usbStatusOptions, usbStatusName);
                console.log('通过 usbStatusText 查找 dictId:', usbStatusName, '->', usbDictId);
            }
            
            // 防病毒状态：优先使用 dictId，否则通过文本查找
            let antivirusDictId: number | null = null;
            if (editingPermission.antivirusStatus !== null && editingPermission.antivirusStatus !== undefined) {
                antivirusDictId = editingPermission.antivirusStatus;
                console.log('使用后端返回的 antivirusStatus (dictId):', antivirusDictId);
            } else if (antivirusStatusOptions.length > 0) {
                const antivirusStatusName = editingPermission.antivirusStatusText || 
                    (editingPermission.antivirusStatus === 1 ? '自动' : editingPermission.antivirusStatus === 0 ? '手动' : '');
                antivirusDictId = findDictId(antivirusStatusOptions, antivirusStatusName);
                console.log('通过 antivirusStatusText 查找 dictId:', antivirusStatusName, '->', antivirusDictId);
            }
            
            // 重置表单，使用数据库中的真实数据（不强制为空，保留数据库中的值）
            // 注意：即使某些状态字段为空，其他字段（domainGroup、usbExpireDate、remark）也应该显示
            const formData = {
                deviceId: editingPermission.deviceId,
                domainStatus: domainDictId, // 可能为 null，但这是正常的
                // 直接使用数据库中的值，如果为 null/undefined 则使用空字符串
                domainGroup: editingPermission.domainGroup ?? '',
                noDomainReason: editingPermission.noDomainReason ?? '',
                smartitStatus: smartitDictId, // 可能为 null，但这是正常的
                noSmartitReason: editingPermission.noSmartitReason ?? '',
                usbStatus: usbDictId, // 可能为 null，但这是正常的
                usbReason: editingPermission.usbReason ?? '',
                // 直接使用数据库中的日期值，如果存在则转换为 dayjs 对象
                useEndDate: editingPermission.usbExpireDate ? dayjs(editingPermission.usbExpireDate) : null,
                connectionStatus: antivirusDictId, // 可能为 null，但这是正常的
                noSymantecReason: editingPermission.noSymantecReason ?? '',
                // 直接使用数据库中的备注值
                remarks: editingPermission.remark ?? '',
            };
            console.log('设置表单数据（从数据库读取）:', formData);
            console.log('数据库原始值:', {
                domainGroup: editingPermission.domainGroup,
                domainGroupType: typeof editingPermission.domainGroup,
                domainGroupIsNull: editingPermission.domainGroup === null,
                domainGroupIsUndefined: editingPermission.domainGroup === undefined,
                usbExpireDate: editingPermission.usbExpireDate,
                usbExpireDateType: typeof editingPermission.usbExpireDate,
                remark: editingPermission.remark,
                remarkType: typeof editingPermission.remark,
            });
            reset(formData);
            
            // 初始化完成后，延迟重置标志，确保其他 useEffect 不会在初始化时触发
            setTimeout(() => {
                isInitializingRef.current = false;
            }, 100);
        } else {
            // 如果不在编辑状态，重置标志
            isInitializingRef.current = false;
        }
    }, [editingPermission, visible, reset, domainStatusOptions, smartitStatusOptions, usbStatusOptions, antivirusStatusOptions]);

    return (
        <Modal
            title={
                <div className="modal-title">
                    <FileTextOutlined className="icon-blue" />
                    <span>{`设备权限详情 - ${editingPermission?.permissionId || ''}`}</span>
                </div>
            }
            open={visible}
            onCancel={handleCancel}
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
                onFinish={handleFormSubmit}
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
                                                name="domainStatus"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        style={{ width: '100%' }}
                                                        placeholder="请选择域名"
                                                        size="small"
                                                        allowClear
                                                        disabled={!isAdmin}
                                                    >
                                                        {domainStatusOptions.map((item) => (
                                                            <Option key={item.dictId} value={item.dictId}>
                                                                {item.dictItemName}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                )}
                                            />
                                        </Form.Item>
                                    </Col>

                                    {domainStatusValue && domainStatusText !== '未参加' && domainStatusText !== '无' && (
                                        <Col span={12}>
                                            <Form.Item
                                                label={<span className="form-label"><TeamOutlined />域内组名</span>}
                                                validateStatus={errors.domainGroup ? 'error' : undefined}
                                                help={errors.domainGroup?.message}
                                                style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                            >
                                                <Controller
                                                    name="domainGroup"
                                                    control={control}
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
                                                            disabled={!isAdmin}
                                                        />
                                                    )}
                                                />
                                            </Form.Item>
                                        </Col>
                                    )}

                                    {(domainStatusText === '未参加' || domainStatusText === '无') && (
                                        <Col span={12}>
                                            <Form.Item
                                                label={<span className="form-label"><ExclamationCircleOutlined className="icon-orange" />不加域理由</span>}
                                                validateStatus={errors.noDomainReason ? 'error' : undefined}
                                                help={errors.noDomainReason?.message}
                                                style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                            >
                                                <Controller
                                                    name="noDomainReason"
                                                    control={control}
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
                                                            disabled={!isAdmin}
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
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        style={{ width: '100%' }}
                                                        placeholder="请选择状态"
                                                        size="small"
                                                        allowClear
                                                        disabled={!isAdmin}
                                                    >
                                                        {smartitStatusOptions.map((item) => (
                                                            <Option key={item.dictId} value={item.dictId}>
                                                                {item.dictItemName}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                )}
                                            />
                                        </Form.Item>
                                    </Col>

                                    {(smartitStatusText === '未インストール' || smartitStatusText === '未安装') && (
                                        <Col span={12}>
                                            <Form.Item
                                                label={<span className="form-label"><ExclamationCircleOutlined className="icon-orange" />不安装理由</span>}
                                                validateStatus={errors.noSmartitReason ? 'error' : undefined}
                                                help={errors.noSmartitReason?.message}
                                                style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                            >
                                                <Controller
                                                    name="noSmartitReason"
                                                    control={control}
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
                                                            disabled={!isAdmin}
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
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                style={{ width: '100%' }}
                                                placeholder="请选择状态"
                                                size="small"
                                                allowClear
                                                disabled={!isAdmin}
                                            >
                                                {usbStatusOptions.map((item) => (
                                                    <Option key={item.dictId} value={item.dictId}>
                                                        {item.dictItemName}
                                                    </Option>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                </Form.Item>
                            </Col>

                            {(usbStatusText === '許可' || usbStatusText === '一時許可' || usbStatusText === '数据' || usbStatusText === '3G网卡') && (
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
                                                control={control}
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
                                                        disabled={!isAdmin}
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
                                                control={control}
                                                rules={{
                                                    required: (usbStatusText === '許可' || usbStatusText === '一時許可' || usbStatusText === '数据' || usbStatusText === '3G网卡') ? '请选择截止日期' : false
                                                }}
                                                render={({ field }) => (
                                                    <DatePicker
                                                        {...field}
                                                        style={{ width: '100%' }}
                                                        placeholder="请选择日期"
                                                        format="YYYY-MM-DD"
                                                        allowClear={false}
                                                        disabled={!isAdmin}
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
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                style={{ width: '100%' }}
                                                placeholder="请选择状态"
                                                size="small"
                                                allowClear
                                                disabled={!isAdmin}
                                            >
                                                {antivirusStatusOptions.map((item) => (
                                                    <Option key={item.dictId} value={item.dictId}>
                                                        {item.dictItemName}
                                                    </Option>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                </Form.Item>
                            </Col>

                            {(connectionStatusText === '未インストール' || connectionStatusText === '无连接') && (
                                <Col span={8}>
                                    <Form.Item
                                        label={<span className="form-label"><ExclamationCircleOutlined className="icon-orange" />无Symantec理由</span>}
                                        validateStatus={errors.noSymantecReason ? 'error' : undefined}
                                        help={errors.noSymantecReason?.message}
                                        style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                    >
                                        <Controller
                                            name="noSymantecReason"
                                            control={control}
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
                                                    disabled={!isAdmin}
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
                                        control={control}
                                        rules={{ maxLength: { value: 200, message: '最大200个字符' } }}
                                        render={({ field }) => (
                                            <Input.TextArea
                                                {...field}
                                                placeholder="请输入备注信息"
                                                rows={1}
                                                showCount
                                                maxLength={200}
                                                disabled={!isAdmin}
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
                        {isAdmin && (
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                size="middle"
                                className="action-button"
                            >
                                更新
                            </Button>
                        )}
                        <Button
                            onClick={handleCancel}
                            size="middle"
                            className="action-button"
                        >
                            {isAdmin ? '取消' : '关闭'}
                        </Button>
                    </Space>
                </div>
            </Form>
        </Modal>
    );
};

export default PermissionDetailModal;
