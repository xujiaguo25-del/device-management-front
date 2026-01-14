// services/device/DeviceFormService.ts
import type { DeviceListItem } from '../../types/device';

// 模拟数据 - 作为表单的数据源
const mockDeviceDataForForm: DeviceListItem[] = [];

// 获取字典数据（用于表单模态框）
export const fetchDictData = async (): Promise<Record<string, any[]>> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    CONFIRM_STATUS: [
      { dictId: 1, dictItemName: '已确认' },
      { dictId: 0, dictItemName: '未确认' }
    ],
    OS_TYPE: [
      { dictId: 1, dictItemName: 'Windows 11' },
      { dictId: 2, dictItemName: 'Windows 10' },
      { dictId: 3, dictItemName: 'Mac OS' },
      { dictId: 4, dictItemName: 'Linux' }
    ],
    MEMORY_SIZE: [
      { dictId: 8, dictItemName: '8G' },
      { dictId: 16, dictItemName: '16G' },
      { dictId: 32, dictItemName: '32G' },
      { dictId: 64, dictItemName: '64G' }
    ],
    SSD_SIZE: [
      { dictId: 256, dictItemName: '256G' },
      { dictId: 512, dictItemName: '512G' },
      { dictId: 1024, dictItemName: '1T' },
      { dictId: 2048, dictItemName: '2T' }
    ],
    HDD_SIZE: [
      { dictId: 512, dictItemName: '512G' },
      { dictId: 1024, dictItemName: '1T' },
      { dictId: 2048, dictItemName: '2T' },
      { dictId: 4096, dictItemName: '4T' }
    ]
  };
};

// 获取用户列表（用于表单选择）
export const fetchUsers = async (): Promise<Array<{userId: string, name: string}>> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // 模拟用户数据
  const users = [
    { userId: 'JS0010', name: '小娟' },
    { userId: 'JS0011', name: '张三' },
    { userId: 'JS0012', name: '李四' },
    { userId: 'JS0013', name: '王五' },
    { userId: 'JS0014', name: '李松' },
    { userId: 'JS0015', name: '李雪' },
    { userId: 'JS0016', name: '韩海峰' },
    { userId: 'JS0017', name: '小红' },
    { userId: 'JS0018', name: '小芳' },
    { userId: 'JS0019', name: '小李' },
    { userId: 'JS0020', name: '老丁' },
    { userId: 'JS0021', name: '老张' },
    { userId: 'JS0022', name: '老刘' },
    { userId: 'JS0023', name: '新用户1' },
    { userId: 'JS0024', name: '新用户2' },
    { userId: 'JS0025', name: '新用户3' }
  ];
  
  return users;
};

// 保存设备（添加或更新）
export const saveDevice = async (deviceData: DeviceListItem): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockDeviceDataForForm.findIndex(item => item.deviceId === deviceData.deviceId);
  
  // 处理字典值转换
  const processedDeviceData: DeviceListItem = {
    ...deviceData,
    // 确保字典值字段存在
    confirmStatus: deviceData.confirmStatus || (deviceData.selfConfirmId === 1 ? '已确认' : '未确认'),
    osName: deviceData.osName || '',
    memorySize: deviceData.memorySize || '',
    ssdSize: deviceData.ssdSize || '—',
    hddSize: deviceData.hddSize || '—',
    // 确保数组字段存在
    monitors: deviceData.monitors || [],
    deviceIps: deviceData.deviceIps || [],
  };
  
  if (index !== -1) {
    // 更新设备
    mockDeviceDataForForm[index] = processedDeviceData;
  } else {
    // 添加设备
    mockDeviceDataForForm.push(processedDeviceData);
  }
  
  // 在实际应用中，这里应该调用API接口
  console.log('保存设备数据:', processedDeviceData);
  
  return true;
};

// 验证IP地址格式
export const isValidIP = (ip: string): boolean => {
  const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipPattern.test(ip);
};

// 获取默认设备数据（用于新增设备）
export const getDefaultDeviceData = (): DeviceListItem => {
  return {
    deviceId: '',
    deviceModel: '',
    computerName: '',
    loginUsername: '',
    project: '',
    devRoom: '',
    userId: '',
    userName: '',
    remark: '',
    selfConfirmId: 0,
    osId: 1,
    memoryId: 16,
    ssdId: 0,
    hddId: 0,
    confirmStatus: '未确认',
    osName: 'Windows 11',
    memorySize: '16G',
    ssdSize: '—',
    hddSize: '—',
    monitors: [],
    deviceIps: [],
  };
};

// 根据用户ID获取用户信息
export const getUserInfoById = async (userId: string) => {
  const users = await fetchUsers();
  return users.find(user => user.userId === userId) || null;
};

// 表单验证函数
export const validateDeviceForm = (
  deviceData: Partial<DeviceListItem>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // 验证设备编号
  if (!deviceData.deviceId?.trim()) {
    errors.push('设备编号不能为空');
  }
  
  // 验证设备型号
  if (!deviceData.deviceModel?.trim()) {
    errors.push('设备型号不能为空');
  }
  
  // 验证电脑名称
  if (!deviceData.computerName?.trim()) {
    errors.push('电脑名称不能为空');
  }
  
  // 验证使用人
  if (!deviceData.userId?.trim()) {
    errors.push('请选择使用人');
  }
  
  // 验证IP地址格式
  if (deviceData.deviceIps) {
    const invalidIps = deviceData.deviceIps
      .filter(ip => ip.ipAddress && !isValidIP(ip.ipAddress))
      .map(ip => ip.ipAddress);
    
    if (invalidIps.length > 0) {
      errors.push(`以下IP地址格式不正确: ${invalidIps.join(', ')}`);
    }
  }
  
  // 验证显示器名称
  if (deviceData.monitors) {
    const emptyMonitors = deviceData.monitors.filter(m => !m.monitorName.trim());
    if (emptyMonitors.length > 0) {
      errors.push('请填写所有显示器名称');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};