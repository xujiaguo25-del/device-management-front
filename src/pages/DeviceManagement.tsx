// pages/DeviceManagement.tsx
import React, { useEffect } from 'react';
import {
  Table, Button, Space, Tag, Input, Row, Col, Pagination
} from 'antd';
import {
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import Layout from '../components/common/Layout';
import DeviceFormModal from '../components/device/DeviceFormModal';
import { useDeviceStore } from '../stores/deviceStore';
import type { DeviceListItem, DeviceIp, Monitor } from '../types/device';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;

const DeviceManagement: React.FC = () => {
  const {
    devices, loading, searchParams, total, formVisible, isEditing, selectedDevice,
    userIdSearch, users, fetchDevices, handlePageChange, handlePageSizeChange,
    handleEditDevice, handleDeleteDevice, handleAddDevice,
    handleUserIdSearch, handleFormSubmit, initialize,
    setFormVisible, setIsEditing, setSelectedDevice
  } = useDeviceStore();

  // コンポーネントマウント時に初期化
  useEffect(() => { initialize(); }, []);

  // テーブル列定義
  const columns: ColumnsType<DeviceListItem> = [
    {
      title: 'デバイス番号',
      dataIndex: 'deviceId',
      key: 'deviceId',
      align: 'center',
      width: 180,
      render: (t: string) => (
        <div style={{ textAlign: 'center', wordBreak: 'break-word', whiteSpace: 'normal' }} title={t}>
          {t || '-'}
        </div>
      ),
    },
    {
      title: 'モニター',
      dataIndex: 'monitors',
      key: 'monitors',
      align: 'center',
      width: 180,
      ellipsis: true,
      render: (m: Monitor[] | null) => (
        <div style={{ whiteSpace: 'pre-line', textAlign: 'center' }}>
          {m?.map((i) => i.monitorName).filter(Boolean).join('\n') || '-'}
        </div>
      ),
    },
    { 
      title: 'ユーザー情報', 
      key: 'userInfo',
      align: 'center',
      width: 120,
      render: (_: any, record: DeviceListItem) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 500 }}>{record.userName || '-'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.userId || '-'}</div>
        </div>
      ),
    },
    { title: 'デバイスモデル', dataIndex: 'deviceModel', key: 'deviceModel', align: 'center', width: 120, ellipsis: true, render: (t) => t || '-' },
    { title: 'コンピュータ名', dataIndex: 'computerName', key: 'computerName', align: 'center', width: 120, ellipsis: true, render: (t) => t || '-' },
    {
      title: 'IPアドレス',
      dataIndex: 'deviceIps',
      key: 'deviceIps',
      align: 'center',
      width: 150,
      ellipsis: true,
      render: (ips: DeviceIp[] | null) => (
        <div style={{ whiteSpace: 'pre-line', textAlign: 'center' }}>
          {ips?.map((i) => i.ipAddress).filter(Boolean).join('\n') || '-'}
        </div>
      ),
    },
    { title: 'OS', dataIndex: 'osName', key: 'osName', align: 'center', width: 120, ellipsis: true },
    { title: 'メモリ(G)', dataIndex: 'memorySize', key: 'memorySize', align: 'center', width: 80, ellipsis: true },
    { 
      title: 'ストレージ(G)', 
      key: 'storage',
      align: 'center',
      width: 100,
      render: (_: any, record: DeviceListItem) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px' }}>SSD: {record.ssdSize || '-'}</div>
          <div style={{ fontSize: '12px' }}>HDD: {record.hddSize || '-'}</div>
        </div>
      ),
    },
    { title: 'プロジェクト', dataIndex: 'project', key: 'project', align: 'center', width: 100, ellipsis: true, render: (t) => t || '-' },
    { title: '開発室', dataIndex: 'devRoom', key: 'devRoom', align: 'center', width: 100, ellipsis: true, render: (t) => t || '-' },
    { 
      title: '備考', 
      dataIndex: 'remark', 
      key: 'remark', 
      align: 'center', 
      width: 150,
      render: (t) => (
        <div style={{ textAlign: 'center', wordBreak: 'break-word', whiteSpace: 'normal' }} title={t}>
          {t || '-'}
        </div>
      ),
    },
    {
      title: '確認状態',
      dataIndex: 'confirmStatus',
      key: 'confirmStatus',
      align: 'center',
      width: 100,
      fixed: 'right',
      render: (s: string) => <Tag color={s === '已确认' ? 'green' : 'red'}>{s}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 150,
      fixed: 'right',
      render: (_: any, r: DeviceListItem) => (
        <Space size={[4, 0]} wrap={false} style={{ whiteSpace: 'nowrap' }}>
          <Button type="link" icon={<EditOutlined />} size="small" onClick={() => handleEditDevice(r)}>
            編集
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} size="small" onClick={() => handleDeleteDevice(r.deviceId)}>
            削除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout title="デバイス管理">
      <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', padding: 20, minHeight: 'calc(100vh - 150px)' }}>
        {/* 上部検索エリア */}
        <div style={{ marginBottom: 20, flexShrink: 0 }}>
          <Row gutter={16} align="middle" justify="space-between">
            <Col>
              <Search
                placeholder="ユーザーIDで検索"
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={handleUserIdSearch}
                onChange={(e) => handleUserIdSearch(e.target.value)}
                value={userIdSearch}
                style={{ width: 240 }}
              />
            </Col>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDevice}>デバイスを追加</Button>
            </Col>
          </Row>
        </div>

        {/* テーブル */}
        <div style={{ flex: '1 1 auto', minWidth: '100%' }}>
          <Table<DeviceListItem>
            rowKey="deviceId"
            columns={columns}
            dataSource={devices}
            loading={loading}
            scroll={{ x: 2200 }}
            pagination={false}
            size="middle"
            bordered={false}
          />
        </div>

        {/* ページネーション */}
        <div style={{ marginTop: 16, flexShrink: 0, textAlign: 'right', paddingRight: 10 }}>
          <Pagination
            current={searchParams.page}
            pageSize={searchParams.pageSize}
            total={total}
            onChange={handlePageChange}
            onShowSizeChange={handlePageSizeChange}
            showQuickJumper
            showSizeChanger
            showTotal={(t, r) => `${r[0]}-${r[1]} 件目、全 ${t} 件`}
            pageSizeOptions={['10', '15', '20']}
          />
        </div>

        {/* デバイスフォームモーダル */}
        <DeviceFormModal
          visible={formVisible}
          isEditing={isEditing}
          device={selectedDevice}
          dictData={{}}
          users={users}
          onCancel={() => {
            setFormVisible(false);
            setIsEditing(false);
            setSelectedDevice(null);
          }}
          onSubmit={handleFormSubmit}
        />
      </div>
    </Layout>
  );
};

export default DeviceManagement;