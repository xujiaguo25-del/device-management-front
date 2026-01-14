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

// 设备使用权限列表DTO（匹配后端PermissionsListDTO）
export interface DevicePermissionList {
  permissionId: string;
  deviceId: string;
  monitorNames: string[];
  computerName: string;
  ipAddress: string[];
  userId: string;
  name: string;
  deptId: string;
  loginUsername: string;
  domainStatusId: number;
  domainStatusName?: string;
  domainGroup: string;
  noDomainReason: string;
  smartitStatusId: number;
  smartitStatusName?: string; // 存储文本值：本地、远程、未安装
  noSmartitReason: string;
  usbStatusId: number;
  usbStatusName?: string; // 存储文本值：关闭、数据、3G网卡
  usbReason: string;
  usbExpireDate: string | null;
  antivirusStatusId: number;
  antivirusStatusName?: string; // 存储文本值：自动、手动
  noSymantecReason: string;
  remark: string;
  createTime: string;
  creater: string;
  updateTime: string;
  updater: string;
}

// 设备使用权限插入DTO（匹配后端PermissionInsertDTO）
export interface DevicePermissionInsert {
  permissionId?: string;
  deviceId: string;
  domainStatusId?: number | null;
  domainStatusName?: string;
  domainGroup?: string;
  noDomainReason?: string;
  smartitStatusId?: number | null;
  smartitStatusName?: string; // 存储文本值：本地、远程、未安装
  noSmartitReason?: string;
  usbStatusId?: number | null;
  usbStatusName?: string; // 存储文本值：关闭、数据、3G网卡
  usbReason?: string;
  usbExpireDate?: string | null;
  antivirusStatusId?: number | null;
  antivirusStatusName?: string; // 存储文本值：自动、手动
  noSymantecReason?: string;
  remark?: string;
  createTime?: string;
  creater?: string;
  updateTime?: string;
  updater?: string;
}

// API响应结构（匹配后端ApiResponse）
export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
  total?: number;
  page?: number;
  size?: number;
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
