// components/device/DeviceDetailModal.tsx
import React from 'react';
import {
  Modal,
  Descriptions,
  Tag,
  Space,
  List,
  Card,
  Row,
  Col,
  Typography,
  Badge,
  Button,
} from 'antd';
import {
  DesktopOutlined,
  MonitorOutlined,
  CloudOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { DeviceFullDTO } from '../../types/devices';
import dayjs from 'dayjs';

const { Text } = Typography;

interface DeviceDetailModalProps {
  visible: boolean;
  device: DeviceFullDTO | null;
  dictData: Record<string, any[]>;
  onCancel: () => void;
  isAdmin?: boolean; // ✅ 添加：是否为管理员
  currentUserId?: string; // ✅ 添加：当前登录用户ID
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

  const selfConfirmStatus = getDictName('CONFIRM_STATUS', device.selfConfirmId);
  const osName = getDictName('OS_TYPE', device.osId);
  const memoryName = getDictName('MEMORY_SIZE', device.memoryId);
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
              {device.deviceModel}
            </Descriptions.Item>
            <Descriptions.Item label="电脑名称">
              {device.computerName}
            </Descriptions.Item>
            <Descriptions.Item label="使用人">
              <Space>
                <UserOutlined />
                <div>
                  <div>{device.name}</div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {device.userId}
                  </Text>
                </div>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="部门">
              {device.deptId}
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
              IP地址 ({device.ipAddresses?.length || 0}个)
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          {device.ipAddresses && device.ipAddresses.length > 0 ? (
            <List
              dataSource={device.ipAddresses}
              renderItem={(ip, index) => (
                <List.Item>
                  <Space>
                    <Tag color="blue">IP{index + 1}</Tag>
                    <Text code>{ip.ipAddress}</Text>
                    {ip.createTime && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        创建于: {dayjs(ip.createTime).format('YYYY-MM-DD')}
                      </Text>
                    )}
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
          {device.monitors && device.monitors.length > 0 ? (
            <List
              dataSource={device.monitors}
              renderItem={(monitor, index) => (
                <List.Item>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Tag color="green">显示器{index + 1}</Tag>
                      <Text strong>{monitor.monitorName}</Text>
                    </div>
                    {monitor.createTime && (
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          创建时间: {dayjs(monitor.createTime).format('YYYY-MM-DD HH:mm')}
                        </Text>
                      </div>
                    )}
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

        {/* 系统信息 */}
        <Card title="系统信息" size="small">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="创建人">
              {device.creater}
            </Descriptions.Item>
            <Descriptions.Item label="更新人">
              {device.updater}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
};

export default DeviceDetailModal;
