import React from 'react';
import { Table, Button, Tag } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { DevicePermissionList } from '../../types';

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
}

const PermissionTable: React.FC<PermissionTableProps> = ({
    data,
    loading,
    pagination,
    onPageChange,
    onEdit,
}) => {
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
            render: (domainName: string) => domainName || '-',
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
            render: (_: number, record: DevicePermissionList) => {
                // 优先使用存储的文本值
                const statusText = record.smartitStatusText;
                let color = 'default';
                
                if (statusText) {
                    // 根据文本值设置颜色
                    if (statusText === '本地' || statusText === '远程') {
                        color = 'green';
                    } else if (statusText === '未安装') {
                        color = 'red';
                    } else {
                        color = 'orange';
                    }
                    return <Tag color={color}>{statusText}</Tag>;
                } else {
                    // 如果没有文本值，根据数字转换（兼容旧数据）
                    const status = record.smartitStatus;
                    if (status === 1) {
                        return <Tag color="green">本地</Tag>;
                    } else if (status === 0) {
                        return <Tag color="red">未安装</Tag>;
                    } else {
                        return <Tag>-</Tag>;
                    }
                }
            },
        },
        {
            title: 'USB状态',
            dataIndex: 'usbStatus',
            key: 'usbStatus',
            width: 100,
            render: (_: number, record: DevicePermissionList) => {
                // 优先使用存储的文本值
                const statusText = record.usbStatusText;
                let color = 'default';
                
                if (statusText) {
                    // 根据文本值设置颜色
                    if (statusText === '数据' || statusText === '3G网卡') {
                        color = 'green';
                    } else if (statusText === '关闭') {
                        color = 'red';
                    } else {
                        color = 'orange';
                    }
                    return <Tag color={color}>{statusText}</Tag>;
                } else {
                    // 如果没有文本值，根据数字转换（兼容旧数据）
                    const status = record.usbStatus;
                    if (status === 1) {
                        return <Tag color="green">数据</Tag>;
                    } else if (status === 0) {
                        return <Tag color="red">关闭</Tag>;
                    } else {
                        return <Tag>-</Tag>;
                    }
                }
            },
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
            render: (status: number, record: DevicePermissionList) => {
                // 优先使用存储的文本值，如果没有则根据数字转换
                let statusText = record.antivirusStatusText;
                let color = 'default';
                
                if (!statusText) {
                    // 如果没有文本值，根据数字转换
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
                    // 根据文本值设置颜色
                    if (statusText === '自动') {
                        color = 'green';
                    } else if (statusText === '手动') {
                        color = 'orange';
                    }
                }
                return <Tag color={color}>{statusText || '-'}</Tag>;
            },
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
