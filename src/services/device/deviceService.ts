// services/device/deviceService.ts
import type { DeviceListItem, DeviceQueryParams, DeviceApiResponse } from '../../types/device';
import { get, del } from '../api/index'; // 导入统一的请求方法

const formatValue = (v: any) => (v === null || v === undefined || v === '' ? '-' : String(v));

const transformDeviceData = (d: any): DeviceListItem => ({
  deviceId: d.deviceId || '',
  deviceModel: formatValue(d.deviceModel),
  computerName: formatValue(d.computerName),
  loginUsername: formatValue(d.loginUsername),
  project: formatValue(d.project),
  devRoom: formatValue(d.devRoom),
  userId: formatValue(d.userId ?? d.userInfo?.userId),
  userName: formatValue(d.name ?? d.userName ?? d.userInfo?.userName),
  deptId: d.deptId ?? d.userInfo?.deptId ?? null,
  remark: formatValue(d.remark),
  selfConfirmId: d.selfConfirmId || null,
  osId: d.osId || null,
  memoryId: d.memoryId || null,
  ssdId: d.ssdId || null,
  hddId: d.hddId || null,
  createTime: formatValue(d.createTime),
  creater: formatValue(d.creater),
  updateTime: formatValue(d.updateTime),
  updater: formatValue(d.updater),
  confirmStatus: formatValue(d.selfConfirm?.dictItemName || d.selfConfirmDict?.dictItemName),
  osName: formatValue(d.os?.dictItemName || d.osDict?.dictItemName),
  memorySize: formatValue(d.memory?.dictItemName || d.memoryDict?.dictItemName),
  ssdSize: formatValue(d.ssd?.dictItemName || d.ssdDict?.dictItemName),
  hddSize: formatValue(d.hdd?.dictItemName || d.hddDict?.dictItemName),
  monitors: (d.monitors || []).map((m: any) => ({
    monitorId: m.monitorId || 0,
    monitorName: formatValue(m.monitorName),
    deviceId: d.deviceId,
    createTime: formatValue(m.createTime),
    creater: formatValue(m.creater),
    updateTime: formatValue(m.updateTime),
    updater: formatValue(m.updater),
  })),
  deviceIps: (d.deviceIps || []).map((i: any) => ({
    ipId: i.ipId || 0,
    ipAddress: formatValue(i.ipAddress),
    deviceId: d.deviceId,
    createTime: formatValue(i.createTime),
    creater: formatValue(i.creater),
    updateTime: formatValue(i.updateTime),
    updater: formatValue(i.updater),
  })),
});

// 更新后的后端数据结构
interface BackendDeviceListResponse {
  code: number;
  message: string;
  data: any[]; // 直接返回设备数组
  total?: number; // 总记录数
  page?: number;  // 当前页码
  size?: number;  // 每页大小
}

export const getDeviceList = async (params: DeviceQueryParams): Promise<DeviceApiResponse<DeviceListItem>> => {
  const qs = new URLSearchParams();
  qs.append('page', String(params.page || 1));
  qs.append('size', String(params.pageSize || 10));
  if (params.userId) qs.append('userId', params.userId);
  if (params.computerName) qs.append('computerName', params.computerName);
  if (params.project) qs.append('project', params.project);
  if (params.devRoom) qs.append('devRoom', params.devRoom);
  
  const url = `/devices?${qs}`;
  
  try {
    const response = await get<BackendDeviceListResponse>(url);
    
    if (response.code !== 200) {
      throw new Error(response.message || '获取设备列表失败');
    }
    
    return {
      code: response.code,
      message: response.message,
      data: {
        list: (response.data || []).map(transformDeviceData),
        total: response.total !== null && response.total !== undefined ? response.total : (response.data || []).length,
        page: response.page !== null && response.page !== undefined ? response.page : (params.page || 1),
        pageSize: response.size !== null && response.size !== undefined ? response.size : (params.pageSize || 10),
      },
    };
  } catch (error) {
    console.error('获取设备列表失败:', error);
    throw error;
  }
};

export const getDeviceDetail = async (deviceId: string): Promise<DeviceListItem | null> => {
  if (!deviceId?.trim()) throw new Error('设备ID不能为空');
  
  const url = `/devices/${encodeURIComponent(deviceId.trim())}`;
  
  // 使用统一的 get 方法
  const response = await get<{ code: number; message: string; data: any }>(url);
  
  // 检查业务状态码
  if (response.code !== 200) {
    throw new Error(response.message || '未知错误');
  }
  
  return transformDeviceData(response.data);
};

export const deleteDevice = async (deviceId: string): Promise<boolean> => {
  if (!deviceId?.trim()) throw new Error('设备ID不能为空');
  
  const url = `/devices/${encodeURIComponent(deviceId.trim())}`;
  
  // 使用统一的 del 方法，不传递类型参数
  const response = await del(url) as { code: number; message: string; data: any };
  
  // 直接返回业务状态码是否成功
  return response.code === 200;
};