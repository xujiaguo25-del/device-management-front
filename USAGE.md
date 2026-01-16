# 设备管理系统前端 - 快速使用指南

## 项目已成功创建！

该项目已完全按照您的要求构建，包括：

### ✅ 已完成的功能

1. **完整的项目结构**
   - 清晰的文件夹组织
   - 类型定义和接口
   - 服务层分离
   - 状态管理集成

2. **5个主要页面**
   - ✅ 登录页面 (`Login.tsx`)
   - ✅ 密码修改页面 (`PasswordUpdate.tsx`)
   - ✅ 设备管理页面 (`DeviceManagement.tsx`)
   - ✅ 权限管理页面 (`DevicePermissions.tsx`)
   - ✅ 安全检查页面 (`SecurityChecks.tsx`)

3. **核心功能**
   - ✅ JWT 认证和路由保护
   - ✅ Zustand 状态管理
   - ✅ React Hook Form 表单验证
   - ✅ Excel 导出功能
   - ✅ 表格分页、排序、筛选
   - ✅ 响应式设计
   - ✅ 加载状态管理
   - ✅ 错误处理

### 📱 演示账户

- **工号**: admin
- **密码**: password123

### 🚀 开发中的应用说明

应用已启动在 `http://localhost:5174`

#### 使用演示账户登录

1. 打开 http://localhost:5174
2. 输入工号: **admin**
3. 输入密码: **password123**
4. 点击"登录"

#### 功能演示

登录后，您可以体验：

1. **设备管理**
   - 查看设备列表
   - 搜索和筛选设备
   - 新增/编辑/删除设备
   - 导出设备列表为Excel

2. **权限管理**
   - 管理设备使用权限
   - 配置 SmartIT、USB、Domain 等设置
   - 导出权限列表

3. **安全检查**
   - 查看检查记录
   - 创建新的检查记录
   - 查看检查统计信息
   - 导出检查记录

4. **密码修改**
   - 在用户菜单中选择"修改密码"
   - 密码需要至少8位，包含字母和数字

### 🔌 API 集成

目前应用使用**假数据**进行演示。要连接真实的后端 API：

#### 步骤 1: 修改环境变量

编辑 `.env` 文件：

```env
VITE_API_BASE_URL=http://your-backend-server:8080/api
```

#### 步骤 2: 启用 API 调用

在以下文件中取消注释 API 调用代码：

- `src/services/auth/authService.ts` - 登录、修改密码
- `src/services/api/deviceService.ts` - 设备、权限、检查数据

**示例：在 `src/services/auth/authService.ts` 中**

```typescript
// 取消注释这行
return post('/auth/login', loginData);

// 注释掉假数据部分
```

#### 步骤 3: 重启开发服务器

```bash
npm run dev
```

### 📋 项目文件结构说明

```
src/
├── components/
│   ├── common/Layout.tsx         # 主布局组件
│   ├── forms/                    # 表单组件
│   │   ├── DeviceForm.tsx       # 设备表单
│   │   ├── PermissionForm.tsx   # 权限表单
│   │   └── SecurityCheckForm.tsx # 安全检查表单
│   ├── ProtectedRoute.tsx        # 路由保护
│   └── ProtectedRoute.tsx        # 认证路由
├── pages/
│   ├── Login.tsx                # 登录页
│   ├── PasswordUpdate.tsx        # 密码修改页
│   ├── DeviceManagement.tsx      # 设备管理页
│   ├── DevicePermissions.tsx     # 权限管理页
│   └── SecurityChecks.tsx        # 安全检查页
├── services/
│   ├── api/
│   │   ├── index.ts             # API 基础请求
│   │   └── deviceService.ts     # 设备 API
│   ├── auth/authService.ts      # 认证服务
│   └── export/excelService.ts   # Excel 导出
├── stores/
│   ├── authStore.ts             # 认证状态
│   └── deviceStore.ts           # 设备状态
├── hooks/useAuth.ts             # 认证 hooks
├── types/index.ts               # TypeScript 类型定义
├── utils/validators.ts          # 验证工具
├── App.tsx                       # 应用主入口
└── main.tsx                      # 页面入口
```

### 🔑 主要技术细节

#### JWT 认证流程

1. 用户登录输入工号和密码
2. 调用 `/api/auth/login` 获得 token
3. Token 存储在 localStorage
4. 后续请求自动在 Authorization header 中携带 token
5. Token 过期时自动重定向到登录页

#### 状态管理

- **AuthStore**: 管理用户登录状态、token、用户信息
- **DeviceStore**: 管理设备、权限、检查记录的加载状态

#### 表单验证

- 密码强度: 至少8位，包含字母和数字
- IP 地址: 有效的 IPv4 格式
- 必填字段验证
- 实时错误提示

#### 响应式设计

- 桌面: 完整侧边栏导航
- 移动端: 抽屉菜单导航
- 表格: 支持水平滚动

### 🛠 常用命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 📝 自定义配置

#### 修改 API 基础 URL

编辑 `.env`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

#### 修改主题色

在 `src/App.tsx` 中的 `ConfigProvider` 中修改主题：

```tsx
<ConfigProvider
  locale={zhCN}
  theme={{
    token: {
      colorPrimary: '#1890ff',
    },
  }}
>
```

#### 添加新页面

1. 在 `src/pages` 中创建新组件
2. 在 `src/App.tsx` 中添加路由
3. 在 Layout 中添加菜单项

### 🐛 调试技巧

#### 查看网络请求

打开浏览器开发者工具 (F12) → Network 标签

#### 查看状态值

使用 React DevTools 浏览器扩展检查 Zustand 状态

#### 查看错误日志

打开浏览器控制台 (F12 → Console)

### 📚 相关资源

- [React 文档](https://react.dev)
- [Ant Design 文档](https://ant.design)
- [React Hook Form 文档](https://react-hook-form.com)
- [Zustand 文档](https://github.com/pmndrs/zustand)
- [TypeScript 文档](https://www.typescriptlang.org)

### ⚠️ 重要提示

1. **首次使用**: 确保 npm 依赖已安装 (`npm install`)
2. **端口冲突**: 如果 5173/5174 被占用，Vite 会自动使用其他端口
3. **HTTPS**: 生产环境建议使用 HTTPS
4. **CORS**: 如果连接后端时遇到 CORS 错误，后端需要配置 CORS 中间件

### 📞 支持

- 查看 [README.md](./README.md) 获取详细文档
- 检查 TypeScript 错误: `npm run build`
- 清理缓存: 删除 `node_modules` 和 `dist` 文件夹，重新 `npm install`

---

**项目已准备完毕，祝您开发愉快！** 🎉
