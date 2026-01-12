import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Spin, Alert } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { changePasswordService } from '../services/auth/authService';
import { encrypt } from '../utils/crypto';
import type { ChangePasswordRequest } from '../types';
import Layout from '../components/common/Layout';

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

  // パスワード強度検証関数
  const validatePasswordStrength = (password: string): boolean => {
    // 少なくとも8文字、英字、数字、特殊文字（@$!%*?）を含む
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?])[A-Za-z\d@$!%*?]{8,}$/;
    return passwordRegex.test(password);
  };

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

      // 成功メッセージ
      message.success(response?.message || 'パスワードが正常に変更されました');

      // フォームをリセット
      reset({
        userId: isAdmin ? '' : (userInfo?.USER_ID || ''),
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // 自分のパスワードを変更した場合、再ログインが必要であることを示す
      if (targetUserId === userInfo?.USER_ID) {
        message.info('パスワードが更新されました。再度ログインしてください。', 3);
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
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
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
        <Card>
          <Spin spinning={loading}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* 管理者は任意のユーザーのパスワードを変更できる */}
              {isAdmin && (
                <Form.Item
                  label="ユーザーID"
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  validateStatus={errors.userId ? 'error' : ''}
                  help={errors.userId?.message}
                >
                  <Controller
                    name="userId"
                    control={control}
                    rules={{ required: 'ユーザーIDを入力してください' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        prefix={<UserOutlined />}
                        placeholder="変更するユーザーIDを入力してください"
                      />
                    )}
                  />
                </Form.Item>
              )}

              {/* 一般ユーザーが自分のパスワードを変更する場合、現在のパスワードが必要。管理者が自分のパスワードを変更する場合も必要 */}
              {/* 管理者が他のユーザーのパスワードを変更する場合、現在のパスワードは不要 */}
              {(!isAdmin || !watch('userId') || watch('userId') === userInfo?.USER_ID) && (
                <Form.Item
                  label="現在のパスワード"
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  validateStatus={errors.currentPassword ? 'error' : ''}
                  help={errors.currentPassword?.message}
                >
                  <Controller
                    name="currentPassword"
                    control={control}
                    rules={{
                      validate: (value) => {
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
                    render={({ field }) => (
                      <Input.Password
                        {...field}
                        prefix={<LockOutlined />}
                        placeholder="現在のパスワードを入力してください"
                      />
                    )}
                  />
                </Form.Item>
              )}

              {/* 管理者が他のユーザーのパスワードを変更する場合のヒント */}
              {isAdmin && watch('userId') && watch('userId') !== userInfo?.USER_ID && (
                <Alert
                  message="管理者として他のユーザーのパスワードを変更する場合、現在のパスワードは不要です"
                  type="info"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}

              <Form.Item
                label="新しいパスワード"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                validateStatus={errors.newPassword ? 'error' : ''}
                help={
                  errors.newPassword?.message ||
                  (newPassword && !validatePasswordStrength(newPassword)
                    ? 'パスワードは8文字以上で、英字、数字、特殊文字（@$!%*?）を含む必要があります'
                    : '')
                }
              >
                <Controller
                  name="newPassword"
                  control={control}
                  rules={{
                    required: '新しいパスワードを入力してください',
                    validate: (value) =>
                      validatePasswordStrength(value) ||
                      'パスワードは8文字以上で、英字、数字、特殊文字（@$!%*?）を含む必要があります',
                  }}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      prefix={<LockOutlined />}
                      placeholder="新しいパスワードを入力してください"
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="パスワード確認"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                validateStatus={errors.confirmPassword ? 'error' : ''}
                help={errors.confirmPassword?.message}
              >
                <Controller
                  name="confirmPassword"
                  control={control}
                  rules={{
                    required: 'パスワード確認を入力してください',
                    validate: (value) =>
                      value === newPassword || 'パスワードが一致しません',
                  }}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      prefix={<LockOutlined />}
                      placeholder="新しいパスワードを再度入力してください"
                    />
                  )}
                />
              </Form.Item>

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
          </Spin>
        </Card>
      </div>
    </Layout>
  );
};

export default PasswordUpdate;
