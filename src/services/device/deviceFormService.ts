// services/device/deviceFormService.ts
import type { DeviceListItem } from '../../types/device';
import { get, post, put } from '../api';

// 获取字典数据
export const fetchDictData = async (): Promise<Record<string, any[]>> => {
  try {
    // 这里可以调用后端获取字典数据的接口
    // 暂时先用模拟数据，你需要根据后端实际接口修改
    const response = await get('/dict/data'); // 假设有这样一个接口

    if (response.code === 200) {
      return response.data;
    } else {
      throw new Error(response.message || '获取字典数据失败');
    }
  } catch (error) {
    console.error('获取字典数据失败:', error);

    // 如果API调用失败，返回模拟数据作为fallback
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
        { dictId: 5, dictItemName: '8G' },
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
  }
};

// 获取用户列表 - 从设备数据中提取
export const fetchUsers = async (): Promise<Array<{userId: string, name: string, deptId?: string}>> => {
  try {
    // 从设备列表中提取用户信息
    // 首先获取设备列表，然后从中提取唯一的用户
    const queryString = new URLSearchParams({
      page: '1',
      pageSize: '1000'
    }).toString();

    const response = await get(`/devices/list?${queryString}`);

    if (response.code === 200) {
      // 从设备列表中提取用户
      const deviceList = response.data?.list || response.data || [];

      // 创建用户映射，确保用户ID唯一
      const userMap = new Map<string, {userId: string, name: string, deptId?: string}>();

      deviceList.forEach((device: any) => {
        if (device.userId && device.userName) {
          // 如果用户ID还不存在，添加到映射中
          if (!userMap.has(device.userId)) {
            userMap.set(device.userId, {
              userId: device.userId,
              name: device.userName || '',
              deptId: device.deptId || ''
            });
          }
        }
      });

      // 将映射转换为数组
      const users = Array.from(userMap.values());

      // 如果从设备数据中提取的用户太少，可以添加一些默认用户
      if (users.length < 5) {
        // 添加一些常用用户作为备选
        const defaultUsers = [
          { userId: 'JS0010', name: '小娟', deptId: 'IT' },
          { userId: 'JS0011', name: '张三', deptId: '研发部' },
          { userId: 'JS0012', name: '李四', deptId: '测试部' },
          { userId: 'JS0013', name: '王五', deptId: '产品部' },
          { userId: 'JS0014', name: '李松', deptId: '研发部' }
        ];

        defaultUsers.forEach(user => {
          if (!userMap.has(user.userId)) {
            userMap.set(user.userId, user);
          }
        });

        return Array.from(userMap.values());
      }

      return users;
    } else {
      throw new Error(response.message || '获取用户列表失败');
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);

    // 如果API调用失败，返回模拟数据作为fallback
    const users = [
      { userId: 'JS0010', name: '小娟', deptId: 'IT' },
      { userId: 'JS0011', name: '张三', deptId: '研发部' },
      { userId: 'JS0012', name: '李四', deptId: '测试部' },
      { userId: 'JS0013', name: '王五', deptId: '产品部' },
      { userId: 'JS0014', name: '李松', deptId: '研发部' },
      { userId: 'JS0015', name: '李雪', deptId: '测试部' },
      { userId: 'JS0016', name: '韩海峰', deptId: '研发部' },
      { userId: 'JS0017', name: '小红', deptId: '产品部' },
      { userId: 'JS0018', name: '小芳', deptId: 'IT' },
      { userId: 'JS0019', name: '小李', deptId: '研发部' },
      { userId: 'JS0020', name: '老丁', deptId: '测试部' },
      { userId: 'JS0021', name: '老张', deptId: '产品部' },
      { userId: 'JS0022', name: '老刘', deptId: '研发部' },
      { userId: 'JS0023', name: '新用户1', deptId: 'IT' },
      { userId: 'JS0024', name: '新用户2', deptId: '测试部' },
      { userId: 'JS0025', name: '新用户3', deptId: '研发部' }
    ];

    return users;
  }
};

