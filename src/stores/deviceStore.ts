// src/stores/deviceStore.ts
import { create } from 'zustand';
import { message, Modal } from 'antd';
import type {
  DeviceListItem,
  DeviceQueryParams,
  DeviceApiResponse,
} from '../types/index';
import {
  getDeviceList,
  deleteDevice,
  getDeviceDetail,
} from '../services/device/deviceService';
import {
  saveDevice,
  updateDevice,
} from '../services/device/deviceFormService'; // インポートを追加
import { useAuthStore } from '../stores/authStore';

interface DeviceStore {
  devices: DeviceListItem[];
  loading: boolean;
  searchParams: DeviceQueryParams;
  total: number;
  formVisible: boolean;
  isEditing: boolean;
  selectedDevice: DeviceListItem | null;
  userIdSearch: string;
  users: any[]; // ユーザーリストを追加
  usersLoading: boolean; // ユーザー読み込み状態を追加

  setDevices: (d: DeviceListItem[]) => void;
  setLoading: (l: boolean) => void;
  setSearchParams: (p: DeviceQueryParams) => void;
  setTotal: (t: number) => void;
  setFormVisible: (v: boolean) => void;
  setIsEditing: (e: boolean) => void;
  setSelectedDevice: (d: DeviceListItem | null) => void;
  setUserIdSearch: (s: string) => void;
  setUsers: (u: any[]) => void; // 追加
  setUsersLoading: (l: boolean) => void; // 追加

  fetchDevices: () => Promise<void>;
  fetchUsers: () => Promise<void>; // 追加
  handlePageChange: (page: number, pageSize?: number) => void;
  handlePageSizeChange: (size: number) => void;
  handleEditDevice: (d: DeviceListItem) => Promise<void>;
  handleDeleteDevice: (deviceId: string) => Promise<void>;
  handleAddDevice: () => void;
  handleUserIdSearch: (value: string) => void;
  handleFormSubmit: (values: DeviceListItem) => Promise<void>;
  initialize: (isAdmin: boolean, currentUserId?: string) => Promise<void>;
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  /* ---------- 初期状態 ---------- */
  devices: [],
  loading: false,
  searchParams: { page: 1, pageSize: 10 },
  total: 0,
  formVisible: false,
  isEditing: false,
  selectedDevice: null,
  userIdSearch: '',
  users: [], // 空の配列で初期化
  usersLoading: false,

  /* ---------- セッター ---------- */
  setDevices: (d) => set({ devices: d }),
  setLoading: (l) => set({ loading: l }),
  setSearchParams: (p) => set({ searchParams: p }),
  setTotal: (t) => set({ total: t }),
  setFormVisible: (v) => set({ formVisible: v }),
  setIsEditing: (e) => set({ isEditing: e }),
  setSelectedDevice: (d) => set({ selectedDevice: d }),
  setUserIdSearch: (s) => set({ userIdSearch: s }),
  setUsers: (u) => set({ users: u }),
  setUsersLoading: (l) => set({ usersLoading: l }),

  /* ---------- ビジネスメソッド ---------- */
  fetchDevices: async () => {
    const { searchParams, setLoading, setDevices, setTotal } = get();
    setLoading(true);
    console.log('fetchDevices被调用，参数：', searchParams);
    try {
      const res: DeviceApiResponse<DeviceListItem> = await getDeviceList(searchParams);
      console.log('fetchDevices返回：', res);
      if (res.code === 200 && res.data) {
        // TSに明示的にページネーション構造を伝える
        const pageData = res.data as {
          list: DeviceListItem[];
          total: number;
          page: number;
          pageSize: number;
        };
        console.log('转换后的pageData：', pageData);
        setDevices(pageData.list);
        setTotal(pageData.total);
      } else {
        message.error(`デバイスリストの取得に失敗しました: ${res.message}`);
        setDevices([]); setTotal(0);
      }
    } catch (e: any) {
      const errorMessage = e.message || 'デバイスリストの取得に失敗しました';
      message.error(`デバイスリストの取得に失敗しました: ${errorMessage}`);
      console.error('デバイスリスト取得失敗の詳細:', e);
      setDevices([]); setTotal(0);
    } finally {
      setLoading(false);
    }
  },

  fetchUsers: async () => {
    const { setUsers, setUsersLoading, searchParams } = get();
    setUsersLoading(true);

    try {
      // fetchDevicesを呼び出してデバイスリストを取得
      const { fetchDevices } = get();
      
      // 元の検索パラメータを保存
      const originalParams = { ...searchParams };
      
      // ユーザー取得に必要なパラメータを設定（ユーザー抽出のため大量データを取得）
      const userSearchParams = {
        page: 1,
        pageSize: 1000,
        ...originalParams
      };
      
      // 一時的に検索パラメータを変更
      set({ searchParams: userSearchParams });
      
      // デバイスリストを取得
      await fetchDevices();
      
      // 現在のデバイスリストからユーザー情報を抽出
      const deviceList = get().devices;
      
      // Setを使用して重複を排除
      const userSet = new Set<string>();
      const users: Array<{userId: string, name: string, deptId?: string}> = [];

      deviceList.forEach((device) => {
        if (device.userId && device.userName && !userSet.has(device.userId)) {
          userSet.add(device.userId);
          users.push({
            userId: device.userId,
            name: device.userName || '',
            deptId: device.deptId || ''
          });
        }
      });
            
      setUsers(users);
      
      // 元の検索パラメータに戻す
      set({ searchParams: originalParams });

    } catch (error) {
      console.error('ユーザーリストの取得に失敗しました:', error);

    } finally {
      setUsersLoading(false);
    }
  },

