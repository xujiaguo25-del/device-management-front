import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import './App.css';

// 页面组件
import Login from './pages/Login';
import PasswordUpdate from './pages/PasswordUpdate';
import DeviceManagement from './pages/DeviceManagement';
import DevicePermissions from './pages/DevicePermissions';
import SecurityChecks from './pages/security-checks/SecurityChecks';

// 路由保护组件
import ProtectedRoute from './components/ProtectedRoute';

// 配置dayjs中文
dayjs.locale('zh-cn');

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={<Login />} />

          {/* 受保护的路由 */}
          <Route
            path="/change-password"
            element={<ProtectedRoute component={PasswordUpdate} />}
          />
          <Route
            path="/devices"
            element={<ProtectedRoute component={DeviceManagement} />}
          />
          <Route
            path="/permissions"
            element={<ProtectedRoute component={DevicePermissions} />}
          />
          <Route
            path="/security-checks"
            element={<ProtectedRoute component={SecurityChecks} />}
          />

          {/* 默认重定向 */}
          <Route path="/" element={<Navigate to="/devices" replace />} />
          <Route path="*" element={<Navigate to="/devices" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
