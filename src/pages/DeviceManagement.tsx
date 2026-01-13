// pages/DeviceManagement.tsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Select, Row, Col, Modal, message, Pagination } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import Layout from '../components/common/Layout';
import type { DeviceListItem, DeviceQueryParams } from '../types/index';
import { getDeviceList } from '../services/device/deviceService'; // 导入 service

const { Search } = Input;
const { Option } = Select;

const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState<DeviceListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<DeviceQueryParams>({
    page: 1,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceListItem | null>(null);

  // 获取设备列表
  const fetchDevices = async (params: DeviceQueryParams) => {
    setLoading(true);
    try {
      const response = await getDeviceList(params);
      setDevices(response.data.list);
      setTotal(response.data.total);
    } catch (error) {
      message.error('获取设备列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices(searchParams);
  }, [searchParams]);

  // 处理分页变化
  const handlePageChange = (page: number, pageSize?: number) => {
    setSearchParams({
      ...searchParams,
      page,
      pageSize: pageSize || searchParams.pageSize,
    });
  };

  // 处理页面大小变化
  const handlePageSizeChange = (size: number) => {
    setSearchParams({
      ...searchParams,
      page: 1,
      pageSize: size,
    });
  };

  // 定义单元格样式
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
        <div style={{ ...cellStyle, maxWidth: '200px' }} title={text}>
          {text}
        </div>
      ),
    },
    {
      title: '显示器编号',
      dataIndex: 'monitors',
      key: 'monitors',
      align: 'center' as const,
      width: 180,
      ellipsis: true,
      render: (monitors: string[]) => {
        const text = monitors?.join('\n') || '';
        return (
          <div 
            style={{ 
              ...cellStyle, 
              maxWidth: '200px',
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
      render: (text: string) => (
        <div style={{ ...cellStyle, maxWidth: '100px' }} title={text}>
          {text}
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
      render: (text: string) => (
        <div style={{ ...cellStyle, maxWidth: '100px' }} title={text}>
          {text}
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
      render: (text: string) => (
        <div style={{ ...cellStyle, maxWidth: '120px' }} title={text}>
          {text}
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
      render: (text: string) => (
        <div style={{ ...cellStyle, maxWidth: '120px' }} title={text}>
          {text}
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
      render: (text: string) => (
        <div style={{ ...cellStyle, maxWidth: '120px' }} title={text}>
          {text}
        </div>
      ),
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddresses',
      key: 'ipAddresses',
      align: 'center' as const,
      width: 150,
      ellipsis: true,
      render: (ipAddresses: string[]) => {
        const text = ipAddresses?.join('\n') || '';
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
      render: (text: string) => (
        <div style={{ ...cellStyle, maxWidth: '100px' }} title={text}>
          {text}
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
      render: (text: string) => (
        <div style={{ ...cellStyle, maxWidth: '100px' }} title={text}>
          {text}
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
        const color = status === '已确认' ? 'green' : 'red';
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
      width: 220,
      fixed: 'right' as const,
      render: (_: string | undefined, record: DeviceListItem) => (
        <div style={{ ...cellStyle, padding: '0 4px' }}>
          <Space size={[4, 0]} wrap>
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDevice(record)}
              style={{ padding: '0 4px' }}
            >
              查看
            </Button>
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

  // 查看设备详情
  const handleViewDevice = (device: DeviceListItem) => {
    setSelectedDevice(device);
    setIsModalVisible(true);
  };

  // 编辑设备
  const handleEditDevice = (device: DeviceListItem) => {
    message.info(`编辑设备: ${device.deviceId}`);
    // 跳转到编辑页面
  };

  // 删除设备
  const handleDeleteDevice = async (deviceId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除设备 ${deviceId} 吗？`,
      onOk: async () => {
        try {
          // 在实际项目中，这里会调用真正的 API
          // await deleteDevice(deviceId);
          
          // 重新获取列表
          await fetchDevices(searchParams);
          message.success(`设备 ${deviceId} 删除成功`);
        } catch (error) {
          message.error('删除设备失败');
        }
      },
    });
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchParams({
      ...searchParams,
      computerName: value,
      page: 1,
    });
  };

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
        
        {/* 1. 顶部搜索区 */}
        <div style={{ marginBottom: 16, flexShrink: 0 }}>
          <Row gutter={16} align="middle" justify="space-between">
            <Col>
              <Space>
                <Search
                  placeholder="搜索设备用户的工号"
                  allowClear
                  enterButton={<SearchOutlined />}
                  onSearch={handleSearch}
                  style={{ width: 260 }}
                />
                <Select 
                  placeholder="项目筛选" 
                  style={{ width: 120 }}
                  onChange={(value) => setSearchParams({...searchParams, project: value})}
                >
                  <Option value="all">全部项目</Option>
                  <Option value="项目A">项目A</Option>
                  <Option value="项目B">项目B</Option>
                </Select>
                <Select 
                  placeholder="开发室筛选" 
                  style={{ width: 120 }}
                  onChange={(value) => setSearchParams({...searchParams, devRoom: value})}
                >
                  <Option value="all">全部开发室</Option>
                  <Option value="开发室A">开发室A</Option>
                  <Option value="开发室B">开发室B</Option>
                </Select>
              </Space>
            </Col>
            <Col>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => message.info('添加设备')}
              >
                添加设备
              </Button>
            </Col>
          </Row>
        </div>

        {/* 2. 表格区域 */}
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
              x: 2100, 
              y: 'calc(100vh - 280px)', 
            }}
            pagination={false}
            size="middle"
            bordered={false}
            style={{ margin: 0, padding: 0 }}
          />
        </div>

        {/* 3. 分页区域 */}
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

        {/* 4. 弹窗 */}
        <Modal
          title="设备详情"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedDevice && (
            <div>
              <Row gutter={24}>
                <Col span={12}>
                  <p><strong>设备ID：</strong>{selectedDevice.deviceId}</p>
                  <p><strong>计算机名：</strong>{selectedDevice.computerName}</p>
                  <p><strong>设备型号：</strong>{selectedDevice.deviceModel}</p>
                  <p><strong>登录用户：</strong>{selectedDevice.loginUsername}</p>
                  <p><strong>使用人：</strong>{selectedDevice.userName}</p>
                  <p><strong>所属项目：</strong>{selectedDevice.project}</p>
                </Col>
                <Col span={12}>
                  <p><strong>开发室：</strong>{selectedDevice.devRoom}</p>
                  <p><strong>操作系统：</strong>{selectedDevice.osName}</p>
                  <p><strong>内存：</strong>{selectedDevice.memorySize}</p>
                  <p><strong>SSD：</strong>{selectedDevice.ssdSize}</p>
                  <p><strong>HDD：</strong>{selectedDevice.hddSize}</p>
                  <p><strong>本人确认：</strong>{selectedDevice.confirmStatus}</p>
                </Col>
              </Row>
              <Row style={{ marginTop: 16 }}>
                <Col span={24}>
                  <p><strong>IP地址：</strong></p>
                  <p style={{ whiteSpace: 'pre-line' }}>{selectedDevice.ipAddresses?.join('\n')}</p>
                  <p><strong>显示器：</strong></p>
                  <p style={{ whiteSpace: 'pre-line' }}>{selectedDevice.monitors?.join('\n')}</p>
                  <p><strong>备注：</strong>{selectedDevice.remark}</p>
                </Col>
              </Row>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default DeviceManagement;