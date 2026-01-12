export interface DeviceListItem {
  key: string; // 用于表格的key
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
  
  // 状态标签（用于前端展示）
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
export interface DeviceResponse {
  code: number; // 响应码
  message: string; // 响应消息
  data: {
    list: DeviceListItem[]; // 设备列表
    total: number; // 总数量
    page: number; // 当前页码
    pageSize: number; // 每页大小
  };
}