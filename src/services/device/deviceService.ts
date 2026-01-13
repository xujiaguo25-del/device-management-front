// services/device/deviceService.ts
import type { DeviceListItem, DeviceQueryParams, DeviceApiResponse } from '../../types/index';

// 模拟数据
export const mockDeviceData: DeviceListItem[] = [
  {
    deviceId: 'HYRON-1 PC-DC-01',
    monitors: ['HYRON-1 Minibor-01'],
    userId: 'JS0010',
    deviceModel: 'dell-S000',
    computerName: 'DA04-PC-1',
    loginUsername: 'xming',
    ipAddresses: ['192.168.0.1'],
    osName: 'Windows11',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目A',
    devRoom: '开发室A',
    confirmStatus: '已确认',
    remark: '',
    userName: '小娟',
  },
  {
    deviceId: 'HYRON-1 PC-DC-02',
    monitors: ['HYRON-1 Minibor-02'],
    userId: 'JS0011',
    deviceModel: 'dell-S010',
    computerName: 'DA04-PC-2',
    loginUsername: 'zhban',
    ipAddresses: ['192.168.0.2', '192.168.0.11'],
    osName: 'Windows11',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目C',
    devRoom: '开发室C',
    confirmStatus: '已确认',
    remark: '',
    userName: '张三',
  },
  {
    deviceId: 'HYRON-1 PC-DC-03',
    monitors: ['HYRON-1 Minibor-03'],
    userId: 'JS0012',
    deviceModel: 'dell-S020',
    computerName: 'DA04-PC-3',
    loginUsername: 'lisi',
    ipAddresses: ['192.168.0.3'],
    osName: 'Windows11',
    memorySize: '32',
    ssdSize: '512',
    hddSize: '512',
    project: '项目A',
    devRoom: '开发室A',
    confirmStatus: '已确认',
    remark: '',
    userName: '李四',
  },
  {
    deviceId: 'HYRON-1 PC-DC-04',
    monitors: ['HYRON-1 Minibor-04', 'HYRON-1 Minibor-11'],
    userId: 'JS0013',
    deviceModel: 'dell-S030',
    computerName: 'DA04-PC-4',
    loginUsername: 'vangpuu',
    ipAddresses: ['192.168.0.4'],
    osName: 'Windows10',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目B',
    devRoom: '开发室B',
    confirmStatus: '未确认',
    remark: '',
    userName: '王五',
  },
  {
    deviceId: 'HYRON-1 PC-DC-05',
    monitors: ['HYRON-1 Minibor-05'],
    userId: 'JS0014',
    deviceModel: 'dell-S040',
    computerName: 'DA04-PC-5',
    loginUsername: 'nuke',
    ipAddresses: ['192.168.0.5'],
    osName: 'Windows11',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目D',
    devRoom: '开发室D',
    confirmStatus: '已确认',
    remark: '',
    userName: '李松',
  },
  {
    deviceId: 'HYRON-1 PC-DC-06',
    monitors: ['HYRON-1 Minibor-06'],
    userId: 'JS0015',
    deviceModel: 'Mac mini',
    computerName: 'DA04-PC-6',
    loginUsername: 'auxc',
    ipAddresses: ['192.168.0.6', '192.168.0.12', '192.168.0.13'],
    osName: 'Mac OS',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目C',
    devRoom: '开发室C',
    confirmStatus: '未确认',
    remark: '',
    userName: '李雪',
  },
  {
    deviceId: 'HYRON-1 PC-DC-07',
    monitors: ['HYRON-1 Minibor-07'],
    userId: 'JS0016',
    deviceModel: 'dell-S050',
    computerName: 'DA04-PC-7',
    loginUsername: 'jahr',
    ipAddresses: ['192.168.0.7'],
    osName: 'Windows11',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '1024',
    project: '项目A',
    devRoom: '开发室A',
    confirmStatus: '已确认',
    remark: '',
    userName: '韩海峰',
  },
  {
    deviceId: 'HYRON-1 PC-DC-08',
    monitors: ['HYRON-1 Minibor-08'],
    userId: 'JS0017',
    deviceModel: 'dell-S060',
    computerName: 'DA04-PC-8',
    loginUsername: 'heyh',
    ipAddresses: ['192.168.0.8'],
    osName: 'Windows10',
    memorySize: '32',
    ssdSize: '1024',
    hddSize: '—',
    project: '项目B',
    devRoom: '开发室B',
    confirmStatus: '已确认',
    remark: '',
    userName: '小红',
  },
  {
    deviceId: 'HYRON-1 PC-DC-09',
    monitors: ['HYRON-1 Minibor-09'],
    userId: 'JS0018',
    deviceModel: 'dell-S070',
    computerName: 'DA04-PC-9',
    loginUsername: 'li',
    ipAddresses: ['192.168.0.9'],
    osName: 'Windows11',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目D',
    devRoom: '开发室D',
    confirmStatus: '已确认',
    remark: '',
    userName: '小芳',
  },
  {
    deviceId: 'HYRON-1 PC-DC-10',
    monitors: ['HYRON-1 Minibor-10'],
    userId: 'JS0019',
    deviceModel: 'dell-S080',
    computerName: 'DA04-PC-10',
    loginUsername: 'zhub',
    ipAddresses: ['192.168.0.10'],
    osName: 'Windows11',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目A',
    devRoom: '开发室A',
    confirmStatus: '已确认',
    remark: '',
    userName: '小李',
  },
  {
    deviceId: 'HYRON-1 PC-DC-11',
    monitors: ['HYRON-1 Minibor-11'],
    userId: 'JS0020',
    deviceModel: 'dell-S090',
    computerName: 'DA04-PC-11',
    loginUsername: 'zhub',
    ipAddresses: ['192.168.0.13'],
    osName: 'Windows11',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目A',
    devRoom: '开发室A',
    confirmStatus: '已确认',
    remark: '',
    userName: '老丁',
  },
  {
    deviceId: 'HYRON-1 PC-DC-12',
    monitors: ['HYRON-1 Minibor-12'],
    userId: 'JS0021',
    deviceModel: 'dell-S100',
    computerName: 'DA04-PC-12',
    loginUsername: 'zhub',
    ipAddresses: ['192.168.0.14'],
    osName: 'Windows11',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目A',
    devRoom: '开发室A',
    confirmStatus: '已确认',
    remark: '',
    userName: '老张',
  },
  {
    deviceId: 'HYRON-1 PC-DC-13',
    monitors: ['HYRON-1 Minibor-13'],
    userId: 'JS0022',
    deviceModel: 'dell-S110',
    computerName: 'DA04-PC-13',
    loginUsername: 'zhub',
    ipAddresses: ['192.168.0.15'],
    osName: 'Windows11',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目C',
    devRoom: '开发室B',
    confirmStatus: '已确认',
    remark: '',
    userName: '老刘',
  },
];

