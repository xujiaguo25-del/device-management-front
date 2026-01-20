import React, { useState, useMemo, useCallback } from 'react';
import { Layout as AntLayout, Menu, Dropdown, Button, Avatar, Drawer, message } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DesktopOutlined,
  SecurityScanOutlined,
  KeyOutlined,
  LogoutOutlined,
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { logoutService } from '../../services/auth/authService';
import './Layout.css';

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'デバイス管理システム' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const navigate = useNavigate();
  const { userInfo, logout } = useAuthStore();

  const handleMenuClick = useCallback(
    (path: string) => {
      navigate(path);
      setMobileDrawerVisible(false);
    },
    [navigate]
  );

  // 管理者かどうかを判断する
  const isAdmin = userInfo?.USER_TYPE_NAME?.toUpperCase() === 'ADMIN';

  const menuItems = useMemo(() => {
    const baseItems = [
      {
        key: '/devices',
        icon: <DesktopOutlined />,
        label: 'デバイス管理',
        onClick: () => handleMenuClick('/devices'),
      },
      {
        key: '/permissions',
        icon: <KeyOutlined />,
        label: '権限管理',
        onClick: () => handleMenuClick('/permissions'),
      },
    ];

    // 管理者の場合、セキュリティチェック画面を表示します
    if (isAdmin) {
      baseItems.push({
        key: '/security-checks',
        icon: <SecurityScanOutlined />,
        label: '安全点検',
        onClick: () => handleMenuClick('/security-checks'),
      });
    }

    return baseItems;
  }, [handleMenuClick, isAdmin]);

  const handleLogout = useCallback(async () => {
    try {
      // バックエンドのログアウト API を呼び出す
      await logoutService();
      message.success('ログアウトしました');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('ログアウト失敗:', error);
      }
      // バックエンドのログアウトが失敗してもローカル状態はクリアする
    } finally {
      // ローカル状態をクリアし、ログイン画面へ遷移
      logout();
      navigate('/login');
    }
  }, [logout, navigate]);

  const userMenuItems = useMemo(
    () => [
      {
        key: 'change-password',
        icon: <LockOutlined />,
        label: 'パスワード変更',
        onClick: () => navigate('/change-password'),
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'ログアウト',
        onClick: handleLogout,
      },
    ],
    [navigate, handleLogout]
  );

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* デスクトップ用サイドバー */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="layout-sider"
      >
        <div className="logo" style={{ padding: '16px', textAlign: 'center', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
          {!collapsed && 'デバイス管理'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          style={{ marginTop: '16px' }}
        />
      </Sider>

      {/* モバイル用ドロワーメニュー */}
      <Drawer
        title="メニュー"
        placement="left"
        onClose={() => setMobileDrawerVisible(false)}
        open={mobileDrawerVisible}
        className="mobile-menu-drawer"
      >
        <Menu
          mode="vertical"
          items={menuItems}
        />
      </Drawer>

      <AntLayout>
        {/* Header */}
        <Header className="layout-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="desktop-toggle"
          />
          
          <Button
            type="text"
            icon={<MenuUnfoldOutlined />}
            onClick={() => setMobileDrawerVisible(true)}
            className="mobile-toggle"
          />

          <div style={{ flex: 1, marginLeft: '16px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{title}</span>
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text">
              <Avatar icon={<UserOutlined />} />
              <span style={{ marginLeft: '8px' }}>
                {userInfo?.NAME || 'ユーザー'}
              </span>
            </Button>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content className="layout-content">
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
