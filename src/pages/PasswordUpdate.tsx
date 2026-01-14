import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Space, Alert, Divider } from 'antd';
import { LockOutlined, SafetyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { changePasswordService } from '../services/auth/authService';
import { useAuthStore } from '../stores/authStore';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordUpdate: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors }, watch } = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  // 密码强度验证
  const validatePassword = (value: string) => {
    if (!value) {
      return '请输入新密码';
    }
    if (value.length < 8) {
      return '密码至少需要8位';
    }
    if (!/[a-zA-Z]/.test(value)) {
      return '密码必须包含至少一个字母';
    }
    if (!/[0-9]/.test(value)) {
      return '密码必须包含至少一个数字';
    }
    return true;
  };

  // 确认密码验证
  const validateConfirmPassword = (value: string) => {
    if (!value) {
      return '请确认新密码';
    }
    if (value !== newPassword) {
      return '两次输入的密码不一致';
    }
    return true;
  };

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setLoading(true);
      await changePasswordService({
        userId: userInfo?.USER_ID || '',
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      message.success('密码修改成功，请重新登录');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      message.error(error.message || '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="修改密码">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Card>
          <Alert
            message="密码安全提示"
            description="密码需要至少8位，包含字母和数字，建议使用大小写字母、数字和特殊字符的组合。"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form layout="vertical" onFinish={() => handleSubmit(onSubmit)()} size="large">
            <Form.Item
              label="当前密码"
              validateStatus={errors.currentPassword ? 'error' : ''}
              help={errors.currentPassword?.message}
            >
              <Controller
                name="currentPassword"
                control={control}
                rules={{ required: '请输入当前密码' }}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                    placeholder="请输入当前密码"
                    autoComplete="current-password"
                  />
                )}
              />
            </Form.Item>

            <Divider />

            <Form.Item
              label="新密码"
              validateStatus={errors.newPassword ? 'error' : ''}
              help={errors.newPassword?.message}
            >
              <Controller
                name="newPassword"
                control={control}
                rules={{ validate: validatePassword }}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    prefix={<SafetyOutlined style={{ color: '#bfbfbf' }} />}
                    placeholder="请输入新密码（至少8位，包含字母和数字）"
                    autoComplete="new-password"
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label="确认新密码"
              validateStatus={errors.confirmPassword ? 'error' : ''}
              help={errors.confirmPassword?.message}
            >
              <Controller
                name="confirmPassword"
                control={control}
                rules={{ validate: validateConfirmPassword }}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    prefix={<CheckCircleOutlined style={{ color: '#bfbfbf' }} />}
                    placeholder="请再次输入新密码"
                    autoComplete="new-password"
                  />
                )}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  size="large"
                  style={{ minWidth: 120 }}
                >
                  确认修改
                </Button>
                <Button 
                  onClick={() => navigate(-1)}
                  size="large"
                >
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default PasswordUpdate;
