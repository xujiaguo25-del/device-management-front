import React from 'react';
import { Table, Button, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { DevicePermissionList, DictItem } from '../../types';
import { useDicts } from '../../hooks/useDicts';

interface PermissionTableProps {
    data: DevicePermissionList[];
    loading: boolean;
    pagination: {
        current: number;
        pageSize: number;
        total: number;
    };
    onPageChange: (page: number, pageSize: number) => void;
    onEdit: (permissionId: string) => void;
    isAdmin?: boolean;
}

const PermissionTable: React.FC<PermissionTableProps> = ({
    data,
    loading,
    pagination,
    onPageChange,
    onEdit,
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

    // 補助関数：dictId から dictItemName を検索する
    const getLabel = (options: DictItem[], dictId?: number | null) => {
        if (dictId == null) return '-';
        const it = options.find(o => o.dictId === dictId);
        return it ? it.dictItemName : '-';
    };


    const columns: ColumnsType<DevicePermissionList> = [
        {
            title: '番号',
            key: 'index',
            width: 80,
            fixed: 'left',
            render: (_: any, __: DevicePermissionList, index: number) => {
                const serialNumber = (pagination.current - 1) * pagination.pageSize + index + 1;
                return serialNumber;
            },
        },
        {
            title: 'デバイスID',
            dataIndex: 'deviceId',
            key: 'deviceId',
            width: 120,
        },
        {
            title: 'コンピュータ名',
            dataIndex: 'computerName',
            key: 'computerName',
            width: 150,
        },
        {
            title: 'IPアドレス',
            dataIndex: 'ipAddress',
            key: 'ipAddress',
            width: 150,
            render: (ips: string[]) => (ips && ips.length > 0 ? ips.join(', ') : '-'),
        },
        {
            title: 'ユーザーID',
            dataIndex: 'userId',
            key: 'userId',
            width: 120,
        },
        {
            title: 'ユーザー名',
            dataIndex: 'name',
            key: 'name',
            width: 120,
        },
        {
            title: '部門ID',
            dataIndex: 'deptId',
            key: 'deptId',
            width: 120,
        },
        {
            title: 'ログインユーザー名',
            dataIndex: 'loginUsername',
            key: 'loginUsername',
            width: 160,
        },
        {
            title: 'Domain状態',
            dataIndex: 'domainName',
            key: 'domainName',
            width: 120,
            render: (_: string, record: DevicePermissionList) => {
                if (record.domainStatus != null) {
                    const label = getLabel(domainStatusOptions, record.domainStatus);
                    if (label !== '-') {
                        const color = 
                            label === '参加済み' ? 'green' :
                            label === '未参加' ? 'red' : 'blue';
                        return <Tag color={color}>{label}</Tag>;
                    }
                }
                return '-';
            },
        },
        {
            title: 'Domainグループ',
            dataIndex: 'domainGroup',
            key: 'domainGroup',
            width: 160,
            render: (text: string) => text || '-',
        },
        {
            title: 'SmartIT状態',
            dataIndex: 'smartitStatus',
            key: 'smartitStatus',
            width: 120,
            render: (_: number, record: DevicePermissionList) => {
                if (record.smartitStatus != null) {
                    const label = getLabel(smartitStatusOptions, record.smartitStatus);
                    if (label !== '-') {
                        const color = 
                            label === 'インストール済み' || label === 'ローカル' || label === 'リモート' ? 'green' :
                            label === '未インストール' || label === '未インストール' ? 'red' : 'orange';
                        return <Tag color={color}>{label}</Tag>;
                    }
                }
                return '-';
            },
        },
        {
            title: 'USB状態',
            dataIndex: 'usbStatus',
            key: 'usbStatus',
            width: 100,
            render: (_: number, record: DevicePermissionList) => {
                if (record.usbStatus != null) {
                    const label = getLabel(usbStatusOptions, record.usbStatus);
                    if (label !== '-') {
                        const color = 
                            label === '一時許可' || label === '許可' || label === 'データ' || label === '3Gモデム' ? 'green' :
                            label === '禁止' || label === '閉じる' ? 'red' : 'orange';
                        return <Tag color={color}>{label}</Tag>;
                    }
                }
                return '-';
            },
        },
        {
            title: 'USBの有効期限',
            dataIndex: 'usbExpireDate',
            key: 'usbExpireDate',
            width: 150,
            render: (date: string | null) => {
                if (date) {
                    try {
                        return dayjs(date).format('YYYY-MM-DD');
                    } catch (e) {
                        return date;
                    }
                }
                return '-';
            },
        },
        {
            title: 'アンチウイルス状態',
            dataIndex: 'antivirusStatus',
            key: 'antivirusStatus',
            width: 160,
            render: (_: number, record: DevicePermissionList) => {
                if (record.antivirusStatus != null) {
                    const label = getLabel(antivirusStatusOptions, record.antivirusStatus);
                    if (label !== '-') {
                        const color = 
                            label === '有効期限切れ' || label === 'インストール済み' || label === '自動' ? 'green' :
                            label === '未インストール' || label === '無接続' ? 'red' :
                            label === '手動' ? 'orange' : 'default';
                        return <Tag color={color}>{label}</Tag>;
                    }
                }
                return '-';
            },
        },
        {
            title: '備考',
            dataIndex: 'remark',
            key: 'remark',
            width: 200,
            ellipsis: true,
            render: (text: string) => text || '-',
        },
        {
            title: '操作',
            key: 'action',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Button
                    type="link"
                    size="small"
                    onClick={() => onEdit(record.permissionId)}
                >
                    詳細
                </Button>
            ),
        },
    ];

    return (
        <>
            <style>{`
                .ant-pagination {
                    display: flex !important;
                    justify-content: center !important;
                }
            `}</style>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="permissionId"
                loading={loading}
                scroll={{ x: 2000 }}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `全${total}件`,
                    onChange: onPageChange,
                    onShowSizeChange: (_current, size) => {
                        onPageChange(1, size);
                    },
                }}
            />
        </>
    );
};

export default PermissionTable;
