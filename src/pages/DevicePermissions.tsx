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
    // ユーザー情報を取得する
    const { userInfo } = useAuthStore();
    
    //管理者ユーザーかどうかを判断する
    const isAdmin = userInfo?.USER_TYPE_NAME?.toUpperCase() === 'ADMIN';
    
    // 辞書データを取得
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

    const findDictId = (options: DictItem[], dictItemName?: string) => {
        if (!dictItemName) return null;
        const it = options.find(o => o.dictItemName === dictItemName);
        return it?.dictId || null;
    };

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

    // 権限リストを読み込む
    const loadPermissions = async (page: number = 1, size: number = 10, userId?: string, deviceId?: string) => {
        try {
            setLoading(true);
            // 管理者でない場合、現在のユーザーの権限を自動的にフィルタリングする
            const finalUserId = isAdmin ? userId : (userId || userInfo?.USER_ID);
            const response = await getPermissions({ page, size, userId: finalUserId, deviceId });
            console.log('権限リストの取得応答:', response);
            if (response.code === 200 && response.data) {
                console.log('権限リストデータ:', response.data);
                if (response.data.length > 0) {
                    console.log('第一条権限データ詳細:', {
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
                message.error(response.message || '権限リストの取得に失敗しました');
            }
        } catch (error: any) {
            console.error('権限リストの取得に失敗しました:', error);
            message.error(error.message || '権限リストの取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    // 初期読み込み
    useEffect(() => {
        loadPermissions();
    }, []);

    // 検索
    const onSearch = (data: SearchFormData) => {
        // 空の文字列をフィルタリングして undefined に変換する
        // 管理者でない場合、他のユーザーの権限を検索することは許可されない
        const userId = isAdmin ? (data.userId?.trim() || undefined) : undefined;
        const deviceId = data.deviceId?.trim() || undefined;
        loadPermissions(1, pagination.pageSize, userId, deviceId);
    };

    // 検索をリセット
    const onResetSearch = () => {
        loadPermissions(1, pagination.pageSize);
    };

   // 編集ダイアログを開く
    const handleEdit = async (permissionId: string) => {
        try {
            setLoading(true);
            console.log('権限の詳細を取得中、permissionId:', permissionId);
            const response = await getPermissionById(permissionId);
            console.log('権限詳細の取得応答:', response);
            
            if (response.code === 200 && response.data) {
                const permission = response.data;
                console.log('権限詳細データ:', permission);
                console.log('権限詳細データの型:', typeof permission);
                console.log('権限詳細データがnullかどうか:', permission === null);
                console.log('権限詳細データがundefinedかどうか:', permission === undefined);
                console.log('権限詳細データのすべてのキー:', Object.keys(permission || {}));
                
                // 確保設定 editingPermission 後にモーダルを開く
                setEditingPermission(permission);
                // setTimeout を使用して状態更新後にモーダルを開く
                setTimeout(() => {
                    setModalVisible(true);
                    console.log('モーダルが開きました、editingPermission:', permission);
                }, 0);
            } else {
                console.error('権限詳細の取得に失敗しました:', response);
                message.error(response.message || '権限詳細の取得に失敗しました');
            }
        } catch (error: any) {
            console.error('権限詳細の取得に失敗しました:', error);
            message.error(error.message || '権限詳細の取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    // フォームを送信
    const onSubmitForm = async (data: PermissionFormData) => {
        try {
            // 辞書項目に対応するテキスト値を取得する
            const domainStatusText = data.domainName;
            const smartitStatusText = data.smartitStatus;
            const usbStatusText = data.usbStatus;
            const antivirusStatusText = data.connectionStatus;

            console.log('フォームデータを送信:', data);
            console.log('辞書オプション数:', {
                domainStatusOptions: domainStatusOptions.length,
                smartitStatusOptions: smartitStatusOptions.length,
                usbStatusOptions: usbStatusOptions.length,
                antivirusStatusOptions: antivirusStatusOptions.length,
            });

            // dictItemName に基づいて対応する dictId を検索
            const domainStatusDictId = findDictId(domainStatusOptions, domainStatusText);
            const smartitStatusDictId = findDictId(smartitStatusOptions, smartitStatusText);
            const usbStatusDictId = findDictId(usbStatusOptions, usbStatusText);
            const antivirusStatusDictId = findDictId(antivirusStatusOptions, antivirusStatusText);

            console.log('変換後の dictId:', {
                domainStatusText,
                domainStatusDictId,
                smartitStatusText,
                smartitStatusDictId,
                usbStatusText,
                usbStatusDictId,
                antivirusStatusText,
                antivirusStatusDictId,
            });

            // バックエンドに送信するデータを構築
            const permissionData: DevicePermissionInsert = {
                deviceId: data.deviceId,
                // dictId を直接使用する
                domainStatus: domainStatusDictId ?? (domainStatusText && domainStatusText !== '无' ? 1 : 0),
                domainName: domainStatusText,
                domainGroup: data.domainGroup,
                noDomainReason: data.noDomainReason,
                smartitStatus: smartitStatusDictId,
                smartitStatusText: smartitStatusText,
                noSmartitReason: data.noSmartitReason,
                usbStatus: usbStatusDictId,
                usbStatusText: usbStatusText,
                usbReason: data.usbReason,
                usbExpireDate: data.useEndDate ? data.useEndDate.format('YYYY-MM-DD') : null,
                antivirusStatus: antivirusStatusDictId,
                antivirusStatusText: antivirusStatusText,
                noSymantecReason: data.noSymantecReason,
                remark: data.remarks,
            };

            console.log('バックエンドに送信される権限データ:', permissionData);

            // 編集モード
            if (!editingPermission) {
                message.error('編集権限情報が存在しません');
                return;
            }

            const response = await updatePermission(editingPermission.permissionId, permissionData);
            console.log('更新権限レスポンス:', response);
            
            if (response.code === 200) {
                message.success('権限の更新に成功しました');
                setModalVisible(false);
                setEditingPermission(null);
                // リストデータを更新
                await loadPermissions(pagination.current, pagination.pageSize);
                console.log('権限リストが更新されました');
            } else {
                console.error('権限の更新に失敗しました:', response);
                message.error(response.message || '権限の更新に失敗しました');
            }
        } catch (error: any) {
            message.error(error.message || '権限更新失敗しました');
        }
    };

    // Excelをエクスポート
    const handleExport = async () => {
        try {
            setLoading(true);
            // ユーザー情報と辞書データをエクスポート関数に渡す
            await exportPermissionsExcel(userInfo, dictMap);
            message.success('エクスポート成功しました');
        } catch (error: any) {
            message.error(error.message || 'エクスポートに失敗しました');
        } finally {
            setLoading(false);
        }
    };

    // ダイアログを閉じる
    const handleModalCancel = () => {
        setModalVisible(false);
        setEditingPermission(null);
    };

    return (
        <Layout title="権限管理">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* 権限リストカード */}
                <Card
                    title="権限リスト"
                    extra={
                        <Button icon={<ExportOutlined />} onClick={handleExport} loading={loading}>
                            Excelにエクスポート
                        </Button>
                    }
                >
                    {/* 検索フォーム */}
                    <PermissionSearchForm onSearch={onSearch} onReset={onResetSearch} isAdmin={isAdmin} />

                    {/* テーブル */}
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

            {/* 詳細情報ダイアログ */}
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