// 将前端DeviceListItem转换为后端DeviceFullDTO格式
const convertToDeviceFullDTO = (deviceData: DeviceListItem, isEditing: boolean = false): any => {
  // 获取当前登录用户（这里需要根据你的认证系统获取）
  const currentUser = localStorage.getItem('user_name') || 'system';


  // 无调用
  // 获取当前时间
  // const now = new Date().toISOString();



  // 构建DeviceFullDTO
  const deviceFullDTO = {
    deviceId: deviceData.deviceId,
    deviceModel: deviceData.deviceModel || '',
    computerName: deviceData.computerName || '',
    loginUsername: deviceData.loginUsername || '',
    project: deviceData.project || '',
    devRoom: deviceData.devRoom || '',
    userId: deviceData.userId || '',
    remark: deviceData.remark || '',
    selfConfirmId: deviceData.selfConfirmId || 0,
    osId: deviceData.osId || 1,
    memoryId: deviceData.memoryId || 16,
    ssdId: deviceData.ssdId || 0,
    hddId: deviceData.hddId || 0,
    creater: isEditing ? deviceData.creater || currentUser : currentUser,
    updater: currentUser,
    monitors: (deviceData.monitors || []).map(monitor => ({
      monitorName: monitor.monitorName,
      deviceId: deviceData.deviceId,
      // 如果是编辑模式且monitor有id，则保留id
      ...(monitor.monitorId && { monitorId: monitor.monitorId }),
      creater: currentUser,
      updater: currentUser
    })),
    deviceIps: (deviceData.deviceIps || []).map(ip => ({
      ipAddress: ip.ipAddress,
      deviceId: deviceData.deviceId,
      // 如果是编辑模式且ip有id，则保留id
      ...(ip.ipId && { ipId: ip.ipId }),
      creater: currentUser,
      updater: currentUser
    })),
    name: deviceData.userName || '',
    deptId: deviceData.deptId || ''
  };

  return deviceFullDTO;
};

// 保存设备（新增设备）
export const saveDevice = async (deviceData: DeviceListItem): Promise<boolean> => {
  try {
    const deviceFullDTO = convertToDeviceFullDTO(deviceData, false);

    console.log('发送给后端的数据:', JSON.stringify(deviceFullDTO, null, 2));

    // 调用后端insertDevice接口
    const response = await post('/devices/insertDevice', deviceFullDTO);

    if (response.code === 200) {
      console.log('设备保存成功:', response.data);
      return true;
    } else {
      console.error('设备保存失败:', response.message);
      throw new Error(response.message || '设备保存失败');
    }
  } catch (error: any) {
    console.error('设备保存请求失败:', error);

    // 提取错误信息
    const errorMessage = error.message || error.msg || error.toString() || '未知错误';
    throw new Error(`设备保存失败: ${errorMessage}`);
  }
};

// 更新设备（编辑设备）
export const updateDevice = async (deviceData: DeviceListItem): Promise<boolean> => {
  try {
    const deviceFullDTO = convertToDeviceFullDTO(deviceData, true);

    console.log('发送给后端的数据:', JSON.stringify(deviceFullDTO, null, 2));

    // 调用后端updateDevice接口
    const response = await put(`/devices/updateDevice/${deviceData.deviceId}`, deviceFullDTO);

    if (response.code === 200) {
      console.log('设备更新成功:', response.data);
      return true;
    } else {
      console.error('设备更新失败:', response.message);
      throw new Error(response.message || '设备更新失败');
    }
  } catch (error: any) {
    console.error('设备更新请求失败:', error);

    // 提取错误信息
    const errorMessage = error.message || error.msg || error.toString() || '未知错误';
    throw new Error(`设备更新失败: ${errorMessage}`);
  }
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


// 无调用
// 根据用户ID获取用户信息
// export const getUserInfoById = async (userId: string) => {
//   const users = await fetchUsers();
//   return users.find(user => user.userId === userId) || null;
// };


// 好像未调用
// 表单验证函数  Partial定义属性为可选
// export const validateDeviceForm = (
//   deviceData: Partial<DeviceListItem>
// ): { isValid: boolean; errors: string[] } => {
//   const errors: string[] = [];
  
//   // 验证设备编号
//   if (!deviceData.deviceId?.trim()) {
//     errors.push('设备编号不能为空');
//   }

//   // 验证设备型号
//   if (!deviceData.deviceModel?.trim()) {
//     errors.push('设备型号不能为空');
//   }

//   // 验证电脑名称
//   if (!deviceData.computerName?.trim()) {
//     errors.push('电脑名称不能为空');
//   }

//   // 验证使用人
//   if (!deviceData.userId?.trim()) {
//     errors.push('请选择使用人');
//   }

//   // 验证IP地址格式
//   if (deviceData.deviceIps) {
//     const invalidIps = deviceData.deviceIps
//       .filter(ip => ip.ipAddress && !isValidIP(ip.ipAddress))
//       .map(ip => ip.ipAddress);

//     if (invalidIps.length > 0) {
//       errors.push(`以下IP地址格式不正确: ${invalidIps.join(', ')}`);
//     }
//   }

//   // 验证显示器名称
//   if (deviceData.monitors) {
//     const emptyMonitors = deviceData.monitors.filter(m => !m.monitorName.trim());
//     if (emptyMonitors.length > 0) {
//       errors.push('请填写所有显示器名称');
//     }
//   }

//   return {
//     isValid: errors.length === 0,
//     errors
//   };
// };