import { create } from 'zustand';
import { message, Modal } from 'antd';
import type {
  DeviceListItem,
  DeviceQueryParams,
  DeviceIp,
  Monitor
} from '../types/device';
import {
  getDeviceList,
  deleteDevice,
  getDeviceDetail,
  getProjectOptions,
  getDevRoomOptions
} from '../services/device/deviceService';
import {
  fetchDictData,
  fetchUsers,
  saveDevice as saveDeviceService,
  updateDevice as updateDeviceService
} from '../services/device/deviceFormService';

interface DeviceStore {
  // 状态
  devices: DeviceListItem[];
  loading: boolean;
  searchParams: DeviceQueryParams;
  total: number;
  formVisible: boolean;
  isEditing: boolean;
  selectedDevice: DeviceListItem | null;
  dictData: Record<string, any[]>;
  users: Array<{ userId: string; name: string; deptId?: string }>;
  projectOptions: string[];
  devRoomOptions: string[];
  userIdSearch: string;
  projectFilter: string;
  devRoomFilter: string;

  // Actions
  setDevices: (devices: DeviceListItem[]) => void;
  setLoading: (loading: boolean) => void;
  setSearchParams: (params: DeviceQueryParams) => void;
  setTotal: (total: number) => void;
  setFormVisible: (visible: boolean) => void;
  setIsEditing: (editing: boolean) => void;
  setSelectedDevice: (device: DeviceListItem | null) => void;
  setDictData: (data: Record<string, any[]>) => void;
  setUsers: (users: Array<{ userId: string; name: string; deptId?: string }>) => void;
  setProjectOptions: (options: string[]) => void;
  setDevRoomOptions: (options: string[]) => void;
  setUserIdSearch: (search: string) => void;
  setProjectFilter: (filter: string) => void;
  setDevRoomFilter: (filter: string) => void;

  // 异步 Actions
  fetchDevices: () => Promise<void>;
  fetchFilterOptions: () => Promise<void>;
  fetchFormData: () => Promise<void>;
  handlePageChange: (page: number, pageSize?: number) => void;
  handlePageSizeChange: (size: number) => void;
  handleEditDevice: (device: DeviceListItem) => Promise<void>;
  handleDeleteDevice: (deviceId: string) => Promise<void>;
  handleAddDevice: () => void;
  handleUserIdSearch: (value: string) => void;
  handleProjectChange: (value: string) => void;
  handleDevRoomChange: (value: string) => void;
  handleReset: () => void;
  handleFormSubmit: (values: DeviceListItem) => Promise<void>;

  // 初始化
  initialize: () => Promise<void>;
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  // 初始状态
  devices: [],
  loading: false,
  searchParams: {
    page: 1,
    pageSize: 10,
  },
  total: 0,
  formVisible: false,
  isEditing: false,
  selectedDevice: null,
  dictData: {},
  users: [],
  projectOptions: [],
  devRoomOptions: [],
  userIdSearch: '',
  projectFilter: 'all',
  devRoomFilter: 'all',

  // 设置状态的 Actions
  setDevices: (devices) => set({ devices }),
  setLoading: (loading) => set({ loading }),
  setSearchParams: (searchParams) => set({ searchParams }),
  setTotal: (total) => set({ total }),
  setFormVisible: (formVisible) => set({ formVisible }),
  setIsEditing: (isEditing) => set({ isEditing }),
  setSelectedDevice: (selectedDevice) => set({ selectedDevice }),
  setDictData: (dictData) => set({ dictData }),
  setUsers: (users) => set({ users }),
  setProjectOptions: (projectOptions) => set({ projectOptions }),
  setDevRoomOptions: (devRoomOptions) => set({ devRoomOptions }),
  setUserIdSearch: (userIdSearch) => set({ userIdSearch }),
  setProjectFilter: (projectFilter) => set({ projectFilter }),
  setDevRoomFilter: (devRoomFilter) => set({ devRoomFilter }),

