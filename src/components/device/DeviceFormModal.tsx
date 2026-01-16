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
import DictSelect from '../DictSelect'; // この行を追加
import { useDicts } from '../../hooks/useDicts'; // この行を追加

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface DeviceFormModalProps {
  visible: boolean;
  isEditing: boolean;
  device: DeviceListItem | null;
  dictData: Record<string, any[]>; // Record定義オブジェクト
  users: any[];
  onCancel: () => void;
  onSubmit: (values: DeviceListItem) => void;
}

                                  // パラメータの型を定義
const DeviceFormModal: React.FC<DeviceFormModalProps> = ({
  visible,
  isEditing,
  device,
  dictData,                 // パラメータを分解
  users,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm(); // antdライブラリ
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [deviceIps, setDeviceIps] = useState<DeviceIp[]>([]);

  // useDictsを使用して辞書データを取得
  const { map: dictMap, loading: dictLoading } = useDicts([
    'CONFIRM_STATUS',
    'OS_TYPE',
    'MEMORY_SIZE',
    'SSD_SIZE',
    'HDD_SIZE'
  ]);

  useEffect(() => {
    if (visible) {
      if (device) {
        // 編集モード：フォーム値を設定
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
        // 新規モード：デフォルト値を設定
        form.resetFields();
        setMonitors([{ monitorName: '', deviceId: '' }]);
        setDeviceIps([{ ipAddress: '', deviceId: '' }]);
      }
    }
  }, [visible, device, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // IPアドレスを検証
      const invalidIps = deviceIps.filter(ip => ip.ipAddress && !isValidIP(ip.ipAddress));
      if (invalidIps.length > 0) {
        message.error('IPアドレスの形式を確認してください');
        return;
      }

      // 辞書データから表示名を取得
      const osName = dictMap.OS_TYPE?.find(item => item.dictId === values.osId)?.dictItemName || '';
      const memorySize = dictMap.MEMORY_SIZE?.find(item => item.dictId === values.memoryId)?.dictItemName || '';
      const ssdSize = values.ssdId ? (dictMap.SSD_SIZE?.find(item => item.dictId === values.ssdId)?.dictItemName || '') : '—';
      const hddSize = values.hddId ? (dictMap.HDD_SIZE?.find(item => item.dictId === values.hddId)?.dictItemName || '') : '—';
      const confirmStatus = dictMap.CONFIRM_STATUS?.find(item => item.dictId === values.selfConfirmId)?.dictItemName || '';
      
      
      // 選択したユーザー情報を取得
      const selectedUser = users.find(user => user.userId === values.userId);
      
      const submitData: DeviceListItem = {
        ...values,

         monitors: monitors
        .filter(m => m.monitorName.trim())
        .map(monitor => ({
          monitorName: monitor.monitorName,
          deviceId: values.deviceId,
        })),

        // deviceIpsにipIdが含まれていないことを確認
        deviceIps: deviceIps
        .filter(ip => ip.ipAddress.trim())
        .map(ip => ({
          ipAddress: ip.ipAddress,
          deviceId: values.deviceId,
        })),

        // 辞書表示値を設定
        confirmStatus: confirmStatus,
        osName,
        memorySize,
        ssdSize,
        hddSize,

        // ユーザー情報を設定
        userName: selectedUser?.name || values.userName,
        // 作成/更新時間を設定
        updateTime: isEditing ? new Date().toISOString() : undefined,
        createTime: isEditing ? device?.createTime : new Date().toISOString(),
        creater: isEditing ? device?.creater : 'システム管理者',
        updater: isEditing ? 'システム管理者' : undefined,
      };

      onSubmit(submitData);
      // フォームデータを保持し、送信失敗時に再編集して再送信可能
      // form.resetFields();
    } catch (error) {
      console.log('フォーム検証失敗:', error);
    }
  };

  // モニター変更を処理
  const handleMonitorChange = (index: number, field: keyof Monitor, value: any) => {
    const newMonitors = [...monitors];    
    // monitorIdの処理を除去し、monitorNameのみ保持
    newMonitors[index] = { monitorName: value };
    setMonitors(newMonitors);
  };

  const addMonitor = () => {
    setMonitors([...monitors, { monitorName: '', deviceId: '' }]);
  };

  const removeMonitor = (index: number) => {
    // if (monitors.length > 1) {
      const newMonitors = [...monitors];
      newMonitors.splice(index, 1);// index位置の要素を1つ削除
      setMonitors(newMonitors);
    // }
  };

  // IPアドレス変更を処理
  const handleIpChange = (index: number, field: keyof DeviceIp, value: any) => {
    const newIps = [...deviceIps];

    // ipIdの処理を除去し、ipAddressのみ保持
    newIps[index] = { ipAddress: value };
    setDeviceIps(newIps);
  };

  const addIpAddress = () => {
    setDeviceIps([...deviceIps, { ipAddress: '', deviceId: '' }]);
  };

  const removeIpAddress = (index: number) => {
    // if (deviceIps.length > 1) {
      const newIps = [...deviceIps];
      newIps.splice(index, 1);
      setDeviceIps(newIps);
    // }
  };

  // ユーザー選択変更を処理
  const handleUserChange = (userId: string) => {
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
      title={isEditing ? 'デバイス編集' : 'デバイス追加'}
      open={visible}
      width={800}
      maskClosable={false} // マスクレイヤー closingを無効化
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          キャンセル
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          送信
        </Button>,
      ]}
    >
      <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0 8px' }}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Title level={5} style={{ marginBottom: 16 }}>基本情報</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="deviceId"
                label="デバイス番号"
                rules={[{ required: true, message: 'デバイス番号を入力してください' }]}
              >
                <Input 
                  placeholder="デバイス番号を入力してください（例：DEV001）" 
                  disabled={isEditing}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deviceModel"
                label="デバイスモデル"
              >
                <Input placeholder="デバイスモデルを入力してください" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="computerName"
                label="コンピュータ名"
              >
                <Input placeholder="コンピュータ名を入力してください" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="userId"
                label="使用者"
                rules={[{ required: true, message: '使用者を選択してください' }]}
              >
                <Select 
                  placeholder="使用者を選択してください" 
                  showSearch
                  optionFilterProp="children" // 入力内容をOption（children）で検索マッチング
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
                label="ユーザー名"
              >
                <Input placeholder="選択した使用者からユーザー名が自動入力されます" disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deptId"
                label="部署"
              >
                <Input placeholder="部署情報" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="project"
                label="プロジェクト"
              >
                <Input placeholder="プロジェクト名を入力してください" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="devRoom"
                label="開発室"
              >
                <Input placeholder="開発室を入力してください" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="loginUsername"
                label="ログインユーザー名"
              >
                <Input placeholder="ログインユーザー名を入力してください" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="selfConfirmId"
                label="本人確認"
              >        
                <DictSelect
                  typeCode="CONFIRM_STATUS"
                  placeholder="確認状態を選択してください"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={5} style={{ marginBottom: 16 }}>ハードウェア設定</Title>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="osId"
                label="OS"
              >
                <DictSelect
                  typeCode="OS_TYPE"
                  placeholder="OSを選択してください"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="memoryId"
                label="メモリ"
              >  
                <DictSelect
                  typeCode="MEMORY_SIZE"
                  placeholder="メモリを選択してください"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="ssdId"
                label="SSD"
              >              
                 <DictSelect
                  typeCode="SSD_SIZE"
                  placeholder="SSDを選択してください"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="hddId"
                label="HDD"                
              >
                
                <DictSelect
                  typeCode="HDD_SIZE"
                  placeholder="HDDを選択してください"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={5} style={{ marginBottom: 16 }}>
            IPアドレス設定
            <Button 
              type="link" 
              icon={<PlusOutlined />} 
              onClick={addIpAddress}
              style={{ marginLeft: 8 }}
            >
              IP追加
            </Button>
          </Title>
          
          {deviceIps.map((ip, index) => (
            <Card key={index} size="small" style={{ marginBottom: 8 }}>
              <Row gutter={16} align="middle">
                <Col span={20}>
                    <Input
                    placeholder="IPアドレスを入力してください（例：192.168.1.100）"
                    value={ip.ipAddress}
                    onChange={(e) => handleIpChange(index, 'ipAddress', e.target.value)}
                    status={ip.ipAddress && !isValidIP(ip.ipAddress) ? 'error' : undefined}
                  />
                  {ip.ipAddress && !isValidIP(ip.ipAddress) && (
                    <Text type="danger" style={{ fontSize: '12px' }}>
                      有効なIPアドレスを入力してください
                    </Text>
                  )}
                </Col>
                <Col span={4}>
                  <Space>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeIpAddress(index)}
                    />
                  </Space>
                </Col>
              </Row>
            </Card>
          ))}

          <Divider />

          <Title level={5} style={{ marginBottom: 16 }}>
            モニター設定
            <Button 
              type="link" 
              icon={<PlusOutlined />} 
              onClick={addMonitor}
              style={{ marginLeft: 8 }}
            >
              モニター追加
            </Button>
          </Title>
          
          {/* モニター数に応じてテキストボックスが表示される*/}
          {monitors.map((monitor, index) => (
            <Card key={index} size="small" style={{ marginBottom: 8 }}>
              <Row gutter={16} align="middle">
                <Col span={20}>
                  <Input
                    placeholder="モニター名を入力してください（例：DELL U2415）"
                    value={monitor.monitorName}
                    onChange={(e) => handleMonitorChange(index, 'monitorName', e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Space>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeMonitor(index)}
                    />
                  </Space>
                </Col>
              </Row>
            </Card>
          ))}

          <Divider />

          <Form.Item name="remark" label="備考" style={{ marginTop: 16 }}>
            <TextArea placeholder="備考情報を入力してください" rows={3} />
          </Form.Item>

          <Form.Item name="creater" label="作成者" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
          <Form.Item name="updater" label="更新者" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default DeviceFormModal;