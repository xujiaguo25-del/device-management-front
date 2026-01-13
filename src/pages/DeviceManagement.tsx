import React, { useState } from 'react';
import { Table, Form, Input, Button, Space, Popconfirm, Card, message } from 'antd';
import Layout from '../components/common/Layout';
import type { DictItem } from '../types';
import { useDicts } from '../hooks/useDicts';
import DictSelect from '../components/DictSelect';

// デバイス行の型定義
// DictSelectで使用するフィールドはnumber | null型とする

type DeviceRow = {
  key: string;
  name: string;
  os?: number | null;   // OSタイプ (DictSelect使用)
  domainStatus?: number | null;  // ドメインステータス (DictSelect使用)
  usb?: number | null;  // USBステータス (DictSelect使用)
};

const DeviceManagement: React.FC = () => {
  // 辞書データを一括取得（重複リクエストを避けるため）
  const { map: dictMap } = useDicts(['OS_TYPE', 'DOMAIN_STATUS', 'USB_STATUS']);

  // 各フィールド用の辞書オプションを抽出
  const osOptions = (dictMap['OS_TYPE'] || []) as DictItem[];
  const domainOptions = (dictMap['DOMAIN_STATUS'] || []) as DictItem[];
  const usbOptions = (dictMap['USB_STATUS'] || []) as DictItem[];

  // 状態管理
  const [form] = Form.useForm();
  const [data, setData] = useState<DeviceRow[]>([
    { key: '1', name: 'Device A', os: null, domainStatus: null, usb: null },
    { key: '2', name: 'Device B', os: null, domainStatus: null, usb: null },
  ]);
  const [editingKey, setEditingKey] = useState<string>('');

  // 編集中判定
  const isEditing = (record: DeviceRow) => record.key === editingKey;

  // DictSelectの選択値から表示ラベルを取得
  const getLabel = (options: DictItem[], id?: number | null) => {
    const it = options.find(o => o.dictId === id);
    return it ? it.dictItemName : '-';
  };

  // 編集操作関数
  const edit = (record: Partial<DeviceRow> & { key: string }) => {
    form.setFieldsValue({ name: '', os: undefined, domainStatus: undefined, usb: undefined, ...record });
    setEditingKey(record.key);
  };

  const cancel = () => setEditingKey('');

  const save = async (key: string) => {
    try {
      const row = (await form.validateFields()) as DeviceRow;
      setData(prev => prev.map(item => (item.key === key ? { ...item, ...row } : item)));
      setEditingKey('');
      message.success('保存しました');
    } catch (err) {}
  };

  const addRow = () => {
    const newKey = `${Date.now()}`;
    setData(prev => [...prev, { key: newKey, name: '', os: null, domainStatus: null, usb: null }]);
    setTimeout(() => edit({ key: newKey }));
  };

  const deleteRow = (key: string) => {
    setData(prev => prev.filter(r => r.key !== key));
  };

  // テーブルカラム定義
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      width: '25%',
      render: (_: any, record: DeviceRow) => {
        const editing = isEditing(record);
        return editing ? (
          <Form.Item name="name" rules={[{ required: true, message: '名称は必須項目です' }]} style={{ margin: 0 }}>
              <Input placeholder="名称を入力してください" />
          </Form.Item>
        ) : (record.name || '-');
      },
    },
    {
      title: 'OS',
      dataIndex: 'os',
      width: '22%',
      render: (_: any, record: DeviceRow) => {
        const editing = isEditing(record);
        if (editing) {
          // DictSelect使用例：itemsプロパティで直接データを提供
          return (
            <Form.Item name="os" style={{ margin: 0 }}>
              <DictSelect items={osOptions} placeholder="OSを選択" />
            </Form.Item>
          );
        }
        return getLabel(osOptions, record.os);
      },
    },
    {
      title: 'ドメインステータス',
      dataIndex: 'domainStatus',
      width: '22%',
      render: (_: any, record: DeviceRow) => {
        const editing = isEditing(record);
        if (editing) {
          return (
            <Form.Item name="domainStatus" style={{ margin: 0 }}>
              <DictSelect items={domainOptions} placeholder="ドメインステータスを選択" />
            </Form.Item>
          );
        }
        return getLabel(domainOptions, record.domainStatus);
      },
    },
    {
      title: 'USB',
      dataIndex: 'usb',
      width: '16%',
      render: (_: any, record: DeviceRow) => {
        const editing = isEditing(record);
        if (editing) {
          return (
            <Form.Item name="usb" style={{ margin: 0 }}>
              <DictSelect items={usbOptions} placeholder="USBを選択" />
            </Form.Item>
          );
        }
        return getLabel(usbOptions, record.usb);
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (_: any, record: DeviceRow) => {
        const editing = isEditing(record);
        return editing ? (
          <Space>
            <Button type="link" onClick={() => save(record.key)}>保存</Button>
            <Button type="link" onClick={cancel}>キャンセル</Button>
          </Space>
        ) : (
          <Space>
            <Button type="link" onClick={() => edit(record)}>編集</Button>
            <Popconfirm title="削除してもよろしいですか？" onConfirm={() => deleteRow(record.key)}>
              <Button type="link" danger>削除</Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <Layout title="デバイス管理">
      <Card style={{ marginTop: 12 }}>
        <Space style={{ marginBottom: 12 }}>
          <Button type="primary" onClick={addRow}>新規行追加</Button>
        </Space>

        <Form form={form} component={false}>
          <Table
            bordered
            dataSource={data}
            columns={columns}
            rowKey="key"
            pagination={{ pageSize: 8 }}
          />
        </Form>
      </Card>
    </Layout>
  );
};

export default DeviceManagement;
