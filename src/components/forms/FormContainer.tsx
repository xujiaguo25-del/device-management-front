/**
 * フォームコンテナコンポーネント
 * 統一されたフォームレイアウトとローディング状態を提供
 */

import React from 'react';
import { Card, Spin } from 'antd';

export interface FormContainerProps {
  children: React.ReactNode;
  loading?: boolean;
  title?: string;
  maxWidth?: number | string;
  padding?: number | string;
}

const FormContainer: React.FC<FormContainerProps> = ({
  children,
  loading = false,
  title,
  maxWidth = '600px',
  padding = '24px',
}) => {
  return (
    <div style={{ maxWidth, margin: '0 auto', padding, width: '100%' }}>
      <Card 
        title={title}
        style={{ width: '100%' }}
        headStyle={{ textAlign: 'center' }}
      >
        <Spin spinning={loading}>{children}</Spin>
      </Card>
    </div>
  );
};

export default FormContainer;
