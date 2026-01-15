import React, { useState, useEffect } from 'react';
import { Form, Button, message, Alert } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { changePasswordService } from '../services/auth/authService';
import { encrypt } from '../utils/crypto';
import type { ChangePasswordRequest } from '../types';
import Layout from '../components/common/Layout';
import FormContainer from '../components/forms/FormContainer';
import FormField from '../components/forms/FormField';
import PasswordStrengthIndicator, { validatePasswordStrength } from '../components/forms/PasswordStrengthIndicator';

interface ChangePasswordFormData {
  userId: string;
  currentPassword?: string; // 管理者が他のユーザーのパスワードを変更する場合は不要
  newPassword: string;
  confirmPassword: string;
}

const PasswordUpdate: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // isAdmin 状態を初期化
  useEffect(() => {
    if (userInfo?.USER_TYPE_NAME) {
      // token の userTypeName に基づき、管理者の値は "ADMIN"
      const adminStatus = userInfo.USER_TYPE_NAME.toUpperCase() === 'ADMIN';
      setIsAdmin(adminStatus);
    }
  }, [userInfo]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    defaultValues: {
      userId: isAdmin ? '' : (userInfo?.USER_ID || ''), // 管理者はデフォルトで空、一般ユーザーはデフォルトで自分のID
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // isAdmin または userInfo が変更されたとき、フォームをリセット
  useEffect(() => {
    if (userInfo?.USER_ID !== undefined) {
      // 管理者の場合、userIdを空にリセット；一般ユーザーの場合、自分のIDに設定
      if (isAdmin) {
        reset({
          userId: '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        reset({
          userId: userInfo.USER_ID || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    }
  }, [isAdmin, userInfo, reset]);

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setLoading(true);

      // 新しいパスワードと確認パスワードが一致するか検証
      if (data.newPassword !== data.confirmPassword) {
        message.error('新しいパスワードと確認パスワードが一致しません');
        return;
      }

      // パスワード強度を検証
      if (!validatePasswordStrength(data.newPassword)) {
        message.error('新しいパスワードは、8文字以上で、英字、数字、特殊文字（@$!%*?）を含む必要があります');
        return;
      }

      // 管理者が他のユーザーのパスワードを変更する場合、ユーザーIDを検証する必要がある
      if (isAdmin && !data.userId) {
        message.error('ユーザーIDを入力してください');
        return;
      }

      // 変更するユーザーIDを決定
      const targetUserId = isAdmin ? data.userId : (userInfo?.USER_ID || '');
      
      // 管理者が他のユーザーのパスワードを変更する場合、現在のパスワードは不要
      // 一般ユーザーが自分のパスワードを変更する場合、または管理者が自分のパスワードを変更する場合、現在のパスワードが必要
      const isChangingOwnPassword = targetUserId === userInfo?.USER_ID;
      
      // リクエストデータを構築
      const requestData: ChangePasswordRequest = {
        userId: targetUserId,
        newPassword: encrypt(data.newPassword),
      };

      // 一般ユーザーまたは管理者が自分のパスワードを変更する場合、現在のパスワードを提供する必要がある
      if (!isAdmin || isChangingOwnPassword) {
        if (!data.currentPassword) {
          message.error('現在のパスワードを入力してください');
          return;
        }
        requestData.currentPassword = encrypt(data.currentPassword);
      }
      // 管理者が他のユーザーのパスワードを変更する場合、currentPasswordフィールドを送信しない

      const response = await changePasswordService(requestData);

      // フォームをリセット
      reset({
        userId: isAdmin ? '' : (userInfo?.USER_ID || ''),
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // 自分のパスワードを変更した場合、再ログインが必要であることを示す
      // 管理者が他のユーザーのパスワードを変更した場合は、再ログイン不要
      if (targetUserId === userInfo?.USER_ID) {
        // 成功メッセージ（再ログインが必要な場合）
        message.success('パスワードが更新されました。再度ログインしてください。', 3);
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      } else {
        // 成功メッセージ（管理者が他のユーザーのパスワードを変更した場合）
        message.success('パスワードが正常に変更されました');
      }
    } catch (error: any) {
      console.error('パスワード変更失敗:', error);
      const errorMessage = error?.message || 'パスワード変更に失敗しました';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="パスワード変更">
      <FormContainer loading={loading}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* 管理者は任意のユーザーのパスワードを変更できる */}
          {isAdmin && (
            <FormField
              name="userId"
              control={control as any}
              label="ユーザーID"
              type="text"
              prefix={<UserOutlined />}
              placeholder="変更するユーザーIDを入力してください"
              error={errors.userId}
              required
            />
          )}

          {/* 一般ユーザーが自分のパスワードを変更する場合、現在のパスワードが必要。管理者が自分のパスワードを変更する場合も必要 */}
          {/* 管理者が他のユーザーのパスワードを変更する場合、現在のパスワードは不要 */}
          {(!isAdmin || !watch('userId') || watch('userId') === userInfo?.USER_ID) && (
            <FormField
              name="currentPassword"
              control={control as any}
              label="現在のパスワード"
              type="password"
              prefix={<LockOutlined />}
              placeholder="現在のパスワードを入力してください"
              error={errors.currentPassword}
              rules={{
                validate: (value: string | undefined) => {
                  // 管理者が他のユーザーのパスワードを変更する場合は検証しない
                  const targetUserId = watch('userId');
                  if (isAdmin && targetUserId && targetUserId !== userInfo?.USER_ID) {
                    return true;
                  }
                  // それ以外の場合は必須
                  if (!value) {
                    return '現在のパスワードを入力してください';
                  }
                  return true;
                },
              }}
            />
          )}


          <FormField
            name="newPassword"
            control={control as any}
            label="新しいパスワード"
            type="password"
            prefix={<LockOutlined />}
            placeholder="新しいパスワードを入力してください"
            error={errors.newPassword}
            required
            rules={{
              validate: (value: string) =>
                validatePasswordStrength(value) ||
                'パスワードは8文字以上で、英字、数字、特殊文字（@$!%*?）を含む必要があります',
            }}
          />
          {newPassword && (
            <div style={{ marginTop: '-28px', marginBottom: '8px' }}>
              <PasswordStrengthIndicator password={newPassword} />
            </div>
          )}

          <FormField
            name="confirmPassword"
            control={control as any}
            label="パスワード確認"
            type="password"
            prefix={<LockOutlined />}
            placeholder="新しいパスワードを再度入力してください"
            error={errors.confirmPassword}
            required
            rules={{
              validate: (value: string) =>
                value === newPassword || 'パスワードが一致しません',
            }}
          />

          <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              パスワードを変更
            </Button>
          </Form.Item>
        </form>
      </FormContainer>
    </Layout>
  );
};

export default PasswordUpdate;
