# 设备管理系统前端

基于 React + TypeScript + Vite 的设备管理系统前端应用

## 项目特性

- ✨ 使用 React 18 + TypeScript 实现
- 🎨 Ant Design 组件库
- 📦 Vite 构建工具
- 🔐 JWT 认证和路由保护
- 🎯 Zustand 状态管理
- 📋 React Hook Form 表单管理
- 📊 Excel 导出功能
- 📱 响应式设计

## 技术栈

### 核心依赖
- **React 18**: UI 框架
- **React Router v6**: 路由管理
- **TypeScript**: 类型安全
- **Vite**: 现代构建工具
- **Ant Design v5**: UI 组件库
- **React Hook Form**: 表单管理和验证
- **Zustand**: 轻量级状态管理
- **Axios/Fetch API**: HTTP 请求
- **XLSX**: Excel 导出
- **Dayjs**: 日期处理

## 项目结构

```
src/
├── components/          # React 组件
│   ├── common/         # 通用组件 (Layout, Header, etc)
│   ├── forms/          # 表单组件
│   ├── tables/         # 表格组件
│   └── ProtectedRoute.tsx  # 路由保护
├── pages/              # 页面组件
│   ├── Login.tsx       # 登录页面
│   ├── PasswordUpdate.tsx   # 密码修改页面
│   ├── DeviceManagement.tsx # 设备管理页面
│   ├── DevicePermissions.tsx # 权限管理页面
│   └── SecurityChecks.tsx    # 安全检查页面
├── services/           # API 服务
│   ├── api/           # API 请求
│   ├── auth/          # 认证服务
│   └── export/        # 导出服务
├── stores/             # Zustand 状态管理
│   ├── authStore.ts   # 认证状态
│   └── deviceStore.ts # 设备状态
├── hooks/              # 自定义 hooks
│   └── useAuth.ts     # 认证 hook
├── utils/              # 工具函数
│   └── validators.ts  # 验证工具
├── types/              # TypeScript 类型定义
│   └── index.ts
├── App.tsx            # 应用入口
├── main.tsx           # 主入口
└── index.css          # 全局样式
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 在浏览器中打开应用。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 功能说明

### 1. 登录页面 (Login)
- 用户ID和密码输入
- 记住用户功能
- JWT token 持久化
- 错误提示

**演示账户**: 
- 用户ID: admin
- 密码: password123

### 2. 密码修改页面 (PasswordUpdate)
- 修改当前用户密码
- 密码强度验证（至少8位，包含字母和数字）
- 密码确认验证

### 3. 设备管理页面 (DeviceManagement)
- 设备列表展示（分页、排序）
- 搜索和筛选功能
- 新增/编辑/删除设备
- Excel 导出

**表格字段**:
- 设备ID、工号、主机编号、电脑名、IP 地址
- 操作系统、内存、硬盘、项目、开发室
- 确认状态、创建时间、操作

### 4. 权限管理页面 (DevicePermissions)
- 权限列表展示
- SmartIT 状态管理
- USB 权限管理
- 域权限管理
- Excel 导出

**表格字段**:
- 权限ID、设备ID、用户ID
- SmartIT 状态、USB 状态、连接状态
- Domain 名、Domain 组、创建时间、操作

### 5. 安全检查页面 (SecurityChecks)
- 检查记录列表
- 检查结果统计
- 新增检查记录
- 检查项目管理
- Excel 导出

**检查项目**:
- 开机认证、密码屏保、安装软件
- 安全补丁、病毒防护、USB 接口

## API 集成

所有 API 调用已注释掉，使用假数据进行演示。要启用真实 API：

### 1. 修改 .env 文件

```env
VITE_API_BASE_URL=http://your-api-server:8080/api
```

### 2. 在服务文件中启用 API 调用

在各服务文件中找到注释掉的 API 调用，取消注释即可使用真实 API。

## 认证流程

1. 用户在登录页输入用户ID和密码
2. 提交表单后调用认证服务
3. 获得 JWT token 和用户信息
4. Token 存储在 localStorage 中
5. 后续请求自动在 Authorization header 中携带 token
6. Token 过期时自动重定向到登录页

## 状态管理

### AuthStore (Zustand)
- 管理用户认证状态
- 管理 JWT token
- 用户信息存储
- 错误状态管理

### DeviceStore (Zustand)
- 设备列表状态
- 权限列表状态
- 安全检查状态
- 加载状态管理

## 开发和构建

### 开发模式
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 浏览器兼容性

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 许可证

MIT License
