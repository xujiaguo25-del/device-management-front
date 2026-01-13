/**
 * 型定義
 */

// ユーザー情報
export interface UserInfo {
  USER_ID: string;
  DEPT_ID: string;
  NAME: string;
  USER_TYPE_NAME: string;
}

// ログイン（リクエスト/レスポンス）
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

// パスワード変更リクエスト
export interface ChangePasswordRequest {
  userId: string;
  currentPassword?: string; // 管理者が他のユーザーのパスワードを変更する場合は不要
  newPassword: string;
}

// デバイス情報
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

// デバイス利用権限
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

// セキュリティチェック記録
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

// 認証状態
export interface AuthState {
  token: string | null;
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: string | null;
}

// ページングパラメータ
export interface PaginationParams {
  page: number;
  size: number;
  [key: string]: any;
}

// リストレスポンス
export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
}

// Dict types 
export interface DictItem {
  dictId: number;
  dictItemName: string;
  sort: number;
}

export interface DictTypeGroup {
  typeCode: string;
  items: DictItem[];
}

export interface DictSuccessResponse {
  code: number;
  message: string;
  data: DictTypeGroup[];
  total: number | null;
  page: number | null;
  size: number | null;
}
