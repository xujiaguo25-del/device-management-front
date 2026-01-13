export interface Device {
  deviceId: string; // 设备ID
  deviceModel: string; // 设备型号
  computerName: string; // 计算机名
  loginUsername: string; // 登录用户名
  project: string; // 所属项目
  devRoom: string; // 所属开发室
  userId: string; // 用户ID
  remark: string; // 备注
  selfConfirmId: number; // 本人确认ID
  osId: number; // 操作系统ID
  memoryId: number; // 内存ID
  ssdId: number; // SSD ID
  hddId: number; // HDD ID
  
  // 字典关联字段
  selfConfirmDict?: Dict; // 本人确认状态
  osDict?: Dict; // 操作系统
  memoryDict?: Dict; // 内存
  ssdDict?: Dict; // SSD
  hddDict?: Dict; // HDD
  
  createTime: string; // 创建时间
  creater: string; // 创建者
  updateTime: string; // 更新时间
  updater: string; // 更新者
  
  // 关联实体
  user?: User; // 用户
  deviceIps?: DeviceIp[]; // IP地址列表
  monitorInfos?: Monitor[]; // 显示器信息
}

export interface DeviceIp {
  ipId: number; // IP ID
  ipAddress: string; // IP地址
  deviceId: string; // 设备ID
  device?: Device; // 设备
  createTime: string; // 创建时间
  creater: string; // 创建者
  updateTime: string; // 更新时间
  updater: string; // 更新者
}

export interface Dict {
  dictId: number; // 字典ID
  dictTypeCode: string; // 字典类型代码
  dictTypeName: string; // 字典类型名称
  dictTypeDescription: string; // 字典类型描述
  dictItemName: string; // 字典项名称
  sort: number; // 排序
  isEnabled: number; // 是否启用 (0=禁用, 1=启用)
  createTime: string; // 创建时间
  creater: string; // 创建者
  updateTime: string; // 更新时间
  updater: string; // 更新者
}

// 字典类型枚举
// 替代枚举，使用对象常量
export const DictTypeCode = {
  CONFIRM_STATUS: 'CONFIRM_STATUS',
  OS_TYPE: 'OS_TYPE',
  MEMORY_SIZE: 'MEMORY_SIZE',
  SSD_SIZE: 'SSD_SIZE',
  HDD_SIZE: 'HDD_SIZE',
  DOMAIN_STATUS: 'DOMAIN_STATUS',
  SMARTIT_STATUS: 'SMARTIT_STATUS',
  USB_STATUS: 'USB_STATUS',
  ANTIVIRUS_STATUS: 'ANTIVIRUS_STATUS',
  USER_TYPE: 'USER_TYPE',
} as const;

// 导出类型
export type DictTypeCode = typeof DictTypeCode[keyof typeof DictTypeCode];

export interface Monitor {
  monitorId: number; // 显示器ID
  monitorName: string; // 显示器名称
  deviceId: string; // 设备ID
  device?: Device; // 设备
  createTime: string; // 创建时间
  creater: string; // 创建者
  updateTime: string; // 更新时间
  updater: string; // 更新者
}

export interface SamplingCheck {
  samplingId: string; // 采样检查ID
  installedSoftware: boolean; // 是否安装软件
  disposalMeasures: string; // 处理措施
  name: string; // 姓名
  reportId: string; // 报告ID
  updateDate: string; // 更新日期
  screenSaverPwd: boolean; // 屏幕保护密码
  usbInterface: boolean; // USB接口状态
  securityPatch: boolean; // 安全补丁
  antivirusProtection: boolean; // 杀毒软件防护
  bootAuthentication: boolean; // 启动认证
  createTime: string; // 创建时间
  creater: string; // 创建者
  updateTime: string; // 更新时间
  updater: string; // 更新者
  
  device?: Device; // 设备
  deviceId: string; // 设备ID
  user?: User; // 用户
  userId: string; // 用户ID
}

export interface User {
  userId: string; // 用户ID
  deptId: string; // 部门ID
  name: string; // 姓名
  userTypeId: number; // 用户类型ID
  userTypeDict?: Dict; // 用户类型字典
  password: string; // 密码
  createTime: string; // 创建时间
  creater: string; // 创建者
  updateTime: string; // 更新时间
  updater: string; // 更新者
  
  devices?: Device[]; // 设备列表
  samplingChecks?: SamplingCheck[]; // 采样检查列表
}