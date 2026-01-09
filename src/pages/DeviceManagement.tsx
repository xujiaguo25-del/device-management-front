// pages/DeviceManagement.tsx
import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Input, Select, Row, Col, Modal, message } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import Layout from '../components/common/Layout';
import type { DeviceListItem, DeviceQueryParams } from '../types/device-list';
import { DictTypeCode } from '../types/device';

const { Search } = Input;
const { Option } = Select;

const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState<DeviceListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
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
      // 这里应该调用API接口
      // const response = await deviceApi.getDeviceList(params);
      // setDevices(response.data.list);
      // setTotal(response.data.total);
      
      // 模拟数据
      const mockData: DeviceListItem[] = [
        {
          key: '1',
          deviceId: 'DEV001',
          deviceModel: 'ThinkPad X1 Carbon',
          computerName: 'DEV-PC-001',
          loginUsername: 'zhangsan',
          project: '项目A',
          devRoom: '开发室101',
          userId: 'EMP001',
          userName: '张三',
          remark: '开发用机',
          selfConfirmStatus: '已确认',
          osName: 'Windows 11 Pro',
          memorySize: '16GB',
          ssdSize: '512GB',
          hddSize: '无',
          domainStatus: '已加域',
          smartitStatus: '已安装',
          usbStatus: '已禁用',
          antivirusStatus: '已安装',
          ipAddresses: ['192.168.1.100'],
          monitors: ['Dell U2419H'],
          createTime: '2024-01-15 10:30:25',
          creater: 'admin',
          updateTime: '2024-01-15 10:30:25',
          updater: 'admin',
          tags: ['在线', '正常'],
        },
        {
          key: '2',
          deviceId: 'DEV002',
          deviceModel: 'MacBook Pro',
          computerName: 'DEV-MAC-001',
          loginUsername: 'lisi',
          project: '项目B',
          devRoom: '开发室102',
          userId: 'EMP002',
          userName: '李四',
          remark: '设计用机',
          selfConfirmStatus: '未确认',
          osName: 'macOS Ventura',
          memorySize: '32GB',
          ssdSize: '1TB',
          hddSize: '无',
          domainStatus: '未加域',
          smartitStatus: '未安装',
          usbStatus: '已启用',
          antivirusStatus: '已安装',
          ipAddresses: ['192.168.1.101'],
          monitors: ['Apple Pro Display XDR'],
          createTime: '2024-01-14 15:20:45',
          creater: 'admin',
          updateTime: '2024-01-14 15:20:45',
          updater: 'admin',
          tags: ['在线', '告警'],
        },
      ];
      
      setDevices(mockData);
      setTotal(mockData.length);
    } catch (error) {
      message.error('获取设备列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices(searchParams);
  }, [searchParams]);

  // 表格列定义
  const columns = [
    {
      title: '设备ID',
      dataIndex: 'deviceId',
      key: 'deviceId',
    },
    {
      title: '计算机名',
      dataIndex: 'computerName',
      key: 'computerName',
    },
    {
      title: '设备型号',
      dataIndex: 'deviceModel',
      key: 'deviceModel',
    },
    {
      title: '登录用户',
      dataIndex: 'loginUsername',
      key: 'loginUsername',
    },
    {
      title: '使用人',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: '所属项目',
      dataIndex: 'project',
      key: 'project',
    },
    {
      title: '操作系统',
      dataIndex: 'osName',
      key: 'osName',
    },
    {
      title: '内存',
      dataIndex: 'memorySize',
      key: 'memorySize',
    },
    {
      title: 'SSD',
      dataIndex: 'ssdSize',
      key: 'ssdSize',
    },
    {
      title: '状态',
      key: 'tags',
      dataIndex: 'tags',
      render: (tags: string[]) => (
        <>
          {tags.map((tag) => {
            let color = tag === '在线' ? 'green' : tag === '正常' ? 'blue' : 'red';
            return (
              <Tag color={color} key={tag}>
                {tag}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string | undefined, record: DeviceListItem) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDevice(record)}
          >
            查看
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEditDevice(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteDevice(record.deviceId)}
          >
            删除
          </Button>
        </Space>
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
  const handleDeleteDevice = (deviceId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除设备 ${deviceId} 吗？`,
      onOk: () => {
        message.success(`设备 ${deviceId} 删除成功`);
        // 调用API删除
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
      <div style={{ padding: 24 }}>
        <Card>
          {/* 搜索栏 */}
          <div style={{ marginBottom: 16 }}>
            <Row gutter={16} align="middle">
              <Col>
                <Search
                  placeholder="搜索计算机名或设备ID"
                  allowClear
                  enterButton={<SearchOutlined />}
                  onSearch={handleSearch}
                  style={{ width: 300 }}
                />
              </Col>
              <Col>
                <Select 
                  placeholder="项目筛选" 
                  style={{ width: 120 }}
                  onChange={(value) => setSearchParams({...searchParams, project: value})}
                >
                  <Option value="all">全部项目</Option>
                  <Option value="项目A">项目A</Option>
                  <Option value="项目B">项目B</Option>
                </Select>
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

          {/* 设备表格 */}
          <Table<DeviceListItem>
            rowKey="key"
            columns={columns}
            dataSource={devices}
            loading={loading}
            pagination={{
              current: searchParams.page,
              pageSize: searchParams.pageSize,
              total,
              onChange: (page, pageSize) => {
                setSearchParams({
                  ...searchParams,
                  page,
                  pageSize,
                });
              },
            }}
          />
        </Card>

        {/* 设备详情弹窗 */}
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
                  <p><strong>本人确认：</strong>{selectedDevice.selfConfirmStatus}</p>
                </Col>
              </Row>
              <Row style={{ marginTop: 16 }}>
                <Col span={24}>
                  <p><strong>IP地址：</strong>{selectedDevice.ipAddresses?.join(', ')}</p>
                  <p><strong>显示器：</strong>{selectedDevice.monitors?.join(', ')}</p>
                  <p><strong>备注：</strong>{selectedDevice.remark}</p>
                  <p><strong>创建时间：</strong>{selectedDevice.createTime}</p>
                  <p><strong>更新时间：</strong>{selectedDevice.updateTime}</p>
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