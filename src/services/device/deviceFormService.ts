// services/device/deviceFormService.ts
import type { DeviceListItem } from '../../types/device';
import { get, post, put } from '../api';
import type { ApiResponse } from '../../types/device';


// 将前端DeviceListItem转换为后端DeviceFullDTO格式
const convertToDeviceFullDTO = (deviceData: DeviceListItem, isEditing: boolean = false): any => {
  // 获取当前登录用户（这里需要根据你的认证系统获取）
  const currentUser = localStorage.getItem('user_name') || 'system';


  // 构建DeviceFullDTO
  const deviceFullDTO = {
    deviceId: deviceData.deviceId,
    deviceModel: deviceData.deviceModel || null,
    computerName: deviceData.computerName || null,
    loginUsername: deviceData.loginUsername || null,
    project: deviceData.project || null,
    devRoom: deviceData.devRoom || null,
    userId: deviceData.userId || null,
    remark: deviceData.remark || null,
    selfConfirmId: deviceData.selfConfirmId || null,
    osId: deviceData.osId || null,
    memoryId: deviceData.memoryId || null,
    ssdId: deviceData.ssdId || null,
    hddId: deviceData.hddId || null,
    creater: isEditing ? deviceData.creater || currentUser : currentUser,
    updater: currentUser,
    monitors: (deviceData.monitors || []).map(monitor => ({
      monitorName: monitor.monitorName,
      deviceId: deviceData.deviceId,
      // 如果是编辑模式且monitor有id，则保留id
      // ...(monitor.monitorId && { monitorId: monitor.monitorId }),
      creater: currentUser,
      updater: currentUser
    })),
    deviceIps: (deviceData.deviceIps || []).map(ip => ({
      ipAddress: ip.ipAddress,
      deviceId: deviceData.deviceId,
      // 如果是编辑模式且ip有id，则保留id
      // ...(ip.ipId && { ipId: ip.ipId }),
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

    console.log('!!!!!!!!!!!!!!!!!!!!!' + deviceData );
    const deviceFullDTO = convertToDeviceFullDTO(deviceData, false);

    console.log(deviceFullDTO);

    console.log('发送给后端的数据:', JSON.stringify(deviceFullDTO, null, 2));

    // 调用后端insertDevice接口
    // 使用泛型指定返回类型
    const response = await post<ApiResponse>('/devices', deviceFullDTO);

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
    // 使用泛型指定返回类型
    const response = await put<ApiResponse>(`/devices/${deviceData.deviceId}`, deviceFullDTO);

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
