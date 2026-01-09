/**
 * 类型定义
 */

// 用户信息
export interface UserInfo {
  USER_ID: string;
  DEPT_ID: string;
  NAME: string;
  USER_TYPE_NAME: string;
}

// 登录请求/响应
export interface LoginRequest {
  userId: string;
  password: string;
}

export interface LoginResponse {
  code: number;
  message: string;
  data: {
    token: string;
    userDTO: UserInfo;
  };
}

// 密码更改请求
export interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

// 设备信息
export interface Device {
  DEVICE_ID: number;
  USER_ID: string;
  COMPUTER_ID: string;
  MONITER_ID: string;
  COMPUTER_MODEL: string;
  COMPUTER_NAME: string;
  IP: string;
  OS: string;
  MEMORY_SIZE: number;
  SSD_SIZE: number;
  HDD_SIZE: number;
  LOGIN_USER: string;
  PROJECT_NAME: string;
  DEVELOPMENT_ROOM: string;
  COMMET: string;
  IS_ACTIVE: string;
  CREATED_DATE: string;
  CREATED_USER: string;
  UPDATED_DATE: string;
  UPDATED_USER: string;
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
