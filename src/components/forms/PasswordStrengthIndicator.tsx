/**
 * パスワード強度インジケーターコンポーネント
 */

import React, { useMemo } from 'react';
import { Progress, Typography } from 'antd';

const { Text } = Typography;

export interface PasswordStrengthIndicatorProps {
  password: string;
  showProgress?: boolean;
}

// パスワード強度検証関数
export const validatePasswordStrength = (password: string): boolean => {
  // 少なくとも8文字、英字、数字、特殊文字（@$!%*?）を含む
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?])[A-Za-z\d@$!%*?]{8,}$/;
  return passwordRegex.test(password);
};

// パスワード強度を計算（0-100）
const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;

  let strength = 0;

  // 長さチェック
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 10;

  // 文字種チェック
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/\d/.test(password)) strength += 15;
  if (/[@$!%*?]/.test(password)) strength += 15;

  return Math.min(strength, 100);
};

// パスワード強度レベルを取得
const getPasswordStrengthLevel = (strength: number): {
  level: 'weak' | 'medium' | 'strong';
  color: string;
  text: string;
} => {
  if (strength < 40) {
    return { level: 'weak', color: '#ff4d4f', text: '弱い' };
  } else if (strength < 70) {
    return { level: 'medium', color: '#faad14', text: '普通' };
  } else {
    return { level: 'strong', color: '#52c41a', text: '強い' };
  }
};

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showProgress = true,
}) => {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);
  const { color, text } = useMemo(() => getPasswordStrengthLevel(strength), [strength]);
  const isValid = useMemo(() => validatePasswordStrength(password), [password]);

  if (!password) {
    return null;
  }

  return (
    <div style={{ marginTop: '0px', marginBottom: '4px' }}>
      {showProgress && (
        <Progress
          percent={strength}
          strokeColor={color}
          showInfo={false}
          strokeWidth={2}
          style={{ lineHeight: '2px', width: '100%' }}
        />
      )}
      {!isValid && (
        <div style={{ marginTop: '2px' }}>
          <Text type="danger" style={{ fontSize: '12px' }}>
            8文字以上で、英字、数字、特殊文字（@$!%*?）を含む必要があります
          </Text>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
