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
} from '../services/device/deviceFormService'; // 添加导入

interface DeviceStore {
  devices: DeviceListItem[];
  loading: boolean;
  searchParams: DeviceQueryParams;
  total: number;
  formVisible: boolean;
  isEditing: boolean;
  selectedDevice: DeviceListItem | null;
  userIdSearch: string;
  users: any[]; // 添加用户列表
  usersLoading: boolean; // 添加用户加载状态

  setDevices: (d: DeviceListItem[]) => void;
  setLoading: (l: boolean) => void;
  setSearchParams: (p: DeviceQueryParams) => void;
  setTotal: (t: number) => void;
  setFormVisible: (v: boolean) => void;
  setIsEditing: (e: boolean) => void;
  setSelectedDevice: (d: DeviceListItem | null) => void;
  setUserIdSearch: (s: string) => void;
  setUsers: (u: any[]) => void; // 添加
  setUsersLoading: (l: boolean) => void; // 添加

  fetchDevices: () => Promise<void>;
  fetchUsers: () => Promise<void>; // 添加
  handlePageChange: (page: number, pageSize?: number) => void;
  handlePageSizeChange: (size: number) => void;
  handleEditDevice: (d: DeviceListItem) => Promise<void>;
  handleDeleteDevice: (deviceId: string) => Promise<void>;
  handleAddDevice: () => void;
  handleUserIdSearch: (value: string) => void;
  handleFormSubmit: (values: DeviceListItem) => Promise<void>;
  initialize: () => Promise<void>;
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
  users: [], // 初始化为空数组
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
    try {
      const res: DeviceApiResponse<DeviceListItem> = await getDeviceList(searchParams);
      if (res.code === 200 && res.data) {
        // ✅ 显式告诉 TS 这是分页结构
        const pageData = res.data as {
          list: DeviceListItem[];
          total: number;
          page: number;
          pageSize: number;
        };
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
    const { setUsers, setUsersLoading, searchParams, setDevices } = get();
    setUsersLoading(true);
    
    try {
      // 调用fetchDevices获取设备列表
      const { fetchDevices } = get();
      
      // 先保存原始搜索参数
      const originalParams = { ...searchParams };
      
      // 设置获取用户所需的参数（获取大量数据以便提取用户）
      const userSearchParams = {
        page: 1,
        pageSize: 1000,
        ...originalParams
      };
      
      // 临时修改搜索参数
      set({ searchParams: userSearchParams });
      
      // 获取设备列表
      await fetchDevices();
      
      // 从当前设备列表中提取用户信息
      const deviceList = get().devices;
      
      // 使用Set去重
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
      
      // 如果用户太少，添加默认用户
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
      
      // 恢复原始搜索参数
      set({ searchParams: originalParams });
      
    } catch (error) {
      console.error('获取用户列表失败:', error);
      
      // 返回模拟数据
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
    try {
      const detail = await getDeviceDetail(device.deviceId);
      set({ selectedDevice: detail, isEditing: true, formVisible: true });
    } catch {
      message.error('获取设备信息失败');
    }
  },

  handleDeleteDevice: async (deviceId) =>
    new Promise<void>((resolve) => {
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
    }),

  handleAddDevice: () =>
    set({ selectedDevice: null, isEditing: false, formVisible: true }),

  handleUserIdSearch: (value) => {
    const { setUserIdSearch, setSearchParams, fetchDevices } = get();
    setUserIdSearch(value);
    const p = { ...get().searchParams, userId: value.trim() || undefined, page: 1 };
    setSearchParams(p);
    fetchDevices();
  },

  /* 表单提交暂未实现，先空着 */
  // 处理表单提交
  handleFormSubmit: async (values: DeviceListItem) => {
    // message.info('表单提交功能暂未实现');
    // set({ formVisible: false, isEditing: false, selectedDevice: null });

     try {
      const { isEditing, fetchDevices } = get();
      let success;
      
      if (isEditing) {
        // 编辑模式下调用 updateDevice
        success = await updateDevice(values);  
      } else {
        // 新增模式下调用 saveDevice
        success = await saveDevice(values);
      }
      
      if (success) {
        if (isEditing) {
          message.success(`设备 ${values.deviceId} 编辑成功`);
        } else {
          message.success(`设备 ${values.deviceId} 添加成功`);
        }
        
        // 重新加载设备列表
        await fetchDevices();
        
        // 关闭表单
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

  // initialize: async () => {
  //   await get().fetchDevices();
  //   // 下拉、字典、用户接口全部先不调
  //   // await get().fetchFormData();
  //   // await get().fetchFilterOptions();
  // },
  initialize: async () => {
    // 并行获取设备列表和用户列表
    await Promise.all([
      get().fetchDevices(),
      get().fetchUsers()
    ]);
  },
}));