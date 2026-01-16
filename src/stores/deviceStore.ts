// src/stores/deviceStore.ts
import { create } from 'zustand';
import { message, Modal } from 'antd';
import type {
  DeviceListItem,
  DeviceQueryParams,
  DeviceApiResponse,
} from '../types/device';
import {
  getDeviceList,
  deleteDevice,
  getDeviceDetail,
} from '../services/device/deviceService';
import {
  saveDevice,
  updateDevice,
} from '../services/device/deviceFormService';
import { useAuthStore } from '../stores/authStore'; // ✅ 导入 authStore

interface DeviceStore {
  devices: DeviceListItem[];
  loading: boolean;
  searchParams: DeviceQueryParams;
  total: number;
  formVisible: boolean;
  isEditing: boolean;
  selectedDevice: DeviceListItem | null;
  userIdSearch: string;
  users: any[];
  usersLoading: boolean;

  setDevices: (d: DeviceListItem[]) => void;
  setLoading: (l: boolean) => void;
  setSearchParams: (p: DeviceQueryParams) => void;
  setTotal: (t: number) => void;
  setFormVisible: (v: boolean) => void;
  setIsEditing: (e: boolean) => void;
  setSelectedDevice: (d: DeviceListItem | null) => void;
  setUserIdSearch: (s: string) => void;
  setUsers: (u: any[]) => void;
  setUsersLoading: (l: boolean) => void;

  fetchDevices: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  handlePageChange: (page: number, pageSize?: number) => void;
  handlePageSizeChange: (size: number) => void;
  handleEditDevice: (d: DeviceListItem) => Promise<void>;
  handleDeleteDevice: (deviceId: string) => Promise<void>;
  handleAddDevice: () => void;
  handleUserIdSearch: (value: string) => void;
  handleFormSubmit: (values: DeviceListItem) => Promise<void>;
  initialize: (isAdmin: boolean, currentUserId?: string) => Promise<void>; // ✅ 修改参数
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  /* ---------- 初始状态 ---------- */
  devices: [],
  loading: false,
  searchParams: { page: 1, pageSize: 10 },
  total: 0,
  formVisible: false,
  isEditing: false,
  selectedDevice: null,
  userIdSearch: '',
  users: [],
  usersLoading: false,

  /* ---------- setters ---------- */
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

  /* ---------- 业务方法 ---------- */
  fetchDevices: async () => {
    const { searchParams, setLoading, setDevices, setTotal } = get();
    setLoading(true);
    console.log('fetchDevices被调用，参数：', searchParams);
    try {
      const res: DeviceApiResponse<DeviceListItem> = await getDeviceList(searchParams);
      console.log('fetchDevices返回：', res);
      if (res.code === 200 && res.data) {
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
        message.error(`获取设备列表失败: ${res.message}`);
        setDevices([]); setTotal(0);
      }
    } catch (e: any) {
      const errorMessage = e.message || '获取设备列表失败';
      message.error(`获取设备列表失败: ${errorMessage}`);
      console.error('获取设备列表失败详情:', e);
      setDevices([]); setTotal(0);
    } finally {
      setLoading(false);
    }
  },

