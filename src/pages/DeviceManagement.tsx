// pages/DeviceManagement.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Table, Button, Space, Tag, Input, Row, Col, Pagination, Spin, Upload, message } from 'antd';
import {
  SearchOutlined, PlusOutlined, UploadOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd/es/upload/interface';
import Layout from '../components/common/Layout';
import DeviceFormModal from '../components/device/DeviceFormModal';
import { useDeviceStore } from '../stores/deviceStore';
import type { DeviceListItem, DeviceIp, Monitor } from '../types/index';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '../stores/authStore';
import { importDevicesFromExcel } from '../services/device/deviceService';

const { Search } = Input;

const DeviceManagement: React.FC = () => {
  const {
    devices, loading, searchParams, total, formVisible, isEditing, selectedDevice,
    userIdSearch, users,fetchDevices, handlePageChange, handlePageSizeChange,
    handleEditDevice, handleDeleteDevice, handleAddDevice,
    handleUserIdSearch, handleFormSubmit, initialize,
    setFormVisible, setIsEditing, setSelectedDevice, setUserIdSearch
  } = useDeviceStore();


  const { userInfo, isLoading: authLoading } = useAuthStore();


  const isAdmin = userInfo?.USER_TYPE_NAME === 'admin';

  // テーブルコンテナの参照と高さ状態
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableHeight] = useState<number>(600);

  // Excelアップロードハンドラー
  const handleUpload: UploadProps['beforeUpload'] = async (file) => {
    try {
      message.loading('インポート中...', 0);
      const result = await importDevicesFromExcel(file);
      message.destroy();
      
      if (result.success) {
        message.success(result.message || 'インポートが成功しました');
        // インポート成功後、デバイスリストを更新します
        fetchDevices();
      } else {
        message.error(result.message || 'インポートに失敗しました');
      }
    } catch (error: any) {
      message.destroy();
      message.error(error.message || 'インポート中にエラーが発生しました');
    }
    
    // falseを返して、自動アップロードを防止します
    return false;
  };

  // リサイズオブザーバーでテーブルコンテナの高さを監視
  useEffect(() => {
    console.log('userInfo 变化:', userInfo);

    if (userInfo) {
      console.log('调用 initialize，参数:', {
        isAdmin,
        userId: userInfo.USER_ID
      });

      initialize(isAdmin, userInfo.USER_ID);
    } else {
      console.log('userInfo 为空，等待加载...');
    }
  }, [userInfo]);


  if (authLoading) {
    return (
        <Layout title="设备管理">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Spin size="large" tip="加载用户信息..." />
          </div>
        </Layout>
    );
  }

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
    { title: 'ログインユーザー名', dataIndex: 'loginUsername', key: 'loginUsername', align: 'center', width: 130, ellipsis: true, render: (t) => t || '-' },
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
    { title: 'OS', dataIndex: 'osName', key: 'osName', align: 'center', width: 120, ellipsis: true, render: (t) => t || '-' },
    { title: 'メモリ(G)', dataIndex: 'memorySize', key: 'memorySize', align: 'center', width: 80, ellipsis: true, render: (t) => t || '-' },
    { 
      title: 'ストレージ(G)', 
      key: 'storage',
      align: 'center',
      width: 100,
      render: (_: any, record: DeviceListItem) => {
        const items: string[] = [];
        if (record.ssdSize && record.ssdSize !== '-') {
          items.push(`SSD: ${record.ssdSize}`);
        }
        if (record.hddSize && record.hddSize !== '-') {
          items.push(`HDD: ${record.hddSize}`);
        }
        
        if (items.length === 0) {
          return <div style={{ textAlign: 'center' }}>-</div>;
        }
        
        return (
          <div style={{ textAlign: 'center' }}>
            {items.map((item, index) => (
              <div key={index}>{item}</div>
            ))}
          </div>
        );
      },
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
      render: (s: string) => <Tag color={s === '已确认' || s === '確認済み' ? 'green' : 'red'}>{s}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 150,
      fixed: 'right',
      render: (_: any, r: DeviceListItem) => (
        <Space size={[4, 0]} wrap={false} style={{ whiteSpace: 'nowrap' }}>
          <Button type="link" size="small" onClick={() => handleEditDevice(r)}>
            編集
          </Button>
          {isAdmin && (
          <Button type="link" danger size="small" onClick={() => handleDeleteDevice(r.deviceId)}>
            削除
          </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout title="デバイス管理">
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        background: '#fff', 
        padding: 16, 
        height: '100%', 
        overflow: 'hidden' 
      }}>
        {/* 上部検索エリア */}
        <div style={{ marginBottom: 20, flexShrink: 0 }}>
          <Row gutter={16} align="middle" justify="space-between">
            {isAdmin && (
            <Col>
              <Search
                placeholder="ユーザーIDで検索"
                allowClear
                enterButton={<div style={{ display: 'flex', alignItems: 'center' }}><SearchOutlined />&nbsp;&nbsp;検索</div>}
                onSearch={handleUserIdSearch}
                onChange={(e) => setUserIdSearch(e.target.value)}
                value={userIdSearch}
                style={{ width: 240, padding: '0 0 6px' }}
              />

            </Col>
            )}
            {isAdmin && (
            <Col>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDevice}>デバイスを追加</Button>
                <Upload
                  name="file"
                  beforeUpload={handleUpload}
                  showUploadList={false}
                  accept=".xlsx,.xls"
                >
                  <Button icon={<UploadOutlined />}>Excelをインポート</Button>
                </Upload>
              </Space>
            </Col>
            )}
          </Row>
        </div>

        {/* テーブルコンテナ - リサイズ監視用 */}
        <div 
          ref={tableContainerRef}
          style={{ 
            flex: 1,
            minHeight: 0, // flexコンテナで必要
            position: 'relative',
            transition: 'all 0.3s ease' // スムーズなトランジション
          }}
        >
          {/* 絶対配置で内部スクロールを実現 */}
          <div style={{
            position: 'absolute',
            top: -12,
            left: 0,
            right: 0,
            bottom: -36,
            overflow: 'hidden'
          }}>
            <style>{`
              ::-webkit-scrollbar {
                display: none; /* Chrome, Safari and Opera */
              }
            `}</style>
          <Table<DeviceListItem>
            rowKey="deviceId"
            columns={columns}
            dataSource={devices}
            loading={loading}
            scroll={{ 
              x: 2200,
              y: tableHeight-8 // マージンを考慮
            }}
            pagination={false}
            size="middle"
            bordered={false}
            style={{
              transition: 'all 0.3s ease',
              // スクロールバーを自動的に非表示にする
              scrollbarWidth: 'none',  /* Firefox */
              msOverflowStyle: 'none', /* IE and Edge */
            }}
          />
          </div>
        </div>

        {/* ページネーション */}
        <div style={{ 
          marginTop: 40, 
          flexShrink: 0, 
          display: 'flex',
          justifyContent: 'center',
          transition: 'all 0.3s ease' // ページネーションもトランジション
        }}>
          <Pagination
            current={searchParams.page}
            pageSize={searchParams.pageSize}
            total={total}
            onChange={handlePageChange}
            onShowSizeChange={handlePageSizeChange}
            showQuickJumper
            showSizeChanger
            showTotal={(t, r) => `全 ${t} 件`}
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
          isAdmin={isAdmin}
          currentUserId={userInfo?.USER_ID}
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