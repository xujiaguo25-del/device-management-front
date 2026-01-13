import React, { useState, useEffect } from 'react';
import { Form, Button, Checkbox, Row, Col, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { loginService } from '../services/auth/authService';
import { encrypt } from '../utils/crypto';
import FormField from '../components/forms/FormField';
import FormContainer from '../components/forms/FormContainer';
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

  // 既にログインしている場合、直前にアクセスしようとしたページ（またはデフォルト）へ自動遷移
  useEffect(() => {
    if (token) {
      const from = (location.state as any)?.from?.pathname || '/devices';
      navigate(from, { replace: true });
    }
  }, [token, navigate, location]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      
      // パスワードを暗号化
      const encryptedPassword = encrypt(data.password);
      
      const response = await loginService({
        userId: data.userId,
        password: encryptedPassword, // 暗号化したパスワードを送信
      });

      // 「ログインを記憶する」を保存
      if (data.rememberMe) {
        localStorage.setItem('remembered_userId', data.userId);
      } else {
        localStorage.removeItem('remembered_userId');
      }

      // ログイン情報を保存（バックエンドの api 形式：{ code, message, data: { token, userDTO } }）
      const token = response?.data?.token;
      const userInfo = response?.data?.userDTO;

      console.log('ログイン応答:', { token, userInfo });

      if (!token) {
        throw new Error('ログイン応答に token がありません');
      }

      login(token, userInfo as any);
      
      // token が保存されているか確認
      const savedToken = localStorage.getItem('auth_token');
      console.log('Token 保存済み:', !!savedToken);
      
      message.success('ログインに成功しました');
      
      // 直前にアクセスしようとしたページ（またはデフォルト）へ遷移
      const from = (location.state as any)?.from?.pathname || '/devices';
      console.log('遷移先:', from);
      
      // replace: true で履歴を置換し、戻る操作でログイン画面に戻らないようにする
      setTimeout(() => {
        navigate(from, { replace: true });
        setTimeout(() => {
          if (window.location.pathname === '/login') {
            console.warn('navigate が反映されないため強制遷移します');
            window.location.href = from;
          }
        }, 300);
      }, 100);
    } catch (error: any) {
      console.error('ログイン失敗:', error);
      const errorMessage = error?.message || error?.error || 'ログインに失敗しました。ユーザーIDとパスワードをご確認ください';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <FormContainer
        loading={loading}
        title="デバイス管理システム"
        maxWidth="450px"
        padding="24px"
      >
        {/* ネイティブの form 要素でラップし、Ant Design Form の型衝突を回避 */}
        <form onSubmit={handleSubmit(onSubmit)}>
            <FormField
              name="userId"
              control={control as any}
              type="text"
              prefix={<UserOutlined />}
              placeholder="社員番号を入力してください"
              error={errors.userId}
              required
            />

            <FormField
              name="password"
              control={control as any}
              type="password"
              prefix={<LockOutlined />}
              placeholder="パスワードを入力してください"
              error={errors.password}
              required
            />

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
                        ログインを記憶する
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
                ログイン
              </Button>
            </Form.Item>
        </form>
      </FormContainer>
    </div>
  );
};

export default Login;