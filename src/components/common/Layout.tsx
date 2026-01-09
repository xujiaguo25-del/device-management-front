import React, { useState } from 'react';
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

const Layout: React.FC<LayoutProps> = ({ children, title = '设备管理系统' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const navigate = useNavigate();
  const { userInfo, logout } = useAuthStore();

  const menuItems = [
    {
      key: '/devices',
      icon: <DesktopOutlined />,
      label: '设备管理',
      onClick: () => {
        navigate('/devices');
        setMobileDrawerVisible(false);
      },
    },
    {
      key: '/permissions',
      icon: <KeyOutlined />,
      label: '权限管理',
      onClick: () => {
        navigate('/permissions');
        setMobileDrawerVisible(false);
      },
    },
    {
      key: '/security-checks',
      icon: <SecurityScanOutlined />,
      label: '安全检查',
      onClick: () => {
        navigate('/security-checks');
        setMobileDrawerVisible(false);
      },
    },
  ];

  const userMenuItems = [
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: '修改密码',
      onClick: () => navigate('/change-password'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
      onClick: async () => {
        try {
          // 调用后端登出接口
          await logoutService();
          message.success('已登出');
        } catch (error) {
          console.error('登出失败:', error);
          // 即使后端登出失败，也清除本地状态
        } finally {
          // 清除本地状态并跳转到登录页
          logout();
          navigate('/login');
        }
      },
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* 桌面端侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="layout-sider"
      >
        <div className="logo" style={{ padding: '16px', textAlign: 'center', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
          {!collapsed && '设备管理'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          style={{ marginTop: '16px' }}
        />
      </Sider>

      {/* 移动端抽屉菜单 */}
      <Drawer
        title="菜单"
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
                {userInfo?.NAME || '用户'}
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