  fetchUsers: async () => {
    const { setUsers, setUsersLoading, searchParams } = get();
    setUsersLoading(true);

    try {
      const { fetchDevices } = get();
      const originalParams = { ...searchParams };

      const userSearchParams = {
        page: 1,
        pageSize: 1000,
        ...originalParams
      };

      set({ searchParams: userSearchParams });
      await fetchDevices();

      const deviceList = get().devices;
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

      if (users.length < 5) {
        const defaultUsers = [
          { userId: 'JS0010', name: '小娟', deptId: 'IT' },
          { userId: 'JS0011', name: '张三', deptId: '研发部' },
          { userId: 'JS0012', name: '李四', deptId: '测试部' },
        ];

        defaultUsers.forEach(user => {
          if (!userSet.has(user.userId)) {
            userSet.add(user.userId);
            users.push(user);
          }
        });
      }

      setUsers(users);
      set({ searchParams: originalParams });

    } catch (error) {
      console.error('获取用户列表失败:', error);
      const defaultUsers = [
        { userId: 'JS0010', name: '小娟', deptId: 'IT' },
        { userId: 'JS0011', name: '张三', deptId: '研发部' },
        { userId: 'JS0012', name: '李四', deptId: '测试部' },
      ];
      setUsers(defaultUsers);
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
    // ✅ 权限检查
    const { userInfo } = useAuthStore.getState();
    const isAdmin = userInfo?.USER_TYPE_NAME === 'admin';

    if (!isAdmin) {
      message.error('普通用户无权限编辑设备');
      return;
    }

    try {
      const detail = await getDeviceDetail(device.deviceId);
      set({ selectedDevice: detail, isEditing: true, formVisible: true });
    } catch {
      message.error('获取设备信息失败');
    }
  },

  handleDeleteDevice: async (deviceId) => {
    // ✅ 权限检查
    const { userInfo } = useAuthStore.getState();
    const isAdmin = userInfo?.USER_TYPE_NAME === 'admin';

    if (!isAdmin) {
      message.error('普通用户无权限删除设备');
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除设备 ${deviceId} 吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          try {
            await deleteDevice(deviceId);
            await get().fetchDevices();
            message.success(`设备 ${deviceId} 删除成功`);
          } catch {
            message.error('删除设备失败');
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
    // ✅ 普通用户无法修改搜索条件
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

      // ✅ 管理员搜索逻辑：空字符串或 undefined 时设为 undefined
      const userIdParam = value.trim() === '' ? undefined : value.trim();
      const p = { ...get().searchParams, userId: userIdParam, page: 1 };
      setSearchParams(p);
    }

    fetchDevices();
  },

  handleFormSubmit: async (values: DeviceListItem) => {
    try {
      const { isEditing, fetchDevices } = get();
      const { userInfo } = useAuthStore.getState();
      const isAdmin = userInfo?.USER_TYPE_NAME === 'admin';

      // ✅ 普通用户只能添加/编辑自己的设备
      if (!isAdmin && values.userId !== userInfo?.USER_ID) {
        if (isEditing) {
          message.error('无权编辑其他用户的设备');
          return;
        }
      }

      // ✅ 普通用户添加设备时强制使用自己的ID
      if (!isAdmin && !isEditing) {
        values.userId = userInfo?.USER_ID || '';
      }

      let success;

      if (isEditing) {
        success = await updateDevice(values);
      } else {
        success = await saveDevice(values);
      }

      if (success) {
        if (isEditing) {
          message.success(`设备 ${values.deviceId} 编辑成功`);
        } else {
          message.success(`设备 ${values.deviceId} 添加成功`);
        }

        await fetchDevices();
        set({
          formVisible: false,
          isEditing: false,
          selectedDevice: null
        });
      } else {
        message.error('操作失败');
      }
    } catch (error: any) {
      message.error(`操作失败: ${error.message || '未知错误'}`);
      console.error('操作失败:', error);
    }
  },

  // ✅ 根据用户类型初始化
  // src/stores/deviceStore.ts
  initialize: async (isAdmin: boolean, currentUserId?: string) => {
    const { setSearchParams, setUserIdSearch, fetchDevices, fetchUsers } = get();

    console.log('初始化设备商店:', { isAdmin, currentUserId });

    if (!isAdmin && currentUserId) {
      // 普通用户：只加载自己的设备，不加载用户列表
      // 强制设置为自己的ID
      setUserIdSearch(currentUserId);
      // ✅ 设置搜索参数时包含 userId
      setSearchParams({
        page: 1,
        pageSize: 10,
        userId: currentUserId  // 明确设置userId
      });
      await fetchDevices();
    } else {
      // ✅ 管理员：清除所有搜索条件，加载所有设备和用户列表
      setUserIdSearch('');  // 清空搜索框
      // ✅ 明确设置 userId 为 undefined，而不是空字符串
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