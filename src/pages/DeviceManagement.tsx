// pages/DeviceManagement.tsx
import React, { useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Input, 
  Select, 
  Row, 
  Col, 
  Pagination 
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  RedoOutlined 
} from '@ant-design/icons';
import Layout from '../components/common/Layout';
import DeviceFormModal from '../components/device/DeviceFormModal';
import { useDeviceStore } from '../stores/deviceStore';

import type {
  DeviceListItem,
  DeviceIp,
  Monitor
} from '../types/device';

const { Search } = Input;
const { Option } = Select;

const DeviceManagement: React.FC = () => {
  // 使用 Zustand store
  const {
    devices,
    loading,
    searchParams,
    total,
    formVisible,
    isEditing,
    selectedDevice,
    dictData,
    users,
    projectOptions,
    devRoomOptions,
    userIdSearch,
    projectFilter,
    devRoomFilter,
    fetchDevices,
    handlePageChange,
    handlePageSizeChange,
    handleEditDevice,
    handleDeleteDevice,
    handleAddDevice,
    handleUserIdSearch,
    handleProjectChange,
    handleDevRoomChange,
    handleReset,
    handleFormSubmit,
    initialize
  } = useDeviceStore();

  // 初始化数据
  useEffect(() => {
    initialize();
  }, []);

  // 单元格样式
  const cellStyle: React.CSSProperties = {
    textAlign: 'center',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  // 表格列定义
  const columns = [
    {
      title: '主机编号',
      dataIndex: 'deviceId',
      key: 'deviceId',
      align: 'center' as const,
      width: 150,
      ellipsis: true,
      render: (text: string) => (
        <div style={{ ...cellStyle, maxWidth: '150px' }} title={text}>
          {text}
        </div>
      ),
    },
    {
      title: '显示器',
      dataIndex: 'monitors',
      key: 'monitors',
      align: 'center' as const,
      width: 180,
      ellipsis: true,
      render: (monitors: Monitor[] | null | undefined) => {
        const monitorNames = monitors?.map(m => m.monitorName).filter(Boolean) || [];
        const text = monitorNames.length > 0 ? monitorNames.join('\n') : '-';
        return (
          <div 
            style={{ 
              ...cellStyle, 
              maxWidth: '180px',
              whiteSpace: 'pre-line',
              textAlign: 'center'
            }} 
            title={text}
          >
            {text}
          </div>
        );
      },
    },
    {
      title: '用户姓名',
      dataIndex: 'userName',
      key: 'userName',
      align: 'center' as const,
      width: 100,
      ellipsis: true,
      render: (text: string | null | undefined) => (
        <div style={{ ...cellStyle, maxWidth: '100px' }} title={text || '-'}>
          {text || '-'}
        </div>
      ),
    },
    {
      title: '用户工号',
      dataIndex: 'userId',
      key: 'userId',
      align: 'center' as const,
      width: 100,
      ellipsis: true,
      render: (text: string | null | undefined) => (
        <div style={{ ...cellStyle, maxWidth: '100px' }} title={text || '-'}>
          {text || '-'}
        </div>
      ),
    },
    {
      title: '主机型号',
      dataIndex: 'deviceModel',
      key: 'deviceModel',
      align: 'center' as const,
      width: 120,
      ellipsis: true,
      render: (text: string | null | undefined) => (
        <div style={{ ...cellStyle, maxWidth: '120px' }} title={text || '-'}>
          {text || '-'}
        </div>
      ),
    },
    {
      title: '电脑名',
      dataIndex: 'computerName',
      key: 'computerName',
      align: 'center' as const,
      width: 120,
      ellipsis: true,
      render: (text: string | null | undefined) => (
        <div style={{ ...cellStyle, maxWidth: '120px' }} title={text || '-'}>
          {text || '-'}
        </div>
      ),
    },
    {
      title: '登录用户名',
      dataIndex: 'loginUsername',
      key: 'loginUsername',
      align: 'center' as const,
      width: 120,
      ellipsis: true,
      render: (text: string | null | undefined) => (
        <div style={{ ...cellStyle, maxWidth: '120px' }} title={text || '-'}>
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'IP地址',
      dataIndex: 'deviceIps',
      key: 'deviceIps',
      align: 'center' as const,
      width: 150,
      ellipsis: true,
      render: (deviceIps: DeviceIp[] | null | undefined) => {
        const ipAddresses = deviceIps?.map(ip => ip.ipAddress).filter(Boolean) || [];
        const text = ipAddresses.length > 0 ? ipAddresses.join('\n') : '-';
        return (
          <div 
            style={{ 
              ...cellStyle, 
              maxWidth: '150px',
              whiteSpace: 'pre-line',
              textAlign: 'center'
            }} 
            title={text}
          >
            {text}
          </div>
        );
      },
    },
    {
      title: '操作系统',
      dataIndex: 'osName',
      key: 'osName',
      align: 'center' as const,
      width: 120,
      ellipsis: true,
      render: (text: string) => (
        <div style={{ ...cellStyle, maxWidth: '120px' }} title={text}>
          {text}
        </div>
      ),
    },
    {
      title: '内存(G)',
      dataIndex: 'memorySize',
      key: 'memorySize',
      align: 'center' as const,
      width: 80,
      ellipsis: true,
      render: (text: string) => (
        <div style={{ ...cellStyle, maxWidth: '80px' }} title={text}>
          {text}
        </div>
      ),
    },
    {
      title: 'SSD(G)',
      dataIndex: 'ssdSize',
      key: 'ssdSize',
      align: 'center' as const,
      width: 80,
      ellipsis: true,
      render: (text: string) => (
        <div style={{ ...cellStyle, maxWidth: '80px' }} title={text}>
          {text}
        </div>
      ),
    },
    {
      title: 'HDD(G)',
      dataIndex: 'hddSize',
      key: 'hddSize',
      align: 'center' as const,
      width: 80,
      ellipsis: true,
      render: (text: string) => (
        <div style={{ ...cellStyle, maxWidth: '80px' }} title={text}>
          {text}
        </div>
      ),
    },
    {
      title: '项目',
      dataIndex: 'project',
      key: 'project',
      align: 'center' as const,
      width: 100,
      ellipsis: true,
      render: (text: string | null | undefined) => (
        <div style={{ ...cellStyle, maxWidth: '100px' }} title={text || '-'}>
          {text || '-'}
        </div>
      ),
    },
    {
      title: '开发室',
      dataIndex: 'devRoom',
      key: 'devRoom',
      align: 'center' as const,
      width: 100,
      ellipsis: true,
      render: (text: string | null | undefined) => (
        <div style={{ ...cellStyle, maxWidth: '100px' }} title={text || '-'}>
          {text || '-'}
        </div>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      align: 'center' as const,
      width: 150,
      ellipsis: true,
      render: (text: string | null | undefined) => (
        <div style={{ ...cellStyle, maxWidth: '150px' }} title={text || '-'}>
          {text || '-'}
        </div>
      ),
    },
    {
      title: '确认状态',
      key: 'confirmStatus',
      dataIndex: 'confirmStatus',
      align: 'center' as const,
      width: 100,
      fixed: 'right' as const,
      render: (status: string) => {
        const color = status === '已确认' ? 'green' : 'default';
        return (
          <div style={cellStyle}>
            <Tag color={color}>{status}</Tag>
          </div>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      align: 'center' as const,
      width: 150,
      fixed: 'right' as const,
      render: (_: string | undefined, record: DeviceListItem) => (
        <div style={{ ...cellStyle, padding: '0 4px' }}>
          <Space size={[4, 0]} wrap>
            <Button 
              type="link" 
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditDevice(record)}
              style={{ padding: '0 4px' }}
            >
              编辑
            </Button>
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDeleteDevice(record.deviceId)}
              style={{ padding: '0 4px' }}
            >
              删除
            </Button>
          </Space>
        </div>
      ),
    },
  ];

  return (
    <Layout title="设备管理">
      <div style={{ 
        height: 'calc(94vh-200px)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        padding: '20px',
        overflow: 'hidden'
      }}>
        
        {/* 顶部搜索区 */}
        <div style={{ marginBottom: 20, flexShrink: 0 }}>
          <Row gutter={16} align="middle" justify="space-between">
            <Col>
              <Space>
                <Search
                  placeholder="输入用户工号进行搜索"
                  allowClear
                  enterButton={<SearchOutlined />}
                  onSearch={handleUserIdSearch}
                  onChange={(e) => handleUserIdSearch(e.target.value)}
                  value={userIdSearch}
                  style={{ width: 240 }}
                />
                <Select 
                  placeholder="项目筛选" 
                  style={{ width: 120 }}
                  value={projectFilter}
                  onChange={handleProjectChange}
                >
                  <Option value="all">全部项目</Option>
                  {projectOptions.map(project => (
                    <Option key={project} value={project}>{project}</Option>
                  ))}
                </Select>
                <Select 
                  placeholder="开发室筛选" 
                  style={{ width: 120 }}
                  value={devRoomFilter}
                  onChange={handleDevRoomChange}
                >
                  <Option value="all">全部开发室</Option>
                  {devRoomOptions.map(room => (
                    <Option key={room} value={room}>{room}</Option>
                  ))}
                </Select>
                <Button 
                  icon={<RedoOutlined />}
                  onClick={handleReset}
                >
                  重置
                </Button>
              </Space>
            </Col>
            <Col>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddDevice}
              >
                添加设备
              </Button>
            </Col>
          </Row>
        </div>

        {/* 表格区域 */}
        <div style={{ 
          flex: '0 1 auto',
          overflow: 'hidden' 
        }}>
          <Table<DeviceListItem>
            rowKey="deviceId"
            columns={columns}
            dataSource={devices}
            loading={loading}
            scroll={{
              x: 1950,
            }}
            pagination={false}
            size="middle"
            bordered={false}
            style={{ margin: 0, padding: 0 }}
          />
        </div>

        {/* 分页区域 */}
        <div style={{ 
          marginTop: 16,
          flexShrink: 0,
          textAlign: 'right',
          paddingRight: 10
        }}>
          <Pagination
            current={searchParams.page}
            pageSize={searchParams.pageSize}
            total={total}
            onChange={handlePageChange}
            onShowSizeChange={handlePageSizeChange}
            showQuickJumper
            showSizeChanger
            showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
            pageSizeOptions={['10', '15', '20']}
          />
        </div>

        {/* 设备表单弹窗 */}
        <DeviceFormModal
          visible={formVisible}
          isEditing={isEditing}
          device={selectedDevice}
          dictData={dictData}
          users={users}
          onCancel={() => {
            // 关闭弹窗
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
