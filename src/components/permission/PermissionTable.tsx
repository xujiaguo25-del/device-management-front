import React from 'react';
import { Table, Button, Tag } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
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
    isAdmin = true,
}) => {
    // 获取字典数据（与详情页面保持一致）
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

    // 辅助函数：从 dictId 查找 dictItemName（与详情页面保持一致）
    const getLabel = (options: DictItem[], dictId?: number | null) => {
        if (dictId == null) return '-';
        const it = options.find(o => o.dictId === dictId);
        return it ? it.dictItemName : '-';
    };


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
            title: '登录用户名',
            dataIndex: 'loginUsername',
            key: 'loginUsername',
            width: 120,
        },
        {
            title: 'Domain状态',
            dataIndex: 'domainName',
            key: 'domainName',
            width: 120,
            render: (_: string, record: DevicePermissionList) => {
                // 只使用 domainStatus (dictId) 从字典数据获取显示文本
                // 不显示原始值如 "D1"、"D2" 等
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
            title: 'Domain组',
            dataIndex: 'domainGroup',
            key: 'domainGroup',
            width: 120,
            render: (text: string) => text || '-',
        },
        {
            title: 'SmartIT状态',
            dataIndex: 'smartitStatus',
            key: 'smartitStatus',
            width: 120,
            render: (_: number, record: DevicePermissionList) => {
                // 直接使用 smartitStatus (dictId) 从字典数据获取显示文本
                if (record.smartitStatus != null) {
                    const label = getLabel(smartitStatusOptions, record.smartitStatus);
                    if (label !== '-') {
                        const color = 
                            label === 'インストール済み' || label === '本地' || label === '远程' ? 'green' :
                            label === '未インストール' || label === '未安装' ? 'red' : 'orange';
                        return <Tag color={color}>{label}</Tag>;
                    }
                }
                return '-';
            },
        },
        {
            title: 'USB状态',
            dataIndex: 'usbStatus',
            key: 'usbStatus',
            width: 100,
            render: (_: number, record: DevicePermissionList) => {
                // 直接使用 usbStatus (dictId) 从字典数据获取显示文本
                if (record.usbStatus != null) {
                    const label = getLabel(usbStatusOptions, record.usbStatus);
                    if (label !== '-') {
                        const color = 
                            label === '一時許可' || label === '許可' || label === '数据' || label === '3G网卡' ? 'green' :
                            label === '禁止' || label === '关闭' ? 'red' : 'orange';
                        return <Tag color={color}>{label}</Tag>;
                    }
                }
                return '-';
            },
        },
        {
            title: 'USB过期日期',
            dataIndex: 'usbExpireDate',
            key: 'usbExpireDate',
            width: 120,
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
            title: '防病毒状态',
            dataIndex: 'antivirusStatus',
            key: 'antivirusStatus',
            width: 120,
            render: (_: number, record: DevicePermissionList) => {
                // 直接使用 antivirusStatus (dictId) 从字典数据获取显示文本
                if (record.antivirusStatus != null) {
                    const label = getLabel(antivirusStatusOptions, record.antivirusStatus);
                    if (label !== '-') {
                        const color = 
                            label === '有効期限切れ' || label === 'インストール済み' || label === '自动' ? 'green' :
                            label === '未インストール' || label === '无连接' ? 'red' :
                            label === '手动' ? 'orange' : 'default';
                        return <Tag color={color}>{label}</Tag>;
                    }
                }
                return '-';
            },
        },
        {
            title: '备注',
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
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => onEdit(record.permissionId)}
                >
                    查看详情
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
                    showTotal: (total) => `共 ${total} 条`,
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
