// pages/DeviceManagement.tsx
import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Input, Select, Row, Col, Modal, message, Pagination } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import Layout from '../components/common/Layout';
import type { DeviceListItem, DeviceQueryParams } from '../types/device-list';

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
      // 这里应该调用API接口
      // const response = await deviceApi.getDeviceList(params);
      // setDevices(response.data.list);
      // setTotal(response.data.total);
      
      // 模拟数据 - 修正重复字段和缺少的字段，并将deli改为dell
      const mockData: DeviceListItem[] = [
        {
          key: '1',
          deviceId: 'HYRON-1 PC-DC-01',
          monitors: ['HYRON-1 Minibor-01'],
          userId: 'JS0010',
          deviceModel: 'dell-S000',
          computerName: 'DA04-PC-1',
          loginUsername: 'xming',
          ipAddresses: ['192.168.0.1'],
          osName: 'Windows11',
          memorySize: '16',
          ssdSize: '512',
          hddSize: '—',
          project: '项目A',
          devRoom: '开发室A',
          confirmStatus: '已确认',
          remark: '',
          userName: '小娟',
          tags: [],
        },
        {
          key: '2',
          deviceId: 'HYRON-1 PC-DC-02',
          monitors: ['HYRON-1 Minibor-02'],
          userId: 'JS0011',
          deviceModel: 'dell-S010',
          computerName: 'DA04-PC-2',
          loginUsername: 'zhban',
          ipAddresses: ['192.168.0.2', '192.168.0.11'],
          osName: 'Windows11',
          memorySize: '16',
          ssdSize: '512',
          hddSize: '—',
          project: '项目C',
          devRoom: '开发室C',
          confirmStatus: '已确认',
          remark: '',
          userName: '张三',
          tags: [],
        },
        {
          key: '3',
          deviceId: 'HYRON-1 PC-DC-03',
          monitors: ['HYRON-1 Minibor-03'],
          userId: 'JS0012',
          deviceModel: 'dell-S020',
          computerName: 'DA04-PC-3',
          loginUsername: 'lisi',
          ipAddresses: ['192.168.0.3'],
          osName: 'Windows11',
          memorySize: '32',
          ssdSize: '512',
          hddSize: '512',
          project: '项目A',
          devRoom: '开发室A',
          confirmStatus: '已确认',
          remark: '',
          userName: '李四',
          tags: [],
        },
        {
          key: '4',
          deviceId: 'HYRON-1 PC-DC-04',
          monitors: ['HYRON-1 Minibor-04', 'HYRON-1 Minibor-11'],
          userId: 'JS0013',
          deviceModel: 'dell-S030',
          computerName: 'DA04-PC-4',
          loginUsername: 'vangpuu',
          ipAddresses: ['192.168.0.4'],
          osName: 'Windows10',
          memorySize: '16',
          ssdSize: '512',
          hddSize: '—',
          project: '项目B',
          devRoom: '开发室B',
          confirmStatus: '未确认',
          remark: '',
          userName: '王五',
          tags: [],
        },
        {
          key: '5',
          deviceId: 'HYRON-1 PC-DC-05',
          monitors: ['HYRON-1 Minibor-05'],
          userId: 'JS0014',
          deviceModel: 'dell-S040',
          computerName: 'DA04-PC-5',
          loginUsername: 'nuke',
          ipAddresses: ['192.168.0.5'],
          osName: 'Windows11',
          memorySize: '16',
          ssdSize: '512',
          hddSize: '—',
          project: '项目D',
          devRoom: '开发室D',
          confirmStatus: '已确认',
          remark: '',
          userName: '李松',
          tags: [],
        },
        {
          key: '6',
          deviceId: 'HYRON-1 PC-DC-06',
          monitors: ['HYRON-1 Minibor-06'],
          userId: 'JS0015',
          deviceModel: 'Mac mini',
          computerName: 'DA04-PC-6',
          loginUsername: 'auxc',
          ipAddresses: ['192.168.0.6', '192.168.0.12', '192.168.0.13'],
          osName: 'Mac OS',
          memorySize: '16',
          ssdSize: '512',
          hddSize: '—',
          project: '项目C',
          devRoom: '开发室C',
          confirmStatus: '未确认',
          remark: '',
          userName: '李雪',
          tags: [],
        },
        {
          key: '7',
          deviceId: 'HYRON-1 PC-DC-07',
          monitors: ['HYRON-1 Minibor-07'],
          userId: 'JS0016',
          deviceModel: 'dell-S050',
          computerName: 'DA04-PC-7',
          loginUsername: 'jahr',
          ipAddresses: ['192.168.0.7'],
          osName: 'Windows11',
          memorySize: '16',
          ssdSize: '512',
          hddSize: '1024',
          project: '项目A',
          devRoom: '开发室A',
          confirmStatus: '已确认',
          remark: '',
          userName: '韩海峰',
          tags: [],
        },
        {
          key: '8',
          deviceId: 'HYRON-1 PC-DC-08',
          monitors: ['HYRON-1 Minibor-08'],
          userId: 'JS0017',
          deviceModel: 'dell-S060',
          computerName: 'DA04-PC-8',
          loginUsername: 'heyh',
          ipAddresses: ['192.168.0.8'],
          osName: 'Windows10',
          memorySize: '32',
          ssdSize: '1024',
          hddSize: '—',
          project: '项目B',
          devRoom: '开发室B',
          confirmStatus: '已确认',
          remark: '',
          userName: '小红',
          tags: [],
        },
        {
          key: '9',
          deviceId: 'HYRON-1 PC-DC-09',
          monitors: ['HYRON-1 Minibor-09'],
          userId: 'JS0018',
          deviceModel: 'dell-S070',
          computerName: 'DA04-PC-9',
          loginUsername: 'li',
          ipAddresses: ['192.168.0.9'],
          osName: 'Windows11',
          memorySize: '16',
          ssdSize: '512',
          hddSize: '—',
          project: '项目D',
          devRoom: '开发室D',
          confirmStatus: '已确认',
          remark: '',
          userName: '小芳',
          tags: [],
        },
        {
          key: '10',
          deviceId: 'HYRON-1 PC-DC-10',
          monitors: ['HYRON-1 Minibor-10'],
          userId: 'JS0019',
          deviceModel: 'dell-S080',
          computerName: 'DA04-PC-10',
          loginUsername: 'zhub',
          ipAddresses: ['192.168.0.10'],
          osName: 'Windows11',
          memorySize: '16',
          ssdSize: '512',
          hddSize: '—',
          project: '项目A',
          devRoom: '开发室A',
          confirmStatus: '已确认',
          remark: '',
          userName: '小李',
          tags: [],
        },
      ];
      
      // 模拟分页效果 - 添加默认值
      const page = params.page ?? 1; // 使用空值合并运算符
      const pageSize = params.pageSize ?? 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = mockData.slice(startIndex, endIndex);
      
      setDevices(paginatedData);
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

  // 处理分页变化
  const handlePageChange = (page: number, pageSize?: number) => {
    setSearchParams({
      ...searchParams,
      page,
      pageSize: pageSize || searchParams.pageSize,
    });
  };

  // 处理页面大小变化
  const handlePageSizeChange = (current: number, size: number) => {
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
        <div style={{ ...cellStyle, maxWidth: '150px' }} title={text}>
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
      fixed: 'right' as const, // 和操作列一起固定在右侧
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
      width: 220, // 增加宽度
      fixed: 'right' as const,
      render: (text: string | undefined, record: DeviceListItem) => (
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
      <div style={{ 
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)', // 减去Layout的header高度
        overflow: 'hidden' // 防止外部滚动条
      }}>
        <Card style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden' // 防止Card内部滚动条
        }}>
          {/* 搜索栏 */}
          <div style={{ marginBottom: 16, flexShrink: 0 }}>
            <Row gutter={16} align="middle" justify="space-between">
              {/* 左侧：搜索和筛选组件 */}
              <Col>
                <Row gutter={16} align="middle">
                  <Col>
                    <Search
                      placeholder="搜索设备用户的工号"
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
                    <Select 
                      placeholder="开发室筛选" 
                      style={{ width: 120 }}
                      onChange={(value) => setSearchParams({...searchParams, devRoom: value})}
                    >
                      <Option value="all">全部开发室</Option>
                      <Option value="开发室A">开发室A</Option>
                      <Option value="开发室B">开发室B</Option>
                    </Select>
                  </Col>
                </Row>
              </Col>
              
              {/* 右侧：按钮 */}
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

          {/* 设备表格 - 使用flex布局占满剩余空间 */}
          <div style={{ 
            flex: 1,
            overflow: 'hidden', // 隐藏容器滚动条
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* 表格容器，只允许内部滚动 */}
            <div style={{ 
              flex: 1,
              overflow: 'auto', // 只在Table内部滚动
              marginBottom: 16
            }}>
              <Table<DeviceListItem>
                rowKey="key"
                columns={columns}
                dataSource={devices}
                loading={loading}
                scroll={{
                  x: 2100,
                  y: 620, // 动态计算高度
                }}
                pagination={false}
                style={{ minWidth: '100%' }}
              />
            </div>

            {/* 分页组件 - 固定高度 */}
            <div style={{ flexShrink: 0 }}>
              <Pagination
                current={searchParams.page}
                pageSize={searchParams.pageSize}
                total={total}
                onChange={handlePageChange}
                onShowSizeChange={handlePageSizeChange}
                showQuickJumper
                showSizeChanger
                showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
                pageSizeOptions={['10', '20', '50', '100']}
                style={{ textAlign: 'left' }}
              />
            </div>
          </div>
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