  handlePageChange: (page, pageSize) => {
    const { setSearchParams, fetchDevices } = get();
    const p = { ...get().searchParams, page, pageSize: pageSize || get().searchParams.pageSize };
    setSearchParams(p);
    fetchDevices();
  },

  handlePageSizeChange: (size) => {
    const { setSearchParams, fetchDevices } = get();
    const p = { ...get().searchParams, page: 1, pageSize: size };
    setSearchParams(p);
    fetchDevices();
  },

  handleEditDevice: async (device) => {


    try {
      const detail = await getDeviceDetail(device.deviceId, true);
      set({ selectedDevice: detail, isEditing: true, formVisible: true });
    } catch {
      message.error('デバイス情報の取得に失敗しました');
    }
  },

  handleDeleteDevice: async (deviceId) => {

    const { userInfo } = useAuthStore.getState();
    const isAdmin = userInfo?.USER_TYPE_NAME === 'admin';

    if (!isAdmin) {
      message.error('普通用户无权限删除设备');
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      Modal.confirm({
        title: '削除の確認',
        content: `デバイス ${deviceId} を削除してもよろしいですか？`,
        okText: '確認',
        cancelText: 'キャンセル',
        onOk: async () => {
          try {
            await deleteDevice(deviceId);
            await get().fetchDevices();
            message.success(`デバイス ${deviceId} の削除に成功しました`);
          } catch {
            message.error('デバイスの削除に失敗しました');
          }
          resolve();
        },
        onCancel: () => resolve(),
      });
    });
  },

  handleAddDevice: () => {


    set({

      isEditing: false,
      formVisible: true
    });
  },

  handleUserIdSearch: (value) => {
    const { setUserIdSearch, setSearchParams, fetchDevices } = get();

    const { userInfo } = useAuthStore.getState();
    const isAdmin = userInfo?.USER_TYPE_NAME === 'admin';

    if (!isAdmin && userInfo?.USER_ID) {
      // 普通用户强制使用自己的ID
      const forcedUserId = userInfo.USER_ID;
      setUserIdSearch(forcedUserId);
      const p = { ...get().searchParams, userId: forcedUserId, page: 1 };
      setSearchParams(p);
    } else {
      setUserIdSearch(value);


      const userIdParam = value.trim() === '' ? undefined : value.trim();
      const p = { ...get().searchParams, userId: userIdParam, page: 1 };
      setSearchParams(p);
    }

    fetchDevices();
  },

  /* フォーム送信はまだ実装されていません。一旦空にしておきます */
  // フォーム送信を処理
  handleFormSubmit: async (values: DeviceListItem) => {

     try {
      const { isEditing, fetchDevices } = get();
      const { userInfo } = useAuthStore.getState();
      const isAdmin = userInfo?.USER_TYPE_NAME === 'admin';


      if (!isAdmin && values.userId !== userInfo?.USER_ID) {
        if (isEditing) {
          message.error('无权编辑其他用户的设备');
          return;
        }
      }


      if (!isAdmin && !isEditing) {
        values.userId = userInfo?.USER_ID || '';
      }

      let success;

      if (isEditing) {
        // 編集モードでは updateDevice を呼び出す
        success = await updateDevice(values);  
      } else {
        // 新規追加モードでは saveDevice を呼び出す
        success = await saveDevice(values);
      }

      if (success) {
        if (isEditing) {
          message.success(`デバイス ${values.deviceId} の編集に成功しました`);
        } else {
          message.success(`デバイス ${values.deviceId} の追加に成功しました`);
        }
        
        // デバイスリストを再読み込み
        await fetchDevices();
        
        // フォームを閉じる
        set({ 
          formVisible: false, 
          isEditing: false, 
          selectedDevice: null 
        });
      } else {
        message.error('操作に失敗しました');
      }
    } catch (error: any) {
      message.error(`操作に失敗しました: ${error.message || '不明なエラー'}`);
      console.error('操作に失敗しました:', error);
    }
  },

  initialize: async (isAdmin: boolean, currentUserId?: string) => {
    const { setSearchParams, setUserIdSearch, fetchDevices, fetchUsers } = get();

    console.log('初始化设备商店:', { isAdmin, currentUserId });

    if (!isAdmin && currentUserId) {

      setUserIdSearch(currentUserId);

      setSearchParams({
        page: 1,
        pageSize: 10,
        userId: currentUserId  // 明确设置userId
      });
      await fetchDevices();
    } else {

      setUserIdSearch('');  // 清空搜索框

      setSearchParams({
        page: 1,
        pageSize: 10,
        userId: undefined  // 明确设置为 undefined
      });

      await Promise.all([
        fetchDevices(),
        fetchUsers()
      ]);
    }
  },
}));