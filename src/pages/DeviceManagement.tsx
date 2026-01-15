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
    userIdSearch, fetchDevices, handlePageChange, handlePageSizeChange,
    handleEditDevice, handleDeleteDevice, handleAddDevice,
    handleUserIdSearch, handleFormSubmit, initialize
  } = useDeviceStore();

  useEffect(() => { initialize(); }, []);

  const cellStyle: React.CSSProperties = {
    textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap',
    overflow: 'hidden', textOverflow: 'ellipsis',
  };

  

  const columns: ColumnsType<DeviceListItem> = [
    {
      title: '主机编号',
      dataIndex: 'deviceId',
      key: 'deviceId',
      align: 'center',
      width: 180,
      ellipsis: true,
      render: (t: string) => (
        <div style={{ textAlign: 'center', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t}>
          {t}
        </div>
      ),
    },
    {
      title: '显示器',
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
    { title: '用户姓名', dataIndex: 'userName', key: 'userName', align: 'center', width: 100, ellipsis: true, render: (t) => t || '-' },
    { title: '用户工号', dataIndex: 'userId', key: 'userId', align: 'center', width: 100, ellipsis: true, render: (t) => t || '-' },
    { title: '主机型号', dataIndex: 'deviceModel', key: 'deviceModel', align: 'center', width: 120, ellipsis: true, render: (t) => t || '-' },
    { title: '电脑名', dataIndex: 'computerName', key: 'computerName', align: 'center', width: 120, ellipsis: true, render: (t) => t || '-' },
    {
      title: 'IP地址',
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
    { title: '操作系统', dataIndex: 'osName', key: 'osName', align: 'center', width: 120, ellipsis: true },
    { title: '内存(G)', dataIndex: 'memorySize', key: 'memorySize', align: 'center', width: 80, ellipsis: true },
    { title: 'SSD(G)', dataIndex: 'ssdSize', key: 'ssdSize', align: 'center', width: 80, ellipsis: true },
    { title: 'HDD(G)', dataIndex: 'hddSize', key: 'hddSize', align: 'center', width: 80, ellipsis: true },
    { title: '项目', dataIndex: 'project', key: 'project', align: 'center', width: 100, ellipsis: true, render: (t) => t || '-' },
    { title: '开发室', dataIndex: 'devRoom', key: 'devRoom', align: 'center', width: 100, ellipsis: true, render: (t) => t || '-' },
    { title: '备注', dataIndex: 'remark', key: 'remark', align: 'center', width: 150, ellipsis: true, render: (t) => t || '-' },
    {
      title: '确认状态',
      dataIndex: 'confirmStatus',
      key: 'confirmStatus',
      align: 'center',
      width: 100,
      fixed: 'right',
      render: (s: string) => <Tag color={s === '已确认' ? 'green' : 'default'}>{s}</Tag>,
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
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} size="small" onClick={() => handleDeleteDevice(r.deviceId)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout title="设备管理">
      <div style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column', background: '#fff', padding: 20, overflow: 'hidden' }}>
        {/* 顶部搜索区 - 仅保留工号搜索 & 添加按钮 */}
        <div style={{ marginBottom: 20, flexShrink: 0 }}>
          <Row gutter={16} align="middle" justify="space-between">
            <Col>
              <Search
                placeholder="输入用户工号进行搜索"
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={handleUserIdSearch}
                onChange={(e) => handleUserIdSearch(e.target.value)}
                value={userIdSearch}
                style={{ width: 240 }}
              />
            </Col>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDevice}>添加设备</Button>
            </Col>
          </Row>
        </div>

        {/* 表格 */}
        <div style={{ flex: '1 1 auto', overflowX: 'auto', overflowY: 'hidden', minWidth: '100%' }}>
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

        {/* 分页 */}
        <div style={{ marginTop: 16, flexShrink: 0, textAlign: 'right', paddingRight: 10 }}>
          <Pagination
            current={searchParams.page}
            pageSize={searchParams.pageSize}
            total={total}
            onChange={handlePageChange}
            onShowSizeChange={handlePageSizeChange}
            showQuickJumper
            showSizeChanger
            showTotal={(t, r) => `第 ${r[0]}-${r[1]} 条，共 ${t} 条`}
            pageSizeOptions={['10', '15', '20']}
          />
        </div>

        <DeviceFormModal
          visible={formVisible}
          isEditing={isEditing}
          device={selectedDevice}
          dictData={{}}
          users={[]}
          onCancel={() => {
            useDeviceStore.getState().setFormVisible(false);
            useDeviceStore.getState().setIsEditing(false);
            useDeviceStore.getState().setSelectedDevice(null);
          }}
          onSubmit={handleFormSubmit}
        />
      </div>
    </Layout>
  );
};

export default DeviceManagement;