import React, { useCallback, useState } from 'react';
import { Table, Form, Input, Button, Space, Popconfirm, Card, message } from 'antd';
import Layout from '../components/common/Layout';
import type { DictItem } from '../types';
import { useDicts } from '../hooks/useDicts';
import DictSelect from '../components/DictSelect';

type DeviceRow = {
  key: string;
  name: string;
  os?: number | null;
  domainStatus?: number | null;
  usb?: number | null;
};

const DeviceManagement: React.FC = () => {
  // 需要的字典类型在页面一次性拉取，避免重复请求
  const { map: dictMap } = useDicts(['OS_TYPE', 'DOMAIN_STATUS', 'USB_STATUS']);

  const osOptions = (dictMap['OS_TYPE'] || []) as DictItem[];
  const domainOptions = (dictMap['DOMAIN_STATUS'] || []) as DictItem[];
  const usbOptions = (dictMap['USB_STATUS'] || []) as DictItem[];

  const [form] = Form.useForm();
  const [data, setData] = useState<DeviceRow[]>([
    { key: '1', name: 'Device A', os: null, domainStatus: null, usb: null },
    { key: '2', name: 'Device B', os: null, domainStatus: null, usb: null },
  ]);
  const [editingKey, setEditingKey] = useState<string>('');

  const isEditing = (record: DeviceRow) => record.key === editingKey;

  const edit = (record: Partial<DeviceRow> & { key: string }) => {
    form.setFieldsValue({ name: '', os: undefined, domainStatus: undefined, usb: undefined, ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key: string) => {
    try {
      const row = (await form.validateFields()) as DeviceRow;
      setData(prev => prev.map(item => (item.key === key ? { ...item, ...row } : item)));
      setEditingKey('');
      message.success('保存成功');
    } catch (err) {
      // validation failed
    }
  };

  const addRow = () => {
    const newKey = `${Date.now()}`;
    setData(prev => [...prev, { key: newKey, name: '', os: null, domainStatus: null, usb: null }]);
    // immediately edit the new row
    setTimeout(() => edit({ key: newKey }));
  };

  const deleteRow = (key: string) => {
    setData(prev => prev.filter(r => r.key !== key));
  };

  const getLabel = (options: DictItem[], id?: number | null) => {
    const it = options.find(o => o.dictId === id);
    return it ? it.dictItemName : '-';
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      width: '25%',
      render: (_: any, record: DeviceRow) => {
        const editing = isEditing(record);
        return editing ? (
          <Form.Item
            name="name"
            rules={[{ required: true, message: '名称为必填项' }]}
            style={{ margin: 0 }}
          >
            <Input placeholder="请输入名称" />
          </Form.Item>
        ) : (
          record.name || '-'
        );
      },
    },
    {
      title: 'OS',
      dataIndex: 'os',
      width: '22%',
      render: (_: any, record: DeviceRow) => {
        const editing = isEditing(record);
        return editing ? (
          <Form.Item name="os" style={{ margin: 0 }}>
            <DictSelect items={osOptions} placeholder="请选择 OS" />
          </Form.Item>
        ) : (
          getLabel(osOptions, record.os)
        );
      },
    },
    {
      title: '域状态',
      dataIndex: 'domainStatus',
      width: '22%',
      render: (_: any, record: DeviceRow) => {
        const editing = isEditing(record);
        return editing ? (
          <Form.Item name="domainStatus" style={{ margin: 0 }}>
            <DictSelect items={domainOptions} placeholder="请选择域状态" />
          </Form.Item>
        ) : (
          getLabel(domainOptions, record.domainStatus)
        );
      },
    },
    {
      title: 'USB',
      dataIndex: 'usb',
      width: '16%',
      render: (_: any, record: DeviceRow) => {
        const editing = isEditing(record);
        return editing ? (
          <Form.Item name="usb" style={{ margin: 0 }}>
            <DictSelect items={usbOptions} placeholder="请选择 USB" />
          </Form.Item>
        ) : (
          getLabel(usbOptions, record.usb)
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (_: any, record: DeviceRow) => {
        const editing = isEditing(record);
        return editing ? (
          <Space>
            <Button type="link" onClick={() => save(record.key)}>
              保存
            </Button>
            <Button type="link" onClick={cancel}>
              取消
            </Button>
          </Space>
        ) : (
          <Space>
            <Button type="link" onClick={() => edit(record)}>
              编辑
            </Button>
            <Popconfirm title="确定删除？" onConfirm={() => deleteRow(record.key)}>
              <Button type="link" danger>
                删除
              </Button>
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
          <Button type="primary" onClick={addRow}>
            新增行
          </Button>
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