// 模拟 API 获取设备列表
export const getDeviceList = async (
  params: DeviceQueryParams
): Promise<DeviceApiResponse<DeviceListItem>> => {
  // 模拟网络延迟
  //await new Promise(resolve => setTimeout(resolve, 500));
  
  const {
    page = 1,
    pageSize = 10,
    computerName,
    project,
    devRoom,
    confirmStatus
  } = params;
  
  // 过滤数据
  let filteredData = mockDeviceData;
  
  if (computerName) {
    filteredData = filteredData.filter(item => 
      item.computerName?.toLowerCase().includes(computerName.toLowerCase()) ||
      item.deviceId?.toLowerCase().includes(computerName.toLowerCase()) ||
      item.userName?.toLowerCase().includes(computerName.toLowerCase()) ||
      item.userId?.toLowerCase().includes(computerName.toLowerCase())
    );
  }
  
  if (project && project !== 'all') {
    filteredData = filteredData.filter(item => item.project === project);
  }
  
  if (devRoom && devRoom !== 'all') {
    filteredData = filteredData.filter(item => item.devRoom === devRoom);
  }
  
  if (confirmStatus && confirmStatus !== 'all') {
    filteredData = filteredData.filter(item => item.confirmStatus === confirmStatus);
  }
  
  // 分页处理
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  
  return {
    code: 200,
    message: 'success',
    data: {
      list: paginatedData,
      total: filteredData.length,
      page,
      pageSize
    }
  };
};

//获取筛选选项
export const getFilterOptions = async () => {
  // 从数据中提取唯一的选项
  const projects = Array.from(new Set(mockDeviceData.map(item => item.project).filter(Boolean))) as string[];
  const devRooms = Array.from(new Set(mockDeviceData.map(item => item.devRoom).filter(Boolean))) as string[];
  const confirmStatuses = Array.from(new Set(mockDeviceData.map(item => item.confirmStatus).filter(Boolean))) as string[];
  
  return {
    projects,
    devRooms,
    confirmStatuses
  };
};

// 模拟 API 获取设备详情
export const getDeviceDetail = async (deviceId: string): Promise<DeviceListItem | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const device = mockDeviceData.find(item => item.deviceId === deviceId);
  return device || null;
};

// 模拟 API 删除设备
export const deleteDevice = async (deviceId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 在实际项目中，这里会调用真正的 API
  // 模拟删除：在 mock 数据中移除指定 deviceId
  const index = mockDeviceData.findIndex(item => item.deviceId === deviceId);
  if (index !== -1) {
    mockDeviceData.splice(index, 1);
    return true;
  }
  return false;
};