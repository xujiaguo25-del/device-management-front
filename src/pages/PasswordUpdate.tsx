import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Spin, Alert } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { changePasswordService } from '../services/auth/authService';
import { encrypt } from '../utils/crypto';
import Layout from '../components/common/Layout';

interface ChangePasswordFormData {
  userId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordUpdate: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // 先初始化 isAdmin 状态
  useEffect(() => {
    if (userInfo?.USER_TYPE_NAME) {
      // 根据 token 中的 userTypeName，管理员的值是 "ADMIN"
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
      userId: isAdmin ? '' : (userInfo?.USER_ID || ''), // 管理员默认为空，一般用户默认为自己的ID
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // 当 isAdmin 或 userInfo 改变时，重置表单
  useEffect(() => {
    if (userInfo?.USER_ID !== undefined) {
      // 如果是管理员，重置userId为空；如果是一般用户，设置为自己的ID
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

  // 密码强度验证函数
  const validatePasswordStrength = (password: string): boolean => {
    // 至少8位，包含字母、数字和特殊字符（@$!%*?）
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?])[A-Za-z\d@$!%*?]{8,}$/;
    return passwordRegex.test(password);
  };

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setLoading(true);

      // 验证新密码和确认密码是否一致
      if (data.newPassword !== data.confirmPassword) {
        message.error('新しいパスワードと確認パスワードが一致しません');
        return;
      }

      // 验证密码强度
      if (!validatePasswordStrength(data.newPassword)) {
        message.error('新しいパスワードは、8文字以上で、英字、数字、特殊文字（@$!%*?）を含む必要があります');
        return;
      }

      // 如果是管理员修改其他用户的密码，需要验证用户ID
      if (isAdmin && !data.userId) {
        message.error('ユーザーIDを入力してください');
        return;
      }

      // 确定要修改的用户ID
      const targetUserId = isAdmin ? data.userId : (userInfo?.USER_ID || '');
      
      // 如果是管理员修改其他用户的密码，不需要当前密码
      // 如果是一般用户修改自己的密码，或管理员修改自己的密码，需要当前密码
      const isChangingOwnPassword = targetUserId === userInfo?.USER_ID;
      
      const requestData: any = {
        userId: targetUserId,
      };

      // 一般用户或管理员修改自己的密码时，需要提供当前密码
      if (!isAdmin || isChangingOwnPassword) {
        if (!data.currentPassword) {
          message.error('現在のパスワードを入力してください');
          return;
        }
        requestData.currentPassword = encrypt(data.currentPassword);
      }
      // 管理员修改其他用户密码时，不发送currentPassword字段

      // 加密新密码
      requestData.newPassword = encrypt(data.newPassword);

      const response = await changePasswordService(requestData);

      // 成功提示
      message.success(response?.message || 'パスワードが正常に変更されました');

      // 重置表单
      reset({
        userId: isAdmin ? '' : (userInfo?.USER_ID || ''),
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // 如果是修改自己的密码，提示需要重新登录
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
              {/* 管理员可以修改任何用户的密码 */}
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

              {/* 一般用户修改自己的密码时需要当前密码，管理员修改自己的密码时也需要 */}
              {/* 管理员修改其他用户密码时不需要当前密码 */}
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
                    rules={{ required: '現在のパスワードを入力してください' }}
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

              {/* 管理员修改其他用户密码时的提示 */}
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
