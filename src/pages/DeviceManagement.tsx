// pages/DeviceManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
  Pagination,
  Descriptions,
  Badge,
  Divider,
  List,
  Card,
  Typography,
  Form,
  InputNumber
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  RedoOutlined,
  DesktopOutlined,
  MonitorOutlined,
  CloudOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MinusOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Layout from '../components/common/Layout';

// 导入类型和API函数
import type {
  DeviceListItem,
  DeviceQueryParams,
  DeviceFullDTO,
  DictItem,
  MonitorDTO,
  DeviceIpDTO
} from '../types/device';
import {
  getDeviceList,
  deleteDevice,
  getFilterOptions,
  getDeviceDetail,
  saveDevice,
  getDictData,
  getUserList
} from '../services/device/deviceService';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

// 设备详情弹窗组件
interface DeviceDetailModalProps {
  visible: boolean;
  device: DeviceFullDTO | null;
  dictData: Record<string, DictItem[]>;
  onCancel: () => void;
}

const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({
  visible,
  device,
  dictData,
  onCancel,
}) => {
  if (!device) return null;

  // 获取字典项名称
  const getDictName = (dictType: string, dictId: number) => {
    const dictItems = dictData[dictType] || [];
    const item = dictItems.find(item => item.dictId === dictId);
    return item?.dictItemName || dictId.toString();
  };

  const selfConfirmStatus = device.selfConfirmId !== undefined 
    ? getDictName('CONFIRM_STATUS', device.selfConfirmId)
    : '未知';
  const osName = device.osId !== undefined 
    ? getDictName('OS_TYPE', device.osId)
    : '未知';
  const memoryName = device.memoryId !== undefined 
    ? getDictName('MEMORY_SIZE', device.memoryId)
    : '未知';
  const ssdName = device.ssdId ? getDictName('SSD_SIZE', device.ssdId) : '无';
  const hddName = device.hddId ? getDictName('HDD_SIZE', device.hddId) : '无';

  return (
    <Modal
      title={
        <Space>
          <DesktopOutlined />
          设备详情 - {device.deviceId}
        </Space>
      }
      open={visible}
      width={800}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>,
      ]}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '8px 0' }}>
        {/* 基本信息卡片 */}
        <Card title="基本信息" style={{ marginBottom: 16 }}>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="设备编号" span={2}>
              <Badge dot={!device.deviceId.includes('DEV')} color="red">
                <Text strong>{device.deviceId}</Text>
              </Badge>
            </Descriptions.Item>
            <Descriptions.Item label="设备型号">
              {device.deviceModel || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="电脑名称">
              {device.computerName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="使用人">
              <Space>
                <UserOutlined />
                <div>
                  <div>{device.name || '-'}</div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {device.userId || '-'}
                  </Text>
                </div>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="登录用户名">
              {device.loginUsername || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="项目">
              {device.project || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="开发室">
              {device.devRoom || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="本人确认">
              <Tag 
                icon={device.selfConfirmId === 1 ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                color={device.selfConfirmId === 1 ? 'green' : 'orange'}
              >
                {selfConfirmStatus}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 硬件配置卡片 */}
        <Card title="硬件配置" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card size="small" title="操作系统">
                <Text strong>{osName}</Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="内存">
                <Text strong>{memoryName}</Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="固态硬盘">
                <Text strong>{ssdName}</Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="机械硬盘">
                <Text strong>{hddName}</Text>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* IP地址卡片 */}
        <Card 
          title={
            <Space>
              <CloudOutlined />
              IP地址 ({(device.ipAddresses as DeviceIpDTO[])?.length || 0}个)
            </Space>
          } 
          style={{ marginBottom: 16 }}
        >
          {(device.ipAddresses as DeviceIpDTO[])?.length > 0 ? (
            <List
              dataSource={device.ipAddresses as DeviceIpDTO[]}
              renderItem={(ip, index) => (
                <List.Item>
                  <Space>
                    <Tag color="blue">IP{index + 1}</Tag>
                    <Text code>{ip.ipAddress}</Text>
                  </Space>
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#999' }}>
              暂无IP地址配置
            </div>
          )}
        </Card>

        {/* 显示器卡片 */}
        <Card 
          title={
            <Space>
              <MonitorOutlined />
              显示器 ({device.monitors?.length || 0}台)
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          {device.monitors?.length > 0 ? (
            <List
              dataSource={device.monitors}
              renderItem={(monitor, index) => (
                <List.Item>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Tag color="green">显示器{index + 1}</Tag>
                      <Text strong>{monitor.monitorName}</Text>
                    </div>
                  </Space>
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#999' }}>
              暂无显示器配置
            </div>
          )}
        </Card>

        {/* 备注卡片 */}
        {device.remark && (
          <Card title="备注" style={{ marginBottom: 16 }}>
            <div style={{ whiteSpace: 'pre-wrap', padding: 8, background: '#f9f9f9', borderRadius: 4 }}>
              {device.remark}
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
};

// 设备表单弹窗组件
interface DeviceFormModalProps {
  visible: boolean;
  isEditing: boolean;
  device: DeviceFullDTO | null;
  dictData: Record<string, DictItem[]>;
  users: Array<{userId: string, name: string}>;
  onCancel: () => void;
  onSubmit: (values: DeviceFullDTO) => void;
}

const DeviceFormModal: React.FC<DeviceFormModalProps> = ({
  visible,
  isEditing,
  device,
  dictData,
  users,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [monitors, setMonitors] = useState<MonitorDTO[]>([]);
  const [ipAddresses, setIpAddresses] = useState<DeviceIpDTO[]>([]);

  useEffect(() => {
    if (visible) {
      if (device) {
        // 设置表单值
        form.setFieldsValue({
          deviceId: device.deviceId,
          deviceModel: device.deviceModel,
          computerName: device.computerName,
          loginUsername: device.loginUsername,
          project: device.project,
          devRoom: device.devRoom,
          userId: device.userId,
          remark: device.remark,
          selfConfirmId: device.selfConfirmId,
          osId: device.osId,
          memoryId: device.memoryId,
          ssdId: device.ssdId,
          hddId: device.hddId,
          name: device.name,
        });
        
        setMonitors(device.monitors || []);
        setIpAddresses(Array.isArray(device.ipAddresses) ? device.ipAddresses : []);
      } else {
        // 新增模式：设置默认值
        form.resetFields();
        setMonitors([{ monitorName: '' }]);
        setIpAddresses([{ ipAddress: '' }]);
        
        // 设置默认值
        form.setFieldsValue({
          selfConfirmId: 0,
          osId: 1,
          memoryId: 2,
          ssdId: 1,
          hddId: 0,
        });
      }
    }
  }, [visible, device, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 验证IP地址
      const invalidIps = ipAddresses.filter(ip => ip.ipAddress && !isValidIP(ip.ipAddress));
      if (invalidIps.length > 0) {
        message.error('请检查IP地址格式');
        return;
      }

      // 验证显示器名称
      const emptyMonitors = monitors.filter(m => !m.monitorName.trim());
      if (emptyMonitors.length > 0) {
        message.error('请填写所有显示器名称');
        return;
      }

      const submitData: DeviceFullDTO = {
        ...values,
        monitors: monitors.filter(m => m.monitorName.trim()),
        ipAddresses: ipAddresses.filter(ip => ip.ipAddress.trim()),
      };

      onSubmit(submitData);
      form.resetFields();
      setMonitors([{ monitorName: '' }]);
      setIpAddresses([{ ipAddress: '' }]);
    } catch (error) {
      console.log('表单验证失败:', error);
    }
  };

  const isValidIP = (ip: string) => {
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(ip);
  };

  // 处理显示器变更
  const handleMonitorChange = (index: number, field: keyof MonitorDTO, value: any) => {
    const newMonitors = [...monitors];
    newMonitors[index] = { ...newMonitors[index], [field]: value };
    setMonitors(newMonitors);
  };

  const addMonitor = () => {
    setMonitors([...monitors, { monitorName: '' }]);
  };

  const removeMonitor = (index: number) => {
    if (monitors.length > 1) {
      const newMonitors = [...monitors];
      newMonitors.splice(index, 1);
      setMonitors(newMonitors);
    }
  };

  // 处理IP地址变更
  const handleIpChange = (index: number, field: keyof DeviceIpDTO, value: any) => {
    const newIps = [...ipAddresses];
    newIps[index] = { ...newIps[index], [field]: value };
    setIpAddresses(newIps);
  };

  const addIpAddress = () => {
    setIpAddresses([...ipAddresses, { ipAddress: '' }]);
  };

  const removeIpAddress = (index: number) => {
    if (ipAddresses.length > 1) {
      const newIps = [...ipAddresses];
      newIps.splice(index, 1);
      setIpAddresses(newIps);
    }
  };

  return (
    <Modal
      title={isEditing ? '编辑设备' : '新增设备'}
      open={visible}
      width={800}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          提交
        </Button>,
      ]}
    >
      <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0 8px' }}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Title level={5} style={{ marginBottom: 16 }}>基本信息</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="deviceId"
                label="设备编号"
                rules={[{ required: true, message: '请输入设备编号' }]}
              >
                <Input 
                  placeholder="请输入设备编号，如：DEV001" 
                  disabled={isEditing}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deviceModel"
                label="设备型号"
                rules={[{ required: true, message: '请输入设备型号' }]}
              >
                <Input placeholder="请输入设备型号" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="computerName"
                label="电脑名称"
                rules={[{ required: true, message: '请输入电脑名称' }]}
              >
                <Input placeholder="请输入电脑名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="userId"
                label="使用人"
                rules={[{ required: true, message: '请选择使用人' }]}
              >
                <Select placeholder="请选择使用人" showSearch>
                  {users.map(user => (
                    <Option key={user.userId} value={user.userId}>
                      {user.name} ({user.userId})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="project"
                label="项目"
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="devRoom"
                label="开发室"
              >
                <Input placeholder="请输入开发室" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="loginUsername"
                label="登录用户名"
              >
                <Input placeholder="请输入登录用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="selfConfirmId"
                label="本人确认"
                rules={[{ required: true, message: '请选择确认状态' }]}
              >
                <Select placeholder="请选择确认状态">
                  {dictData.CONFIRM_STATUS?.map(item => (
                    <Option key={item.dictId} value={item.dictId}>
                      {item.dictItemName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={5} style={{ marginBottom: 16 }}>硬件配置</Title>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="osId"
                label="操作系统"
                rules={[{ required: true, message: '请选择操作系统' }]}
              >
                <Select placeholder="请选择操作系统">
                  {dictData.OS_TYPE?.map(item => (
                    <Option key={item.dictId} value={item.dictId}>
                      {item.dictItemName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="memoryId"
                label="内存"
                rules={[{ required: true, message: '请选择内存' }]}
              >
                <Select placeholder="请选择内存">
                  {dictData.MEMORY_SIZE?.map(item => (
                    <Option key={item.dictId} value={item.dictId}>
                      {item.dictItemName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="ssdId"
                label="固态硬盘"
              >
                <Select placeholder="请选择固态硬盘">
                  <Option value={0}>无</Option>
                  {dictData.SSD_SIZE?.map(item => (
                    <Option key={item.dictId} value={item.dictId}>
                      {item.dictItemName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="hddId"
                label="机械硬盘"
              >
                <Select placeholder="请选择机械硬盘">
                  <Option value={0}>无</Option>
                  {dictData.HDD_SIZE?.map(item => (
                    <Option key={item.dictId} value={item.dictId}>
                      {item.dictItemName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={5} style={{ marginBottom: 16 }}>
            IP地址配置
            <Button 
              type="link" 
              icon={<PlusOutlined />} 
              onClick={addIpAddress}
              style={{ marginLeft: 8 }}
            >
              添加IP
            </Button>
          </Title>
          
          {ipAddresses.map((ip, index) => (
            <Card key={index} size="small" style={{ marginBottom: 8 }}>
              <Row gutter={16} align="middle">
                <Col span={20}>
                  <Input
                    placeholder="请输入IP地址，如：192.168.1.100"
                    value={ip.ipAddress}
                    onChange={(e) => handleIpChange(index, 'ipAddress', e.target.value)}
                    status={ip.ipAddress && !isValidIP(ip.ipAddress) ? 'error' : undefined}
                  />
                  {ip.ipAddress && !isValidIP(ip.ipAddress) && (
                    <Text type="danger" style={{ fontSize: '12px' }}>
                      请输入有效的IP地址
                    </Text>
                  )}
                </Col>
                <Col span={4}>
                  <Space>
                    {ipAddresses.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeIpAddress(index)}
                      />
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>
          ))}

          <Divider />

          <Title level={5} style={{ marginBottom: 16 }}>
            显示器配置
            <Button 
              type="link" 
              icon={<PlusOutlined />} 
              onClick={addMonitor}
              style={{ marginLeft: 8 }}
            >
              添加显示器
            </Button>
          </Title>
          
          {monitors.map((monitor, index) => (
            <Card key={index} size="small" style={{ marginBottom: 8 }}>
              <Row gutter={16} align="middle">
                <Col span={20}>
                  <Input
                    placeholder="请输入显示器名称，如：DELL U2415"
                    value={monitor.monitorName}
                    onChange={(e) => handleMonitorChange(index, 'monitorName', e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Space>
                    {monitors.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeMonitor(index)}
                      />
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>
          ))}

          <Form.Item name="remark" label="备注" style={{ marginTop: 16 }}>
            <TextArea placeholder="请输入备注信息" rows={3} />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

// 主组件
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
  const [detailVisible, setDetailVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceFullDTO | null>(null);
  
  // 字典和用户数据
  const [dictData, setDictData] = useState<Record<string, DictItem[]>>({});
  const [users, setUsers] = useState<Array<{userId: string, name: string}>>([]);

  // 获取设备列表
  const fetchDevices = useCallback(async (params: DeviceQueryParams) => {
    setLoading(true);
    try {
      const response = await getDeviceList(params);
      setDevices(response.data.list);
      setTotal(response.data.total);
    } catch (error) {
      message.error('获取设备列表失败');
      console.error('获取设备列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取筛选选项
  const fetchFilterOptions = useCallback(async () => {
    try {
      const options = await getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('获取筛选选项失败:', error);
    }
  }, []);

  // 获取字典数据
  const fetchDictData = useCallback(async () => {
    try {
      const data = await getDictData();
      setDictData(data);
    } catch (error) {
      console.error('获取字典数据失败:', error);
    }
  }, []);

  // 获取用户列表
  const fetchUsers = useCallback(async () => {
    try {
      const userList = await getUserList();
      setUsers(userList);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    }
  }, []);

  // 初始化数据
  useEffect(() => {
    fetchDevices(searchParams);
    fetchFilterOptions();
    fetchDictData();
    fetchUsers();
  }, [searchParams, fetchDevices, fetchFilterOptions, fetchDictData, fetchUsers]);

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

  // 查看设备详情
  const handleViewDevice = async (device: DeviceListItem) => {
    try {
      const deviceDetail = await getDeviceDetail(device.deviceId);
      if (deviceDetail) {
        setSelectedDevice(deviceDetail);
        setDetailVisible(true);
      } else {
        message.error('获取设备详情失败');
      }
    } catch (error) {
      message.error('获取设备详情失败');
      console.error('获取设备详情失败:', error);
    }
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
  const handleFormSubmit = async (values: DeviceFullDTO) => {
    try {
      const success = await saveDevice(values);
      
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
                  placeholder="搜索用户姓名、工号或设备编号"
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
              x: 2100, 
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

        {/* 设备详情弹窗 */}
        <DeviceDetailModal
          visible={detailVisible}
          device={selectedDevice}
          dictData={dictData}
          onCancel={() => setDetailVisible(false)}
        />

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