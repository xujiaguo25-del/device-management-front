import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import { useDict } from '../hooks/useDict';
import { Select, Button, Spin } from 'antd';

const { Option } = Select;

const DeviceManagement: React.FC = () => {
  const { data: usbStatus, loading, error, refresh } = useDict('USB_STATUS');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const onChange = (value: string | number) => {
    setSelectedId(value ? Number(value) : null);
  };

  const selectedLabel = usbStatus.find((s) => s.dictId === selectedId)?.dictItemName || '';

  return (
    <Layout title="デバイス管理">
      ここはデバイス管理ページです

      {error && <div style={{ color: 'red' }}>加载失败: {error}</div>}

      <div>
        <Select
          style={{ width: 240 }}
          placeholder="请选择 USB 状态"
          value={selectedId ?? undefined}
          onChange={onChange}
          loading={loading}
          disabled={loading}
        >
          <Option value={''} key="empty">-- 无 --</Option>
          {usbStatus.map((it) => (
            <Option key={it.dictId} value={it.dictId}>
              {it.dictItemName}
            </Option>
          ))}
        </Select>

        <Button onClick={() => refresh()} style={{ marginLeft: 12 }}>
          刷新
        </Button>

        {loading && (
          <span style={{ marginLeft: 12 }}><Spin size="small" /></span>
        )}

        {selectedId != null && (
          <div style={{ marginTop: 8 }}>
            已选: {selectedLabel} ({selectedId})
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DeviceManagement;
