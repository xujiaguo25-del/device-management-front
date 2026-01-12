import React from 'react';
import { Select, Button, Spin } from 'antd';
import type { DictItem } from '../types';
import { useDict } from '../hooks/useDict';

const { Option } = Select;

interface DictSelectProps {
  typeCode?: string; // optional when passing items directly
  items?: DictItem[]; // if provided, use these items and don't call useDict
  value?: number | string | null;
  onChange?: (value: number | null) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  allowEmpty?: boolean;
  emptyLabel?: string;
  showRefresh?: boolean;
  onRefresh?: () => void; // parent can provide refresh handler when using items
  disabled?: boolean;
}

const DictSelect: React.FC<DictSelectProps> = ({
  typeCode,
  items,
  value = undefined,
  onChange,
  placeholder,
  style,
  allowEmpty = true,
  emptyLabel = '-- 无 --',
  showRefresh = false,
  onRefresh,
  disabled = false,
}) => {
  // If parent provided items, use them; otherwise fall back to useDict
  const { data, loading, error, refresh } = items ? { data: items, loading: false, error: null, refresh: undefined as unknown as () => void } : useDict(typeCode || '');

  const handleChange = (v: string | number) => {
    if (!onChange) return;
    onChange(v ? Number(v) : null);
  };

  const selectedValue = value === null || value === undefined ? undefined : Number(value);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Select
        style={style ?? { width: 240 }}
        placeholder={placeholder}
        value={selectedValue}
        onChange={handleChange}
        loading={loading}
        disabled={disabled || loading}
        allowClear={allowEmpty}
      >
        {allowEmpty && (
          <Option value={''} key="empty">
            {emptyLabel}
          </Option>
        )}
        {data.map((it: DictItem) => (
          <Option key={it.dictId} value={it.dictId}>
            {it.dictItemName}
          </Option>
        ))}
      </Select>

      {showRefresh && (
        <Button onClick={() => (onRefresh ? onRefresh() : refresh && refresh())} style={{ marginLeft: 12 }}>
          刷新
        </Button>
      )}

      {loading && (
        <span style={{ marginLeft: 12 }}>
          <Spin size="small" />
        </span>
      )}

      {error && (
        <div style={{ color: 'red', marginLeft: 12 }}>加载失败: {error}</div>
      )}
    </div>
  );
};

export default DictSelect;
