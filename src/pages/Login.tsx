import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Spin, Checkbox, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { loginService } from '../services/auth/authService';
import { encrypt } from '../utils/crypto';
import './Login.css';

interface LoginFormData {
  userId: string;
  password: string;
  rememberMe?: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const { 
    control, 
    handleSubmit, 
    formState: { errors }
  } = useForm<LoginFormData>({
    defaultValues: {
      userId: localStorage.getItem('remembered_userId') || '',
      rememberMe: !!localStorage.getItem('remembered_userId'),
    },
  });

  // 如果已经登录，自动跳转到之前想访问的页面或默认页面
  useEffect(() => {
    if (token) {
      const from = (location.state as any)?.from?.pathname || '/devices';
      navigate(from, { replace: true });
    }
  }, [token, navigate, location]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      
      // 对密码进行加密
      const encryptedPassword = encrypt(data.password);
      
      const response = await loginService({
        userId: data.userId,
        password: encryptedPassword, // 发送加密后的密码
      });

      // 保存记住我选项
      if (data.rememberMe) {
        localStorage.setItem('remembered_userId', data.userId);
      } else {
        localStorage.removeItem('remembered_userId');
      }

      // 保存登录信息（后端返回 api 格式：{ code, message, data: { token, userDTO } }）
      const token = response?.data?.token;
      const userInfo = response?.data?.userDTO;

      console.log('登录响应:', { token, userInfo });

      if (!token) {
        throw new Error('登录响应中缺少 token');
      }

      login(token, userInfo as any);
      
      // 验证token是否已保存
      const savedToken = localStorage.getItem('auth_token');
      console.log('Token已保存:', !!savedToken);
      
      message.success('登录成功');
      
      // 跳转到之前想访问的页面或默认页面
      const from = (location.state as any)?.from?.pathname || '/devices';
      console.log('准备跳转到:', from);
      
      // 使用 replace: true 替换当前历史记录，避免回退到登录页
      setTimeout(() => {
        navigate(from, { replace: true });
        setTimeout(() => {
          if (window.location.pathname === '/login') {
            console.warn('navigate未生效，使用强制跳转');
            window.location.href = from;
          }
        }, 300);
      }, 100);
    } catch (error: any) {
      console.error('登录失败:', error);
      const errorMessage = error?.message || error?.error || '登录失败，请检查用户名和密码';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" title="设备管理系统登录">
        <Spin spinning={loading}>
          {/* 使用原生form元素包装，避免Ant Design Form的类型冲突 */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Form.Item
              label="工号"
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
                    placeholder="请输入工号"
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
              <Button 
                type="primary" 
                htmlType="submit"
                block 
                size="large" 
                loading={loading}
              >
                登录
              </Button>
            </Form.Item>
          </form>
        </Spin>
      </Card>
    </div>
  );
};

export default Login;