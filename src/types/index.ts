/**
 * 类型定义
 */

// 用户信息
export interface UserInfo {
  USER_ID: string;
  USER_NAME: string;
  DEPARTMENT_CODE: string;
  USER_LEVEL: string;
  CREATED_DATE: string;
  UPDATED_DATE: string;
}

// 登录请求/响应
export interface LoginRequest {
  userId: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userInfo: UserInfo;
}

// 密码更改请求
export interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

// 设备信息
export interface DeviceListItem {
  deviceId: string; // 设备ID
  deviceModel: string; // 设备型号
  computerName: string; // 计算机名
  loginUsername: string; // 登录用户名
  project: string; // 项目
  devRoom: string; // 开发室
  userId: string; // 用户ID
  userName?: string; // 用户名
  remark: string; // 备注
  
  // 字典值
  confirmStatus?: string; // 本人确认状态
  osName?: string; // 操作系统
  memorySize?: string; // 内存大小
  ssdSize?: string; // SSD大小
  hddSize?: string; // HDD大小
  
  // IP和显示器信息
  ipAddresses?: string[]; // IP地址列表
  monitors?: string[]; // 显示器列表
  // 状态标签,用于前端展示
  tags: string[]; // 状态标签，如 ['已确认', '未确认']
}
// 设备查询参数接口
export interface DeviceQueryParams {
  page?: number; // 当前页码
  pageSize?: number; // 每页大小
  deviceId?: string; // 设备ID
  computerName?: string; // 计算机名
  loginUsername?: string; // 登录用户名
  userId?: string; // 用户ID
  project?: string; // 项目
  devRoom?: string; // 开发室
  status?: string; // 状态
  createTimeStart?: string; // 创建时间开始
  createTimeEnd?: string; // 创建时间结束
}

// 设备响应接口
export interface DeviceApiResponse<T> {
  code: number; // 响应码
  message: string; // 响应消息
  data: {
    list: T[]; // 设备列表
    total: number; // 总数量
    page: number; // 当前页码
    pageSize: number; // 每页大小
  };
}
// 设备使用权限
export interface DevicePermission {
  ID: number;
  DEVICE_ID: number;
  USER_ID: string;
  SMARTIT_STATUS: string;
  NO_SMARTIT_REASON: string;
  USB_STATUS: string;
  USB_OPEN_REASON: string;
  USB_OPEN_ENDDATE: string;
  CONNECTION_STATUS: string;
  NO_SYMENTEC_REASON: string;
  DOMAIN_NAME: string;
  DOMAIN_GROUP: string;
  NO_DOMAIN_REASON: string;
  COMMET: string;
  CREATED_DATE: string;
  CREATED_USER: string;
  UPDATED_DATE: string;
  UPDATED_USER: string;
}

// 安全检查记录
export interface SecurityCheck {
  CHECK_ID: number;
  DEVICE_ID: number;
  USER_ID: string;
  BOOT_AUTH: string;
  PASSWORD_SCREEN: string;
  INSTALLED_SOFTWARE: string;
  SECURITY_PATCH: string;
  VIRUS_PROTECTION: string;
  USB_PORT: string;
  HANDLING_MEASURES: string;
  CREATED_DATE: string;
  CREATED_USER: string;
  UPDATED_DATE: string;
  UPDATED_USER: string;
}

// 认证状态
export interface AuthState {
  token: string | null;
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: string | null;
}

// 分页参数
export interface PaginationParams {
  page: number;
  size: number;
  [key: string]: any;
}

// 列表响应
export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
}
