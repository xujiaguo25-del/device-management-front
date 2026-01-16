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

// 親コンポーネントに渡すためのインターフェース（後方互換性を維持）
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
    // 辞書データを取得する
    const { map: dictMap } = useDicts([
        'DOMAIN_STATUS',
        'SMARTIT_STATUS',
        'USB_STATUS',
        'ANTIVIRUS_STATUS'
    ]);

    // 各フィールドの辞書データを抽出する
    const domainStatusOptions = (dictMap?.['DOMAIN_STATUS'] || []) as DictItem[];
    const smartitStatusOptions = (dictMap?.['SMARTIT_STATUS'] || []) as DictItem[];
    const usbStatusOptions = (dictMap?.['USB_STATUS'] || []) as DictItem[];
    const antivirusStatusOptions = (dictMap?.['ANTIVIRUS_STATUS'] || []) as DictItem[];

    // 補助関数：dictItemNameからdictIdを検索
    const findDictId = (options: DictItem[], dictItemName?: string) => {
        if (!dictItemName) return null;
        const it = options.find(o => o.dictItemName === dictItemName);
        return it?.dictId || null;
    };

    // 補助関数：dictId から dictItemName を検索
    const findDictItemName = (options: DictItem[], dictId?: number | null) => {
        if (dictId == null) return '';
        const it = options.find(o => o.dictId === dictId);
        return it?.dictItemName || '';
    };

    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<PermissionFormData>();
    
    // フォームを初期化中かどうかを示すために使用（初期化時にデータベースの値を消去するのを回避）
    const isInitializingRef = React.useRef(false);
    
    const domainStatusValue = useWatch({ control, name: 'domainStatus' });
    const smartitStatusValue = useWatch({ control, name: 'smartitStatus' });
    const connectionStatusValue = useWatch({ control, name: 'connectionStatus' });
    const usbStatusValue = useWatch({ control, name: 'usbStatus' });

    // 現在選択されている値のテキストを取得する
    const domainStatusText = findDictItemName(domainStatusOptions, domainStatusValue);
    const smartitStatusText = findDictItemName(smartitStatusOptions, smartitStatusValue);
    const usbStatusText = findDictItemName(usbStatusOptions, usbStatusValue);
    const connectionStatusText = findDictItemName(antivirusStatusOptions, connectionStatusValue);

    const handleFormSubmit = handleSubmit(async (data) => {
        // 管理者でなければ、提出を禁止する
        if (!isAdmin) {
            message.warning('あなたにはデバイス権限情報を更新する権限がありません');
            return;
        }
        
        // dictId を dictItemName に変換して、親コンポーネントとのインターフェースの互換性を保つ
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

    // フィールドの値が変更されたときに、関連するフィールドをクリアします（ユーザーが変更した場合のみ、初期化時は除く）
    React.useEffect(() => {
        // 初期化中の場合は、クリア操作を実行しない
        if (isInitializingRef.current) return;
        
        if (domainStatusText === '未参加' || domainStatusText === 'なし') {
            setValue('domainGroup', '');
        } else if (domainStatusValue && domainStatusText !== '未参加' && domainStatusText !== 'なし') {
            setValue('noDomainReason', '');
        }
    }, [domainStatusValue, domainStatusText, setValue]);

    React.useEffect(() => {
        // 初期化中の場合は、クリア操作を実行しない
        if (isInitializingRef.current) return;
        
        if (smartitStatusText !== '未インストール' && smartitStatusText !== '未インストール') {
            setValue('noSmartitReason', '');
        }
    }, [smartitStatusValue, smartitStatusText, setValue]);

    React.useEffect(() => {
        // 初期化中の場合は、クリア操作を実行しない
        if (isInitializingRef.current) return;
        
        if (connectionStatusText !== '未インストール' && connectionStatusText !== '接続なし') {
            setValue('noSymantecReason', '');
        }
    }, [connectionStatusValue, connectionStatusText, setValue]);

    React.useEffect(() => {
        // 初期化中の場合は、クリア操作を実行しない
        if (isInitializingRef.current) return;
        
        if (usbStatusText !== '許可' && usbStatusText !== '一時許可' && usbStatusText !== 'データ' && usbStatusText !== '3Gモデム') {
            setValue('usbReason', '');
            setValue('useEndDate', null);
        }
    }, [usbStatusValue, usbStatusText, setValue]);

    // 編集権限データが変更されたとき、フォームの値を更新する - dictId を使用
    React.useEffect(() => {
        if (editingPermission && visible) {
            // マークが初期化中です。他の useEffect がデータベースの値をクリアするのを避けてください
            isInitializingRef.current = true;
            console.log('初期化詳細フォーム、editingPermission 完全なオブジェクト:', JSON.stringify(editingPermission, null, 2));
            console.log('editingPermission の所有キー:', Object.keys(editingPermission));
            console.log('重要なフィールド値:', {
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
            // 可能なフィールド名のバリエーションを確認する（スネークケース）
            console.log('可能なフィールド名のバリエーションを確認する:', {
                domain_group: (editingPermission as any).domain_group,
                usb_expire_date: (editingPermission as any).usb_expire_date,
                domain_status: (editingPermission as any).domain_status,
                smartit_status: (editingPermission as any).smartit_status,
                usb_status: (editingPermission as any).usb_status,
                antivirus_status: (editingPermission as any).antivirus_status,
            });
            console.log('辞書データ:', {
                domainStatusOptions: domainStatusOptions.length,
                smartitStatusOptions: smartitStatusOptions.length,
                usbStatusOptions: usbStatusOptions.length,
                antivirusStatusOptions: antivirusStatusOptions.length,
            });
            
            // バックエンドから返された dictId を優先的に使用し、なければ domainName で検索する
            let domainDictId: number | null = null;
            console.log('domainStatus フィールドを確認する:', {
                domainStatus: editingPermission.domainStatus,
                domainName: editingPermission.domainName,
                domainStatusType: typeof editingPermission.domainStatus,
                domainStatusIsNull: editingPermission.domainStatus === null,
                domainStatusIsUndefined: editingPermission.domainStatus === undefined,
            });
            
            // domainStatus が存在するか確認する（0 を含む、0 も有効な dictId であるため）
            if (editingPermission.domainStatus !== null && editingPermission.domainStatus !== undefined) {
                // もしバックエンドが直接 domainStatus (dictId) を返す場合は、直接使用する
                domainDictId = editingPermission.domainStatus;
                console.log('バックエンドから返された domainStatus (dictId) を使用する:', domainDictId);
            } else if (editingPermission.domainName && domainStatusOptions.length > 0) {
                // もし domainName だけがある場合は、辞書から検索する
                domainDictId = findDictId(domainStatusOptions, editingPermission.domainName);
                console.log('domainName から dictId を検索する:', editingPermission.domainName, '->', domainDictId);
            } else {
                console.warn('domainDictId を取得できませんでした:', {
                    domainStatus: editingPermission.domainStatus,
                    domainName: editingPermission.domainName,
                    domainStatusOptionsLength: domainStatusOptions.length,
                });
            }
            // SmartIT 状態：優先使用 dictId、なければテキストで検索    
            let smartitDictId: number | null = null;
            if (editingPermission.smartitStatus !== null && editingPermission.smartitStatus !== undefined) {
                smartitDictId = editingPermission.smartitStatus;
                console.log('バックエンドから返された smartitStatus (dictId) を使用する:', smartitDictId);
            } else if (smartitStatusOptions.length > 0) {
                const smartitStatusName = editingPermission.smartitStatusText || 
                    (editingPermission.smartitStatus === 1 ? 'ローカル' : editingPermission.smartitStatus === 0 ? '未インストール' : '');
                smartitDictId = findDictId(smartitStatusOptions, smartitStatusName);
                console.log('smartitStatusText を使って dictId を検索する:', smartitStatusName, '->', smartitDictId);
            }
            
            // USB 状態：優先使用 dictId、なければテキストで検索        
            let usbDictId: number | null = null;
            if (editingPermission.usbStatus !== null && editingPermission.usbStatus !== undefined) {
                usbDictId = editingPermission.usbStatus;
                console.log('バックエンドから返された usbStatus (dictId) を使用する:', usbDictId);
            } else if (usbStatusOptions.length > 0) {
                const usbStatusName = editingPermission.usbStatusText || 
                    (editingPermission.usbStatus === 1 ? 'データ' : editingPermission.usbStatus === 0 ? '閉じる' : '');
                usbDictId = findDictId(usbStatusOptions, usbStatusName);
                console.log('usbStatusText を使って dictId を検索する:', usbStatusName, '->', usbDictId);
            }
            
            // 防ウイルス状態：優先使用 dictId、なければテキストで検索 
            let antivirusDictId: number | null = null;
            if (editingPermission.antivirusStatus !== null && editingPermission.antivirusStatus !== undefined) {
                antivirusDictId = editingPermission.antivirusStatus;
                console.log('バックエンドから返された antivirusStatus (dictId) を使用する:', antivirusDictId);
            } else if (antivirusStatusOptions.length > 0) {
                const antivirusStatusName = editingPermission.antivirusStatusText || 
                    (editingPermission.antivirusStatus === 1 ? '自動' : editingPermission.antivirusStatus === 0 ? '手動' : '');
                antivirusDictId = findDictId(antivirusStatusOptions, antivirusStatusName);
                console.log('antivirusStatusText を使って dictId を検索する:', antivirusStatusName, '->', antivirusDictId);
            }
            
            const formData = {
                deviceId: editingPermission.deviceId,
                domainStatus: domainDictId, 
                domainGroup: editingPermission.domainGroup ?? '',
                noDomainReason: editingPermission.noDomainReason ?? '',
                smartitStatus: smartitDictId,
                noSmartitReason: editingPermission.noSmartitReason ?? '',
                usbStatus: usbDictId,
                usbReason: editingPermission.usbReason ?? '',
                // データベースの日時値を直接使用し、存在する場合は dayjs オブジェクトに変換する
                useEndDate: editingPermission.usbExpireDate ? dayjs(editingPermission.usbExpireDate) : null,
                connectionStatus: antivirusDictId, 
                noSymantecReason: editingPermission.noSymantecReason ?? '',
                remarks: editingPermission.remark ?? '',
            };
            console.log('フォームデータを設定する（データベースから読み込む）:', formData);
            console.log('データベースの元の値::', {
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
            
            setTimeout(() => {
                isInitializingRef.current = false;
            }, 100);
        } else {
            isInitializingRef.current = false;
        }
    }, [editingPermission, visible, reset, domainStatusOptions, smartitStatusOptions, usbStatusOptions, antivirusStatusOptions]);

    return (
        <Modal
            title={
                <div className="modal-title">
                    <FileTextOutlined className="icon-blue" />
                    <span>{`デバイス権限の詳細 - ${editingPermission?.permissionId || ''}`}</span>
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
                {/* デバイス基本情報エリア */}
                <Card
                    title={
                        <div className="card-header-title">
                            <FolderOpenOutlined className="icon-green" />
                            <span style={{ color: '#52c41a' }}>デバイス基本情報</span>
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
                        <Descriptions.Item label={<><IdcardOutlined />デバイスID</>} >
                            <strong>{editingPermission?.deviceId || '-'}</strong>
                        </Descriptions.Item>
                        <Descriptions.Item label={<><LaptopOutlined />コンピュータ名</>}>
                            {editingPermission?.computerName || '-'}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* 権限設定情報エリア */}
                <Card
                    title={
                        <div className="card-header-title">
                            <SettingOutlined className="icon-blue" />
                            <span style={{ color: '#1890ff' }}>権限設定情報</span>
                        </div>
                    }
                    size="small"
                    style={{ marginBottom: 12 }}
                    headStyle={{ background: 'linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)', padding: '8px 12px', borderRadius: '6px 6px 0 0', borderBottom: '1px solid #b5f5ec', fontSize: '14px', fontWeight: 600, color: '#08979c' }}
                    bodyStyle={{ padding: '12px', background: '#ffffff', borderRadius: '0 0 6px 6px' }}
                    bordered={false}
                >
                    {/* 域配置とSmartIT配置を同一行に */}
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
                                            label={<span className="form-label"><BankOutlined />ドメイン名</span>}
                                            style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                        >
                                            <Controller
                                                name="domainStatus"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        style={{ width: '100%' }}
                                                        placeholder="ドメイン名を選択してください"
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

                                    {domainStatusValue && domainStatusText !== '未参加' && domainStatusText !== 'なし' && (
                                        <Col span={12}>
                                            <Form.Item
                                                label={<span className="form-label"><TeamOutlined />エリア内グループ名</span>}
                                                validateStatus={errors.domainGroup ? 'error' : undefined}
                                                help={errors.domainGroup?.message}
                                                style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                            >
                                                <Controller
                                                    name="domainGroup"
                                                    control={control}
                                                    rules={{
                                                        required: 'Domainグループ名を入力してください',
                                                        maxLength: { value: 50, message: '最大50文字' }
                                                    }}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            placeholder="Domainグループ名を入力してください"
                                                            allowClear
                                                            size="small"
                                                            disabled={!isAdmin}
                                                        />
                                                    )}
                                                />
                                            </Form.Item>
                                        </Col>
                                    )}

                                    {(domainStatusText === '未参加' || domainStatusText === 'なし') && (
                                        <Col span={12}>
                                            <Form.Item
                                                label={<span className="form-label"><ExclamationCircleOutlined className="icon-orange" />ドメインに参加しない理由</span>}
                                                validateStatus={errors.noDomainReason ? 'error' : undefined}
                                                help={errors.noDomainReason?.message}
                                                style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                            >
                                                <Controller
                                                    name="noDomainReason"
                                                    control={control}
                                                    rules={{
                                                        required: '不加域理由を入力してください',
                                                        maxLength: { value: 20, message: '最大20文字' }
                                                    }}
                                                    render={({ field }) => (
                                                        <Input.TextArea
                                                            {...field}
                                                            placeholder="不加域理由を入力してください"
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

                            {/* SmartITの配置 */}
                            <Col span={12}>
                                <div className="section-title">
                                    <span>SmartITの配置</span>
                                </div>
                                <Row gutter={8} align="middle">
                                    <Col span={12}>
                                        <Form.Item
                                            label={<span className="form-label"><SafetyOutlined />状態</span>}
                                            style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                        >
                                            <Controller
                                                name="smartitStatus"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        style={{ width: '100%' }}
                                                        placeholder="状態を選択してください"
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

                                    {(smartitStatusText === '未インストール' || smartitStatusText === '未インストール') && (
                                        <Col span={12}>
                                            <Form.Item
                                                label={<span className="form-label"><ExclamationCircleOutlined className="icon-orange" />インストールしない理由</span>}
                                                validateStatus={errors.noSmartitReason ? 'error' : undefined}
                                                help={errors.noSmartitReason?.message}
                                                style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                            >
                                                <Controller
                                                    name="noSmartitReason"
                                                    control={control}
                                                    rules={{
                                                        required: '不安装理由を入力してください',
                                                        maxLength: { value: 20, message: '最大20文字' }
                                                    }}
                                                    render={({ field }) => (
                                                        <Input.TextArea
                                                            {...field}
                                                            placeholder="不安装理由を入力してください"
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
                                    label={<span className="form-label"><UsbOutlined />USB状態</span>}
                                    style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                >
                                    <Controller
                                        name="usbStatus"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                style={{ width: '100%' }}
                                                placeholder="状態を選択してください"
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

                            {(usbStatusText === '許可' || usbStatusText === '一時許可' || usbStatusText === 'データ' || usbStatusText === '3Gモデム') && (
                                <>
                                    <Col span={8}>
                                        <Form.Item
                                            label={<span className="form-label"><ExclamationCircleOutlined className="icon-orange" />開通理由</span>}
                                            validateStatus={errors.usbReason ? 'error' : undefined}
                                            help={errors.usbReason?.message}
                                            style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                        >
                                            <Controller
                                                name="usbReason"
                                                control={control}
                                                rules={{
                                                    required: 'USB開通理由を入力してください',
                                                    maxLength: { value: 20, message: '最大20文字' }
                                                }}
                                                render={({ field }) => (
                                                    <Input.TextArea
                                                        {...field}
                                                        placeholder="開通理由を入力してください"
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
                                            label={<span className="form-label"><CalendarOutlined />使用期限</span>}
                                            validateStatus={errors.useEndDate ? 'error' : undefined}
                                            help={errors.useEndDate?.message}
                                            style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                        >
                                            <Controller
                                                name="useEndDate"
                                                control={control}
                                                rules={{
                                                    required: (usbStatusText === '許可' || usbStatusText === '一時許可' || usbStatusText === 'データ' || usbStatusText === '3Gモデム') ? '使用期限を選択してください' : false
                                                }}
                                                render={({ field }) => (
                                                    <DatePicker
                                                        {...field}
                                                        style={{ width: '100%' }}
                                                        placeholder="日付を選択してください"
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

                    {/* ウイルス対策の配置 */}
                    <div className="section-block">
                        <div className="section-title">
                            <span>ウイルス対策の配置</span>
                        </div>
                        <Row gutter={8} align="middle">
                            <Col span={8}>
                                <Form.Item
                                    label={<span className="form-label"><SafetyOutlined />接続状態</span>}
                                    style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                >
                                    <Controller
                                        name="connectionStatus"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                style={{ width: '100%' }}
                                                placeholder="状態を選択してください"
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

                            {(connectionStatusText === '未インストール' || connectionStatusText === '接続なし') && (
                                <Col span={8}>
                                    <Form.Item
                                        label={<span className="form-label"><ExclamationCircleOutlined className="icon-orange" />Symantec未接続の理由</span>}
                                        validateStatus={errors.noSymantecReason ? 'error' : undefined}
                                        help={errors.noSymantecReason?.message}
                                        style={{ ...COMPACT_FORM_ITEM_STYLE, marginBottom: 2 }}
                                    >
                                        <Controller
                                            name="noSymantecReason"
                                            control={control}
                                            rules={{
                                                required: 'Symantecでない理由を記入してください',
                                                maxLength: { value: 20, message: '最大20文字' }
                                            }}
                                            render={({ field }) => (
                                                <Input.TextArea
                                                    {...field}
                                                    placeholder="Symantecでない理由を記入してください"
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

                    {/* 備考情報 */}
                    <div className="section-block">
                        <div className="section-title">
                            <ExclamationCircleOutlined className="icon-orange" />
                            <span>備考</span>
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
                                        rules={{ maxLength: { value: 200, message: '最大200文字' } }}
                                        render={({ field }) => (
                                            <Input.TextArea
                                                {...field}
                                                placeholder="備考情報を入力してください"
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

                {/* 操作ボタン */}
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
                            {isAdmin ? 'キャンセル' : ' 閉じる'}
                        </Button>
                    </Space>
                </div>
            </Form>
        </Modal>
    );
};

export default PermissionDetailModal;
