// components/DeviceFormModal.tsx
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  InputNumber,
  Button,
  Space,
  message,
  Card,
  Tag,
  Typography,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { DeviceFullDTO, MonitorDTO, DeviceIpDTO } from '../../types/device';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface DeviceFormModalProps {
  visible: boolean;
  isEditing: boolean;
  device: DeviceFullDTO | null;
  dictData: Record<string, any[]>;
  users: any[];
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
          creater: device.creater,
          updater: device.updater,
          name: device.name,
          deptId: device.deptId,
        });
        
        setMonitors(device.monitors || []);
        setIpAddresses(device.ipAddresses || []);
      } else {
        // 新增模式：设置默认值
        form.resetFields();
        setMonitors([{ monitorName: '', deviceId: '' }]);
        setIpAddresses([{ ipAddress: '', deviceId: '' }]);
        
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
    setMonitors([...monitors, { monitorName: '', deviceId: '' }]);
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
    setIpAddresses([...ipAddresses, { ipAddress: '', deviceId: '' }]);
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

          <Form.Item name="creater" label="创建人" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
          <Form.Item name="updater" label="更新人" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default DeviceFormModal;