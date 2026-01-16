import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import jaJP from 'antd/locale/ja_JP';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import './App.css';

// ページコンポーネント
import Login from './pages/Login';
import PasswordUpdate from './pages/PasswordUpdate';
import DeviceManagement from './pages/DeviceManagement';
import DevicePermissions from './pages/DevicePermissions';
import SecurityChecks from './pages/security-checks/SecurityChecks';

// ルート保護コンポーネント
import ProtectedRoute from './components/ProtectedRoute';

// dayjs を日本語ロケールに設定
dayjs.locale('ja');

const App: React.FC = () => {
  return (
    <ConfigProvider locale={jaJP}>
      <Router>
        <Routes>
          {/* 公開ルート */}
          <Route path="/login" element={<Login />} />

          {/* 保護されたルート */}
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

          {/* デフォルトリダイレクト */}
          <Route path="/" element={<Navigate to="/devices" replace />} />
          <Route path="*" element={<Navigate to="/devices" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
