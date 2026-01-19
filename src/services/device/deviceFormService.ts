// services/device/deviceFormService.ts
import type { DeviceListItem } from '../../types/index';
import { get, post, put } from '../api';
import type { ApiResponse } from '../../types/index';
import { getAuthStore } from '../../stores/authStore';


// フロントエンドのDeviceListItemをバックエンドのDeviceFullDTO形式に変換
const convertToDeviceFullDTO = (deviceData: DeviceListItem, isEditing: boolean = false): any => {
  // 現在のログインユーザーを取得（認証ストアから取得）
  const currentUser = getAuthStore().userInfo?.NAME || 'system';


  // DeviceFullDTOを構築
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
      // 編集モードでmonitorにidがある場合はidを保持
      // ...(monitor.monitorId && { monitorId: monitor.monitorId }),
      creater: currentUser,
      updater: currentUser
    })),
    deviceIps: (deviceData.deviceIps || []).map(ip => ({
      ipAddress: ip.ipAddress,
      deviceId: deviceData.deviceId,
      // 編集モードでipにidがある場合はidを保持
      // ...(ip.ipId && { ipId: ip.ipId }),
      creater: currentUser,
      updater: currentUser
    })),
    name: deviceData.userName || '',
    deptId: deviceData.deptId || ''
  };

  return deviceFullDTO;
};

// デバイスを保存（新規デバイス追加）
export const saveDevice = async (deviceData: DeviceListItem): Promise<boolean> => {
  try {
    const deviceFullDTO = convertToDeviceFullDTO(deviceData, false);

    console.log('バックエンドに送信するデータ:', JSON.stringify(deviceFullDTO, null, 2));

    // バックエンドのinsertDeviceインターフェースを呼び出し
    // ジェネリックを使用して戻り値の型を指定
    const response = await post<ApiResponse>('/devices', deviceFullDTO);

    if (response.code === 200) {
      console.log('デバイス保存成功:', response.data);
      return true;
    } else {
      console.error('デバイス保存失敗:', response.message);
      throw new Error(response.message || 'デバイス保存に失敗しました');
    }
  } catch (error: any) {
    console.error('デバイス保存リクエスト失敗:', error);

    // エラー情報を抽出
    const errorMessage = error.message || error.msg || error.toString() || '不明なエラー';
    throw new Error(`デバイス保存失敗: ${errorMessage}`);
  }
};

// デバイスを更新（デバイス編集）
export const updateDevice = async (deviceData: DeviceListItem): Promise<boolean> => {
  try {
    const deviceFullDTO = convertToDeviceFullDTO(deviceData, true);

    console.log('バックエンドに送信するデータ:', JSON.stringify(deviceFullDTO, null, 2));

    // バックエンドのupdateDeviceインターフェースを呼び出し
    // ジェネリックを使用して戻り値の型を指定
    const response = await put<ApiResponse>(`/devices/${deviceData.deviceId}`, deviceFullDTO);

    if (response.code === 200) {
      console.log('デバイス更新成功:', response.data);
      return true;
    } else {
      console.error('デバイス更新失敗:', response.message);
      throw new Error(response.message || 'デバイス更新に失敗しました');
    }
  } catch (error: any) {
    console.error('デバイス更新リクエスト失敗:', error);

    // エラー情報を抽出
    const errorMessage = error.message || error.msg || error.toString() || '不明なエラー';
    throw new Error(`デバイス更新失敗: ${errorMessage}`);
  }
};

// IPアドレス形式を検証
export const isValidIP = (ip: string): boolean => {
  const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipPattern.test(ip);
};
