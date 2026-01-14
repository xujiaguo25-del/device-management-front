import React from 'react';
import { Select, Spin } from 'antd';
import type { DictItem } from '../types';
import { useDict } from '../hooks/useDict';

const { Option } = Select;

interface DictSelectProps {
  typeCode?: string; // 辞書タイプコード
  items?: DictItem[]; // 直接提供する辞書アイテム
  value?: number | string | null; // 選択値
  onChange?: (value: number | null) => void; // 値変更コールバック
  placeholder?: string; // プレースホルダー
  style?: React.CSSProperties; // スタイル
  allowEmpty?: boolean; // 空のオプションを表示
  emptyLabel?: string; // 空オプションのラベル
  disabled?: boolean; // 無効状態
}

/**
 * 辞書データを表示するセレクトコンポーネント
 * 
 * 使い方:
 * 1. 直接データを提供する場合（推奨）:
 *    <DictSelect items={osOptions} placeholder="OSを選択" />
 * 
 * 2. 辞書タイプコードで自動取得:
 *    <DictSelect typeCode="OS_TYPE" placeholder="OSを選択" />
 */
const DictSelect: React.FC<DictSelectProps> = ({
  typeCode,
  items,
  value = undefined,
  onChange,
  placeholder,
  style,
  allowEmpty = true,
  emptyLabel = '-- 无 --',
  disabled = false,
}) => {
  // itemsが提供されている場合はそれを使用、そうでない場合はuseDictで取得
  const { data, loading, error } = items ? { data: items, loading: false, error: null } : useDict(typeCode || '');

  // 値変更処理
  const handleChange = (v: string | number) => {
    onChange?.(v ? Number(v) : null);
  };

  // 選択値の処理
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

      {loading && (
        <span style={{ marginLeft: 12 }}>
          <Spin size="small" />
        </span>
      )}

      {error && (
        <div style={{ color: 'red', marginLeft: 12 }}>読み込み失敗: {error}</div>
      )}
    </div>
  );
};

export default DictSelect;
