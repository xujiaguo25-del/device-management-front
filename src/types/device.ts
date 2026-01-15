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
  confirmStatus?: string; // 状态
  createTimeStart?: string; // 创建时间开始
  createTimeEnd?: string; // 创建时间结束
}

// 设备响应接口
export interface DeviceApiResponse<T> {
  code: number; // 响应码
  message: string; // 响应消息
  // 通用返回体：有时 data 为对象（单条），有时为分页对象/列表
  data: T | {
    list: T[];
    total?: number | null;
    page?: number | null;
    pageSize?: number | null;
  } | null;
  total?: number | null;
  page?: number | null;
  size?: number | null;
}

// 承接后端返回所有参数
export interface DeviceListItem {
  userName?: string | null; // 用户名
  deptId?: string | null;
  deviceId: string; // 设备ID
  deviceModel?: string | null;  // 设备型号
  computerName?: string | null; // 计算机名
  loginUsername?: string | null;// 登录用户名
  project?: string | null;// 项目
  devRoom?: string | null;// 开发室
  userId?: string | null;// 用户ID
  remark?: string | null; // 备注
  selfConfirmId?: number | null;
  osId?: number | null;
  memoryId?: number | null;
  ssdId?: number | null;
  hddId?: number | null;
  createTime?: string | null;
  creater?: string | null;
  updateTime?: string | null;
  updater?: string | null;
  monitors?: Monitor[] | null;
  deviceIps?: DeviceIp[] | null;
  // 字典值
  confirmStatus: string; // 本人确认状态
  osName: string; // 操作系统
  memorySize: string; // 内存大小
  ssdSize: string; // SSD大小
  hddSize: string; // HDD大小
}

// 设备 IP 实体
export interface DeviceIp {
  ipId?: number;
  ipAddress: string;
  deviceId?: string;
  createTime?: string | null;
  creater?: string | null;
  updateTime?: string | null;
  updater?: string | null;
}

// 显示器实体
export interface Monitor {
  monitorId?: number;
  monitorName: string;
  deviceId?: string;
  createTime?: string | null;
  creater?: string | null;
  updateTime?: string | null;
  updater?: string | null;
}

// 定义 API 响应类型
export interface ApiResponse<T = any> {
  code: number;
  message?: string;
  data: T;
}

export interface DictResponseData {
  [key: string]: Array<{
    dictId: number;
    dictItemName: string;
    [key: string]: any;
  }>;
}

export interface DeviceListResponseData {
  list: DeviceListItem[];
  total?: number;
  page?: number;
  pageSize?: number;
}