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
  DISPLAY_ID: string;
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
  DISPLAY_ID: string;
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

// 安全检查记录（与后端DTO同步）
export interface SecurityCheck {
  samplingId: string;          // 主键
  reportId: string;            // 报告ID
  userId: string;              // 用户ID
  name: string;                // 用户名
  deviceId: string;            // 设备ID
  displayId: string;           // 显示器ID

  updateDate: string;          // 导出日期（LocalDate → string）
  updateTime: string;          // 更新时间（LocalDateTime → string）
  createTime: string;          // 创建时间（LocalDateTime → string）

  updater: string;             // 更新人
  creater: string;             // 创建人

  installedSoftware: boolean;  // 是否安装非法软件
  disposalMeasures: string;    // 处置措施
  screenSaverPwd: boolean;     // 屏保密码
  usbInterface: boolean;       // USB接口
  securityPatch: boolean;      // 安全补丁
  antivirusProtection: boolean;// 杀毒软件
  bootAuthentication: boolean; // 启动认证
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
