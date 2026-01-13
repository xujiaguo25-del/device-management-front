// types/device.ts

// 设备基本信息 (对应 DeviceDTO)
export interface DeviceDTO {
  deviceId: string;
  deviceModel: string;
  computerName: string;
  loginUsername: string;
  project: string;
  devRoom: string;
  userId: string;
  remark: string;
  selfConfirmId: number;
  osId: number;
  memoryId: number;
  ssdId: number;
  hddId: number;
  createTime: string;
  creater: string;
  updateTime: string;
  updater: string;
}

// 完整设备信息 (对应 DeviceFullDTO)
export interface DeviceFullDTO {
  // device 信息
  deviceId: string;
  deviceModel: string;
  computerName: string;
  loginUsername: string;
  project: string;
  devRoom: string;
  userId: string;
  remark: string;
  selfConfirmId: number;
  osId: number;
  memoryId: number;
  ssdId: number;
  hddId: number;
  creater: string;
  updater: string;
  
  // monitor 列表
  monitors: MonitorDTO[];
  
  // ip 地址列表
  ipAddresses: DeviceIpDTO[];
  
  // user 信息
  name: string;
  deptId: string;
}

// IP地址信息 (对应 DeviceIpDTO)
export interface DeviceIpDTO {
  ipId?: number;
  ipAddress: string;
  deviceId: string;
  createTime?: string;
  creater?: string;
  updateTime?: string;
  updater?: string;
}

// 显示器信息 (对应 MonitorDTO)
export interface MonitorDTO {
  monitorId?: number;
  monitorName: string;
  deviceId: string;
  createTime?: string;
  creater?: string;
  updateTime?: string;
  updater?: string;
}

// 查询参数
export interface DeviceQueryParams {
  deviceName?: string;
  userId?: string;
  userName?: string;
  project?: string;
  devRoom?: string;
  page?: number;
  size?: number;
}

// 分页响应
export interface PageResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// 表格数据类型
export interface DeviceTableData {
  key: string;
  deviceId: string;
  deviceModel: string;
  computerName: string;
  loginUsername: string;
  project: string;
  devRoom: string;
  userId: string;
  userName?: string;
  deptId?: string;
  remark: string;
  selfConfirmId: number;
  selfConfirmStatus?: string;
  osId: number;
  memoryId: number;
  ssdId: number;
  hddId: number;
  ipCount: number;
  monitorCount: number;
  ipAddresses: string;
  monitorNames: string;
  hardwareSummary: string;
  status: string;
  tags: string[];
  createTime: string;
  creater: string;
  updateTime: string;
  updater: string;
}

// 字典项
export interface DictItem {
  dictId: number;
  dictType: string;
  dictItemCode: string;
  dictItemName: string;
  sortOrder: number;
  remark?: string;
}

// 用户信息
export interface UserInfo {
  userId: string;
  name: string;
  deptId: string;
  userName?: string;
}