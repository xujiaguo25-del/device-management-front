// pages/DeviceManagement.tsx
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Input, 
  Select, 
  Row, 
  Col, 
  Modal, 
  message, 
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

// 导入类型和API函数
import type { 
  DeviceListItem, 
  DeviceQueryParams,
  DeviceIp,
  Monitor
} from '../types/device';
import { 
  getDeviceList, 
  deleteDevice,
  getFilterOptions,
  getDeviceDetail
} from '../services/device/deviceService';
import { 
  fetchDictData, 
  fetchUsers, 
  saveDevice as saveDeviceService,
  updateDevice as updateDeviceService
} from '../services/device/deviceFormService';

const { Search } = Input;
const { Option } = Select;

const DeviceManagement: React.FC = () => {
  // 状态管理
  const [devices, setDevices] = useState<DeviceListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<DeviceQueryParams>({
    page: 1,
    pageSize: 10,
  });
  const [searchValue, setSearchValue] = useState('');
  const [projectValue, setProjectValue] = useState<string>('all');
  const [devRoomValue, setDevRoomValue] = useState<string>('all');
  const [confirmStatusValue, setConfirmStatusValue] = useState<string>('all');
  
  const [filterOptions, setFilterOptions] = useState<{
    projects: string[];
    devRooms: string[];
    confirmStatuses: string[];
  }>({
    projects: [],
    devRooms: [],
    confirmStatuses: []
  });
  
  const [total, setTotal] = useState(0);
  
  // 弹窗相关状态
  const [formVisible, setFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceListItem | null>(null);
  
  // 字典和用户数据
  const [dictData, setDictData] = useState<Record<string, any[]>>({});
  const [users, setUsers] = useState<Array<{userId: string, name: string}>>([]);

  // 获取设备列表
  const fetchDevices = async (params: DeviceQueryParams) => {
    setLoading(true);
    try {
      console.log('开始获取设备列表，参数:', params);
      const response = await getDeviceList(params);
      console.log('获取到的设备列表响应:', response);
      
      // 处理返回的数据
      if (response.code === 200 && response.data) {
        // 确保我们能正确获取list和total
        let deviceList: DeviceListItem[] = [];
        let totalCount = 0;
        
        if ('list' in response.data) {
          // 数据是分页格式 { list: [], total: number, ... }
          deviceList = response.data.list || [];
          totalCount = response.data.total || 0;
          console.log(`获取到设备列表: ${deviceList.length} 条，总计: ${totalCount}`);
        } else if (Array.isArray(response.data)) {
          // 数据是数组格式
          deviceList = response.data;
          totalCount = response.data.length;
        } else {
          console.warn('未知的数据格式:', response.data);
        }
        
        setDevices(deviceList);
        setTotal(totalCount);
      } else {
        console.error('获取设备列表失败:', response.message);
        message.error(`获取设备列表失败: ${response.message}`);
        setDevices([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('获取设备列表失败:', error);
      message.error('获取设备列表失败');
      setDevices([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 获取筛选选项
  const fetchFilterOptions = async () => {
    try {
      const options = await getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('获取筛选选项失败:', error);
    }
  };

  // 获取表单所需数据（字典和用户）
  const fetchFormData = async () => {
    try {
      const [dictDataResult, usersResult] = await Promise.all([
        fetchDictData(),
        fetchUsers()
      ]);
      setDictData(dictDataResult);
      setUsers(usersResult);
    } catch (error) {
      console.error('获取表单数据失败:', error);
      message.error('获取表单数据失败');
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchDevices(searchParams);
    fetchFilterOptions();
    fetchFormData();
  }, [searchParams]);

  // 分页处理函数
  const handlePageChange = (page: number, pageSize?: number) => {
    setSearchParams({
      ...searchParams,
      page,
      pageSize: pageSize || searchParams.pageSize,
    });
  };

  const handlePageSizeChange = (size: number) => {
    setSearchParams({
      ...searchParams,
      page: 1,
      pageSize: size,
    });
  };

  // 编辑设备
  const handleEditDevice = async (device: DeviceListItem) => {
    try {
      const deviceDetail = await getDeviceDetail(device.deviceId);
      if (deviceDetail) {
        setSelectedDevice(deviceDetail);
        setIsEditing(true);
        setFormVisible(true);
      } else {
        message.error('获取设备信息失败');
      }
    } catch (error) {
      message.error('获取设备信息失败');
      console.error('获取设备信息失败:', error);
    }
  };

  // 删除设备
  const handleDeleteDevice = async (deviceId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除设备 ${deviceId} 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const success = await deleteDevice(deviceId);
          if (success) {
            await fetchDevices(searchParams);
            message.success(`设备 ${deviceId} 删除成功`);
          } else {
            message.error('删除设备失败，设备不存在');
          }
        } catch (error) {
          message.error('删除设备失败');
          console.error('删除设备失败:', error);
        }
      },
    });
  };

  // 添加设备
  const handleAddDevice = () => {
    setSelectedDevice(null);
    setIsEditing(false);
    setFormVisible(true);
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchValue(value);
    setSearchParams({
      ...searchParams,
      computerName: value,
      page: 1,
    });
  };

  // 处理筛选变化
  const handleProjectChange = (value: string) => {
    setProjectValue(value);
    setSearchParams({
      ...searchParams,
      project: value === 'all' ? undefined : value,
      page: 1,
    });
  };

  const handleDevRoomChange = (value: string) => {
    setDevRoomValue(value);
    setSearchParams({
      ...searchParams,
      devRoom: value === 'all' ? undefined : value,
      page: 1,
    });
  };

  const handleConfirmStatusChange = (value: string) => {
    setConfirmStatusValue(value);
    setSearchParams({
      ...searchParams,
      confirmStatus: value === 'all' ? undefined : value,
      page: 1,
    });
  };

  // 重置筛选条件
  const handleReset = () => {
    setSearchValue('');
    setProjectValue('all');
    setDevRoomValue('all');
    setConfirmStatusValue('all');
    
    setSearchParams({
      page: 1,
      pageSize: searchParams.pageSize,
    });
  };

  // 处理表单提交
  const handleFormSubmit = async (values: DeviceListItem) => {
    try {
      // const success = await saveDeviceService(values);

      /////修改
      let success;
      if (isEditing) {
        // 编辑模式下调用 updateDevice
        success = await updateDeviceService(values);  
      } else {
        // 新增模式下调用 saveDevice
        success = await saveDeviceService(values);
      }
      /////修改

      
      if (success) {
        if (isEditing) {
          message.success(`设备 ${values.deviceId} 编辑成功`);
        } else {
          message.success(`设备 ${values.deviceId} 添加成功`);
        }
        
        // 重新加载设备列表
        await fetchDevices(searchParams);
        setFormVisible(false);
        setIsEditing(false);
        setSelectedDevice(null);
      } else {
        message.error('操作失败');
      }
    } catch (error) {
      message.error('操作失败');
      console.error('操作失败:', error);
    }
  };

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
      render: (monitors: Monitor[]) => {
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
      dataIndex: 'deviceIps',
      key: 'deviceIps',
      align: 'center' as const,
      width: 150,
      ellipsis: true,
      render: (deviceIps: DeviceIp[]) => {
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
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
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
                  placeholder="搜索用户姓名、工号或主机编号"
                  allowClear
                  enterButton={<SearchOutlined />}
                  onSearch={handleSearch}
                  onChange={(e) => setSearchValue(e.target.value)}
                  value={searchValue}
                  style={{ width: 285 }}
                />
                <Select 
                  placeholder="项目筛选" 
                  style={{ width: 120 }}
                  value={projectValue}
                  onChange={handleProjectChange}
                >
                  <Option value="all">全部项目</Option>
                  {filterOptions.projects.map(project => (
                    <Option key={project} value={project}>{project}</Option>
                  ))}
                </Select>
                <Select 
                  placeholder="开发室筛选" 
                  style={{ width: 120 }}
                  value={devRoomValue}
                  onChange={handleDevRoomChange}
                >
                  <Option value="all">全部开发室</Option>
                  {filterOptions.devRooms.map(room => (
                    <Option key={room} value={room}>{room}</Option>
                  ))}
                </Select>
                <Select 
                  placeholder="确认状态" 
                  style={{ width: 120 }}
                  value={confirmStatusValue}
                  onChange={handleConfirmStatusChange}
                >
                  <Option value="all">全部状态</Option>
                  {filterOptions.confirmStatuses.map(status => (
                    <Option key={status} value={status}>{status}</Option>
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
              y: 'calc(100vh - 280px)', 
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
