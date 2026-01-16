// components/DeviceFormModal.tsx
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Button,
  Space,
  message,
  Card,
  Typography,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { DeviceListItem, Monitor, DeviceIp } from '../../types/device';
import { isValidIP } from '../../services/device/deviceFormService';
import DictSelect from '../DictSelect'; // 添加这行
import { useDicts } from '../../hooks/useDicts'; // 添加这行

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface DeviceFormModalProps {
  visible: boolean;
  isEditing: boolean;
  device: DeviceListItem | null;
  dictData: Record<string, any[]>; // Record定义对象
  users: any[];
  isAdmin?: boolean; // 添加：是否为管理员
  currentUserId?: string; // 添加：当前登录用户ID
  onCancel: () => void;
  onSubmit: (values: DeviceListItem) => void;
}

                                  // 定义参数类型
const DeviceFormModal: React.FC<DeviceFormModalProps> = ({
                                                           visible,
                                                           isEditing,
                                                           device,
                                                           dictData,
                                                           users,
                                                           isAdmin = false, // ✅ 默认为普通用户
                                                           currentUserId,
                                                           onCancel,
                                                           onSubmit,
                                                         }) => {
  const [form] = Form.useForm();
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [deviceIps, setDeviceIps] = useState<DeviceIp[]>([]);

  // 使用 useDicts 获取字典数据
  const { map: dictMap, loading: dictLoading } = useDicts([
    'CONFIRM_STATUS',
    'OS_TYPE',
    'MEMORY_SIZE',
    'SSD_SIZE',
    'HDD_SIZE'
  ]);

  const currentUser = currentUserId
      ? users.find(u => u.userId === currentUserId)
      : null;

  useEffect(() => {
    if (visible) {
      if (device) {
        // 编辑模式：设置表单值
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
          userName: device.userName,
          deptId: device.deptId,
        });
        
        setMonitors(device.monitors || []);
        setDeviceIps(device.deviceIps || []);
      } else {
        // 新增模式：设置默认值
        form.resetFields();
        setMonitors([{ monitorName: '', deviceId: '' }]);
        setDeviceIps([{ ipAddress: '', deviceId: '' }]);

        // 设置默认值
        // form.setFieldsValue({
        //   selfConfirmId: 0,
        //   osId: 1,
        //   memoryId: 16,
        //   ssdId: 0,
        //   hddId: 0,
        // });
      }
    }
  }, [visible, device, form, isAdmin, currentUser]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 验证IP地址
      const invalidIps = deviceIps.filter(ip => ip.ipAddress && !isValidIP(ip.ipAddress));
      if (invalidIps.length > 0) {
        message.error('请检查IP地址格式');
        return;
      }

      // // 验证显示器名称
      // const emptyMonitors = monitors.filter(m => !m.monitorName.trim());
      // if (emptyMonitors.length > 0) {
      //   message.error('请填写所有显示器名称');
      //   return;
      // }

      // 获取字典显示名称
      // const osName = dictData.OS_TYPE?.find(item => item.dictId === values.osId)?.dictItemName || '';
      // const memorySize = dictData.MEMORY_SIZE?.find(item => item.dictId === values.memoryId)?.dictItemName || '';
      // const ssdSize = values.ssdId ? (dictData.SSD_SIZE?.find(item => item.dictId === values.ssdId)?.dictItemName || '') : '—';
      // const hddSize = values.hddId ? (dictData.HDD_SIZE?.find(item => item.dictId === values.hddId)?.dictItemName || '') : '—';

      // 从字典数据中获取显示名称
      const osName = dictMap.OS_TYPE?.find(item => item.dictId === values.osId)?.dictItemName || '';
      const memorySize = dictMap.MEMORY_SIZE?.find(item => item.dictId === values.memoryId)?.dictItemName || '';
      const ssdSize = values.ssdId ? (dictMap.SSD_SIZE?.find(item => item.dictId === values.ssdId)?.dictItemName || '') : '—';
      const hddSize = values.hddId ? (dictMap.HDD_SIZE?.find(item => item.dictId === values.hddId)?.dictItemName || '') : '—';
      const confirmStatus = dictMap.CONFIRM_STATUS?.find(item => item.dictId === values.selfConfirmId)?.dictItemName || '';
      
      
      // 获取选中的用户信息
      const selectedUser = users.find(user => user.userId === values.userId);
      
      const submitData: DeviceListItem = {
        ...values,

        // 确保 monitors 和 deviceIps 不包含自增ID
        monitors: monitors
            .filter(m => m.monitorName.trim())
            .map(monitor => ({
              monitorName: monitor.monitorName,
              deviceId: values.deviceId,
            })),
        deviceIps: deviceIps
            .filter(ip => ip.ipAddress.trim())
            .map(ip => ({
              ipAddress: ip.ipAddress,
              deviceId: values.deviceId,
            })),

        // 设置字典显示值
        // confirmStatus: values.selfConfirmId === 1 ? '已确认' : '未确认',
        confirmStatus: confirmStatus,
        osName,
        memorySize,
        ssdSize,
        hddSize,

        // 设置用户信息
        userName: selectedUser?.name || values.userName,
        // 设置创建/更新时间
        updateTime: isEditing ? new Date().toISOString() : undefined,
        createTime: isEditing ? device?.createTime : new Date().toISOString(),
        creater: isEditing ? device?.creater : '系统管理员',
        updater: isEditing ? '系统管理员' : undefined,
      };

      onSubmit(submitData);
      form.resetFields();
    } catch (error) {
      console.log('表单验证失败:', error);
    }
  };

  // 处理显示器变更
  const handleMonitorChange = (index: number, field: keyof Monitor, value: any) => {
    const newMonitors = [...monitors];
    newMonitors[index] = { monitorName: value };
    setMonitors(newMonitors);
  };

  const addMonitor = () => {
    setMonitors([...monitors, { monitorName: '', deviceId: '' }]);
  };

  const removeMonitor = (index: number) => {
    if (monitors.length > 1) {
      const newMonitors = [...monitors];
      newMonitors.splice(index, 1);// 删除1个index位置的元素
      setMonitors(newMonitors);
    }
  };

  // 处理IP地址变更
  const handleIpChange = (index: number, field: keyof DeviceIp, value: any) => {
    const newIps = [...deviceIps];
    newIps[index] = { ipAddress: value };
    setDeviceIps(newIps);
  };

  const addIpAddress = () => {
    setDeviceIps([...deviceIps, { ipAddress: '', deviceId: '' }]);
  };

  const removeIpAddress = (index: number) => {
    if (deviceIps.length > 1) {
      const newIps = [...deviceIps];
      newIps.splice(index, 1);
      setDeviceIps(newIps);
    }
  };

  // 处理用户选择变化
  const handleUserChange = (userId: string) => {
    if (!isAdmin) return;

    const selectedUser = users.find(user => user.userId === userId);
    if (selectedUser) {
      form.setFieldsValue({
        userName: selectedUser.name,
        deptId: selectedUser.deptId || '',
      });
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
                <Select 
                  placeholder="请选择使用人" 
                  showSearch
                  optionFilterProp="children" // 输入内容，用 Option （children）进行搜索匹配
                  onChange={handleUserChange}
                >
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
                name="userName"
                label="用户姓名"
              >
                <Input placeholder="用户姓名将自动从选择的使用人填充" disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deptId"
                label="部门"
              >
                <Input placeholder="部门信息" />
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
                {/* <Select placeholder="请选择确认状态">
                  {dictData.CONFIRM_STATUS?.map(item => (
                    <Option key={item.dictId} value={item.dictId}>
                      {item.dictItemName}
                    </Option>
                  ))}
                </Select> */}

                <DictSelect
                  typeCode="CONFIRM_STATUS"
                  placeholder="请选择确认状态"
                  style={{ width: '100%' }}
                />
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
                  <DictSelect
                      typeCode="OS_TYPE"
                      placeholder="请选择操作系统"
                      style={{ width: '100%' }}
                      loading={dictLoading}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                    name="memoryId"
                    label="内存"
                    rules={[{ required: true, message: '请选择内存' }]}
                >
                  <DictSelect
                      typeCode="MEMORY_SIZE"
                      placeholder="请选择内存"
                      style={{ width: '100%' }}
                      loading={dictLoading}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                    name="ssdId"
                    label="固态硬盘"
                >
                  <DictSelect
                      typeCode="SSD_SIZE"
                      placeholder="请选择固态硬盘"
                      allowEmpty
                      emptyLabel="无"
                      style={{ width: '100%' }}
                      loading={dictLoading}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                    name="hddId"
                    label="机械硬盘"
                >
                  <DictSelect
                      typeCode="HDD_SIZE"
                      placeholder="请选择机械硬盘"
                      allowEmpty
                      emptyLabel="无"
                      style={{ width: '100%' }}
                      loading={dictLoading}
                  />
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
          
          {deviceIps.map((ip, index) => (
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
                    {deviceIps.length > 1 && (
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
          
          {/* 有几个monitor就有几个文本框*/}
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