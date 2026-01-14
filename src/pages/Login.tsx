import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Spin, Checkbox, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { loginService } from '../services/auth/authService';
import './Login.css';

interface LoginFormData {
  userId: string;
  password: string;
  rememberMe?: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      userId: localStorage.getItem('remembered_userId') || '',
      rememberMe: !!localStorage.getItem('remembered_userId'),
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      const response = await loginService({
        userId: data.userId,
        password: data.password,
      });

      // 保存记住我选项
      if (data.rememberMe) {
        localStorage.setItem('remembered_userId', data.userId);
      } else {
        localStorage.removeItem('remembered_userId');
      }

      // 保存登录信息
      login(response.token, response.userInfo);
      message.success('登录成功');
      navigate('/devices');
    } catch (error: any) {
      message.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" title="设备管理系统登录">
        <Spin spinning={loading}>
          <Form layout="vertical" onFinish={() => handleSubmit(onSubmit)()}>
            <Form.Item
              label="工号/用户ID"
              validateStatus={errors.userId ? 'error' : ''}
              help={errors.userId?.message}
            >
              <Controller
                name="userId"
                control={control}
                rules={{ required: '请输入工号' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    prefix={<UserOutlined />}
                    placeholder="请输入工号或用户ID"
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label="密码"
              validateStatus={errors.password ? 'error' : ''}
              help={errors.password?.message}
            >
              <Controller
                name="password"
                control={control}
                rules={{ required: '请输入密码' }}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    prefix={<LockOutlined />}
                    placeholder="请输入密码"
                  />
                )}
              />
            </Form.Item>

            <Form.Item>
              <Row justify="space-between" align="middle">
                <Col>
                  <Controller
                    name="rememberMe"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      >
                        记住我
                      </Checkbox>
                    )}
                  />
                </Col>
              </Row>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                登录
              </Button>
            </Form.Item>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#999' }}>
              <p>演示账户: admin / password123</p>
              <p>使用假数据进行演示</p>
            </div>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default Login;
