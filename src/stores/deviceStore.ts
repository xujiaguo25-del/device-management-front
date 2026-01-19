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
    console.log('fetchDevicesが呼び出されました。パラメータ:', searchParams);
    try {
      const res: DeviceApiResponse<DeviceListItem> = await getDeviceList(searchParams);
      console.log('fetchDevicesの返り値:', res);
      if (res.code === 200 && res.data) {
        // TSに明示的にページネーション構造を伝える
        const pageData = res.data as {
          list: DeviceListItem[];
          total: number;
          page: number;
          pageSize: number;
        };
        console.log('変換後のpageData:', pageData);
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
      // 元の検索パラメータを保存
      const originalParams = { ...searchParams };
      
      const allDevices: DeviceListItem[] = [];
      let currentPage = 1;
      const maxPages = 10; // 最大10ページ（1000件）まで取得
      
      // ページネーションでデータを取得（最大10ページ）
      while (currentPage <= maxPages) {
        try {
          const pageSearchParams = {
            ...originalParams,
            page: currentPage,
            pageSize: 100,  // バックエンドAPIの制限: 1から100まで
            userId: originalParams.userId // userIdパラメータを保持
          };
          
          // 直接getDeviceListを呼び出してデバイスリストを取得
          const res = await getDeviceList(pageSearchParams);
          
          if (res.code === 200 && res.data) {
            const pageData = res.data as {
              list: DeviceListItem[];
              total: number;
              page: number;
              pageSize: number;
            };
            
            console.log(`ページ ${currentPage} のデータ取得成功:`, pageData.list.length, '件');
            
            // データを追加
            allDevices.push(...pageData.list);
            
            // 最後のページまたはデータがなくなったら終了
            if (pageData.list.length < 100 || allDevices.length >= 1000) {
              break;
            }
            
            currentPage++;
          } else {
            console.error(`ページ ${currentPage} のデータ取得に失敗:`, res.message);
            break;
          }
        } catch (pageError) {
          console.error(`ページ ${currentPage} のデータ取得中にエラー:`, pageError);
          break;
        }
      }
      
      // Setを使用して重複を排除
      const userSet = new Set<string>();
      const users: Array<{userId: string, name: string, deptId?: string}> = [];

      allDevices.forEach((device) => {
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
      message.error('一般ユーザーはデバイスを削除する権限がありません');
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
          message.error('他のユーザーのデバイスを編集する権限がありません');
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

    console.log('デバイスストアを初期化しています:', { isAdmin, currentUserId });

    if (!isAdmin && currentUserId) {

      setUserIdSearch(currentUserId);

      setSearchParams({
        page: 1,
        pageSize: 10,
        userId: currentUserId  
      });
      await fetchDevices();
    } else {

      setUserIdSearch('');  

      setSearchParams({
        page: 1,
        pageSize: 10,
        userId: undefined  
      });

      await Promise.all([
        fetchDevices(),
        fetchUsers()
      ]);
    }
  },
}));