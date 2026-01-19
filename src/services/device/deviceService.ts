// services/device/deviceService.ts
import type { DeviceListItem, DeviceQueryParams, DeviceApiResponse } from '../../types/index';
import { get, del, post } from '../api/index';

/**
 * 値をフォーマットします
 * null/undefined/空文字の場合は'-'を返します
 */
const formatValue = (v: any) => (v === null || v === undefined || v === '' ? '-' : String(v));

/**
 * バックエンドから受け取ったデバイスデータをフロントエンド用に変換します
 */
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

// バックエンドのデバイスリストレスポンス構造
interface BackendDeviceListResponse {
  code: number;
  message: string;
  data: any[];
  total?: number;
  page?: number;
  size?: number;
}

/**
 * デバイスリストを取得します
 */
export const getDeviceList = async (params: DeviceQueryParams): Promise<DeviceApiResponse<DeviceListItem>> => {
  const qs = new URLSearchParams();
  qs.append('page', String(params.page || 1));
  qs.append('size', String(params.pageSize || 10));

  if (params.userId !== undefined && params.userId !== '' && params.userId !== null) {
    qs.append('userId', params.userId);
  }

  // 其他条件参数
  if (params.computerName) qs.append('computerName', params.computerName);
  if (params.project) qs.append('project', params.project);
  if (params.devRoom) qs.append('devRoom', params.devRoom);

  const url = `/devices?${qs}`;

  console.log('请求设备列表URL:', url);
  console.log('请求参数:', {
    page: params.page || 1,
    size: params.pageSize || 10,
    userId: params.userId,
    hasUserIdParam: params.userId !== undefined && params.userId !== '' && params.userId !== null
  });

  try {
    const response = await get<BackendDeviceListResponse>(url);

    if (response.code !== 200) {
      throw new Error(response.message || 'デバイスリストの取得に失敗しました');
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
    console.error('デバイスリストの取得に失敗しました:', error);
    throw error;
  }
};

/**
 * デバイスの詳細情報を取得します
 */
export const getDeviceDetail = async (deviceId: string, forEditing: boolean = false): Promise<DeviceListItem | null> => {
  if (!deviceId?.trim()) throw new Error('デバイスIDを入力してください');
  
  const url = `/devices/${encodeURIComponent(deviceId.trim())}`;
  
  const response = await get<{ code: number; message: string; data: any }>(url);
  
  if (response.code !== 200) {
    throw new Error(response.message || '不明なエラーが発生しました');
  }
  
  if (forEditing) {
    // 編集モードではフォーマットせずに生データを返します
    return response.data as DeviceListItem;
  }
  
  return transformDeviceData(response.data);
};

/**
 * デバイスを削除します
 */
export const deleteDevice = async (deviceId: string): Promise<boolean> => {
  if (!deviceId?.trim()) throw new Error('デバイスIDを入力してください');
  
  const url = `/devices/${encodeURIComponent(deviceId.trim())}`;
  
  const response = await del(url) as { code: number; message: string; data: any };
  
  return response.code === 200;
};

/**
 * Excelファイルからデバイスデータをインポートします
 */
export const importDevicesFromExcel = async (file: File): Promise<{ success: boolean; message: string; data?: any }> => {
  if (!file) throw new Error('ファイルを選択してください');
  
  const formData = new FormData();
  formData.append('file', file);
  
  const url = '/devices/import';
  
  try {
    const response = await post<{ code: number; message: string; data: any }>(
      url,
      formData
    );
    
    return {
      success: response.code === 200,
      message: response.message || 'インポートが成功しました',
      data: response.data,
    };
  } catch (error) {
    console.error('Excelインポートに失敗しました:', error);
    throw error;
  }
};