  // 获取设备列表
  fetchDevices: async () => {
    const { searchParams, setLoading, setDevices, setTotal } = get();
    setLoading(true);
    try {
      console.log('开始获取设备列表，参数:', searchParams);
      const response = await getDeviceList(searchParams);
      console.log('获取到的设备列表响应:', response);

      if (response.code === 200 && response.data) {
        let deviceList: DeviceListItem[] = [];
        let totalCount = 0;

        if ('list' in response.data) {
          deviceList = response.data.list || [];
          totalCount = response.data.total || 0;
          console.log(`获取到设备列表: ${deviceList.length} 条，总计: ${totalCount}`);
        } else if (Array.isArray(response.data)) {
          deviceList = response.data;
          totalCount = response.data.length;
        } else {
          console.warn('未知的数据格式:', response.data);
        }

        setDevices(deviceList);
        setTotal(totalCount);
      } else {
        console.error('获取设备列表失败:', response.message);
        message.error(`获取设备列表失败: ${response.message}`);
        setDevices([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('获取设备列表失败:', error);
      message.error('获取设备列表失败');
      setDevices([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  },

  // 获取筛选选项
  fetchFilterOptions: async () => {
    const { setProjectOptions, setDevRoomOptions, devices } = get();
    try {
      const [projects, devRooms] = await Promise.all([
        getProjectOptions(),
        getDevRoomOptions()
      ]);
      setProjectOptions(projects);
      setDevRoomOptions(devRooms);
      console.log('获取到项目选项:', projects);
      console.log('获取到开发室选项:', devRooms);
    } catch (error) {
      console.error('获取筛选选项失败:', error);
      message.warning('获取筛选选项失败，将使用本地选项');
      
      // 从现有设备中提取作为后备
      const localProjects = devices
        .map(device => device.project)
        .filter((project): project is string => 
          project !== null && project !== undefined && project !== '-'
        );
      const localDevRooms = devices
        .map(device => device.devRoom)
        .filter((devRoom): devRoom is string => 
          devRoom !== null && devRoom !== undefined && devRoom !== '-'
        );

      setProjectOptions([...new Set(localProjects)]);
      setDevRoomOptions([...new Set(localDevRooms)]);
    }
  },

  // 获取表单数据
  fetchFormData: async () => {
    const { setDictData, setUsers } = get();
    try {
      const [dictDataResult, usersResult] = await Promise.all([
        fetchDictData(),
        fetchUsers()
      ]);
      setDictData(dictDataResult);
      setUsers(usersResult);
    } catch (error) {
      console.error('获取表单数据失败:', error);
      message.error('获取表单数据失败');
    }
  },

  // 分页处理
  handlePageChange: (page: number, pageSize?: number) => {
    const { searchParams, setSearchParams, fetchDevices } = get();
    const newParams = {
      ...searchParams,
      page,
      pageSize: pageSize || searchParams.pageSize,
    };
    setSearchParams(newParams);
    // 注意：由于 setSearchParams 是异步的，这里需要手动触发 fetchDevices
    fetchDevices();
  },

  handlePageSizeChange: (size: number) => {
    const { searchParams, setSearchParams, fetchDevices } = get();
    const newParams = {
      ...searchParams,
      page: 1,
      pageSize: size,
    };
    setSearchParams(newParams);
    // 注意：由于 setSearchParams 是异步的，这里需要手动触发 fetchDevices
    fetchDevices();
  },

  // 编辑设备
  handleEditDevice: async (device: DeviceListItem) => {
    const { setSelectedDevice, setIsEditing, setFormVisible } = get();
    try {
      const deviceDetail = await getDeviceDetail(device.deviceId);
      if (deviceDetail) {
        setSelectedDevice(deviceDetail);
        setIsEditing(true);
        setFormVisible(true);
      } else {
        message.error('获取设备信息失败');
      }
    } catch (error) {
      message.error('获取设备信息失败');
      console.error('获取设备信息失败:', error);
    }
  },

  // 删除设备
  handleDeleteDevice: async (deviceId: string) => {
    const { fetchDevices, searchParams } = get();
    return new Promise<void>((resolve) => {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除设备 ${deviceId} 吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          try {
            const success = await deleteDevice(deviceId);
            if (success) {
              await fetchDevices();
              message.success(`设备 ${deviceId} 删除成功`);
            } else {
              message.error('删除设备失败，设备不存在');
            }
          } catch (error) {
            message.error('删除设备失败');
            console.error('删除设备失败:', error);
          }
          resolve();
        },
        onCancel: () => {
          resolve();
        }
      });
    });
  },

  // 添加设备
  handleAddDevice: () => {
    const { setSelectedDevice, setIsEditing, setFormVisible } = get();
    setSelectedDevice(null);
    setIsEditing(false);
    setFormVisible(true);
  },

  // 搜索和筛选
  handleUserIdSearch: (value: string) => {
    const { searchParams, setSearchParams, fetchDevices, setUserIdSearch } = get();
    setUserIdSearch(value);
    const newParams = {
      ...searchParams,
      userId: value.trim() || undefined,
      page: 1,
    };
    setSearchParams(newParams);
    fetchDevices();
  },

  handleProjectChange: (value: string) => {
    const { searchParams, setSearchParams, setProjectFilter, fetchDevices } = get();
    setProjectFilter(value);
    const newParams = {
      ...searchParams,
      project: value === 'all' ? undefined : value,
      page: 1,
    };
    setSearchParams(newParams);
    fetchDevices();
  },

  handleDevRoomChange: (value: string) => {
    const { searchParams, setSearchParams, setDevRoomFilter, fetchDevices } = get();
    setDevRoomFilter(value);
    const newParams = {
      ...searchParams,
      devRoom: value === 'all' ? undefined : value,
      page: 1,
    };
    setSearchParams(newParams);
    fetchDevices();
  },

  // 重置筛选
  handleReset: () => {
    const { setUserIdSearch, setProjectFilter, setDevRoomFilter, setSearchParams, fetchDevices } = get();
    setUserIdSearch('');
    setProjectFilter('all');
    setDevRoomFilter('all');
    
    const newParams = {
      page: 1,
      pageSize: 10,
      userId: undefined,
      project: undefined,
      devRoom: undefined,
      computerName: undefined,
    };
    setSearchParams(newParams);
    fetchDevices();
  },

  // 表单提交
  handleFormSubmit: async (values: DeviceListItem) => {
    const { isEditing, searchParams, setFormVisible, setIsEditing, setSelectedDevice, fetchDevices } = get();
    try {
      let success;
      if (isEditing) {
        success = await updateDeviceService(values);
      } else {
        success = await saveDeviceService(values);
      }
      
      if (success) {
        if (isEditing) {
          message.success(`设备 ${values.deviceId} 编辑成功`);
        } else {
          message.success(`设备 ${values.deviceId} 添加成功`);
        }
        
        await fetchDevices();
        setFormVisible(false);
        setIsEditing(false);
        setSelectedDevice(null);
      } else {
        message.error('操作失败');
      }
    } catch (error) {
      message.error('操作失败');
      console.error('操作失败:', error);
    }
  },

  // 初始化
  initialize: async () => {
    const { fetchDevices, fetchFormData, fetchFilterOptions } = get();
    await fetchDevices();
    await fetchFormData();
    await fetchFilterOptions();
  },
}));
