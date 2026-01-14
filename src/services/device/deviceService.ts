// services/device/deviceService.ts
import type { 
  DeviceListItem, 
  DeviceQueryParams, 
  DeviceApiResponse, 
  Monitor,
  DeviceIp 
} from '../../types/device';

// 模拟数据 - 作为应用的数据源
const mockDeviceData: DeviceListItem[] = [
  {
    deviceId: 'HYRON-1 PC-DC-01',
    monitors: [{ monitorName: 'HYRON-1 Minibor-01', deviceId: 'HYRON-1 PC-DC-01' }],
    deviceIps: [{ ipAddress: '192.168.0.1', deviceId: 'HYRON-1 PC-DC-01' }],
    userId: 'JS0010',
    userName: '小娟',
    deviceModel: 'dell-S000',
    computerName: 'DA04-PC-1',
    loginUsername: 'xming',
    osName: 'Windows11',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目A',
    devRoom: '开发室A',
    confirmStatus: '已确认',
    remark: '备注',
    selfConfirmId: 1,
    osId: 1,
    memoryId: 16,
    ssdId: 512,
    hddId: 0,
  },
  {
    deviceId: 'HYRON-1 PC-DC-02',
    monitors: [{ monitorName: 'HYRON-1 Minibor-02', deviceId: 'HYRON-1 PC-DC-02' }],
    deviceIps: [
      { ipAddress: '192.168.0.2', deviceId: 'HYRON-1 PC-DC-02' },
      { ipAddress: '192.168.0.11', deviceId: 'HYRON-1 PC-DC-02' }
    ],
    userId: 'JS0011',
    userName: '张三',
    deviceModel: 'dell-S010',
    computerName: 'DA04-PC-2',
    loginUsername: 'zhban',
    osName: 'Windows11',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目C',
    devRoom: '开发室C',
    confirmStatus: '已确认',
    remark: '备注',
    selfConfirmId: 1,
    osId: 1,
    memoryId: 16,
    ssdId: 512,
    hddId: 0,
  },
  {
    deviceId: 'HYRON-1 PC-DC-03',
    monitors: [{ monitorName: 'HYRON-1 Minibor-03', deviceId: 'HYRON-1 PC-DC-03' }],
    deviceIps: [{ ipAddress: '192.168.0.3', deviceId: 'HYRON-1 PC-DC-03' }],
    userId: 'JS0012',
    userName: '李四',
    deviceModel: 'dell-S020',
    computerName: 'DA04-PC-3',
    loginUsername: 'lisi',
    osName: 'Windows11',
    memorySize: '32',
    ssdSize: '512',
    hddSize: '512',
    project: '项目A',
    devRoom: '开发室A',
    confirmStatus: '已确认',
    remark: '备注',
    selfConfirmId: 1,
    osId: 1,
    memoryId: 32,
    ssdId: 512,
    hddId: 512,
  },
  {
    deviceId: 'HYRON-1 PC-DC-04',
    monitors: [
      { monitorName: 'HYRON-1 Minibor-04', deviceId: 'HYRON-1 PC-DC-04' },
      { monitorName: 'HYRON-1 Minibor-11', deviceId: 'HYRON-1 PC-DC-04' }
    ],
    deviceIps: [{ ipAddress: '192.168.0.4', deviceId: 'HYRON-1 PC-DC-04' }],
    userId: 'JS0013',
    userName: '王五',
    deviceModel: 'dell-S030',
    computerName: 'DA04-PC-4',
    loginUsername: 'vangpuu',
    osName: 'Windows10',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目B',
    devRoom: '开发室B',
    confirmStatus: '未确认',
    remark: '备注',
    selfConfirmId: 0,
    osId: 2,
    memoryId: 16,
    ssdId: 512,
    hddId: 0,
  },
  {
    deviceId: 'HYRON-1 PC-DC-05',
    monitors: [{ monitorName: 'HYRON-1 Minibor-05', deviceId: 'HYRON-1 PC-DC-05' }],
    deviceIps: [{ ipAddress: '192.168.0.5', deviceId: 'HYRON-1 PC-DC-05' }],
    userId: 'JS0014',
    userName: '李松',
    deviceModel: 'dell-S040',
    computerName: 'DA04-PC-5',
    loginUsername: 'nuke',
    osName: 'Windows11',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目D',
    devRoom: '开发室D',
    confirmStatus: '已确认',
    remark: '备注',
    selfConfirmId: 1,
    osId: 1,
    memoryId: 16,
    ssdId: 512,
    hddId: 0,
  },
  {
    deviceId: 'HYRON-1 PC-DC-06',
    monitors: [{ monitorName: 'HYRON-1 Minibor-06', deviceId: 'HYRON-1 PC-DC-06' }],
    deviceIps: [
      { ipAddress: '192.168.0.6', deviceId: 'HYRON-1 PC-DC-06' },
      { ipAddress: '192.168.0.12', deviceId: 'HYRON-1 PC-DC-06' },
      { ipAddress: '192.168.0.13', deviceId: 'HYRON-1 PC-DC-06' }
    ],
    userId: 'JS0015',
    userName: '李雪',
    deviceModel: 'Mac mini',
    computerName: 'DA04-PC-6',
    loginUsername: 'auxc',
    osName: 'Mac OS',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目C',
    devRoom: '开发室C',
    confirmStatus: '未确认',
    remark: '备注',
    selfConfirmId: 0,
    osId: 3,
    memoryId: 16,
    ssdId: 512,
    hddId: 0,
  },
  {
    deviceId: 'HYRON-1 PC-DC-07',
    monitors: [{ monitorName: 'HYRON-1 Minibor-07', deviceId: 'HYRON-1 PC-DC-07' }],
    deviceIps: [{ ipAddress: '192.168.0.7', deviceId: 'HYRON-1 PC-DC-07' }],
    userId: 'JS0016',
    userName: '韩海峰',
    deviceModel: 'dell-S050',
    computerName: 'DA04-PC-7',
    loginUsername: 'jahr',
    osName: 'Windows11',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '1024',
    project: '项目A',
    devRoom: '开发室A',
    confirmStatus: '已确认',
    remark: '备注',
    selfConfirmId: 1,
    osId: 1,
    memoryId: 16,
    ssdId: 512,
    hddId: 1024,
  },
  {
    deviceId: 'HYRON-1 PC-DC-08',
    monitors: [{ monitorName: 'HYRON-1 Minibor-08', deviceId: 'HYRON-1 PC-DC-08' }],
    deviceIps: [{ ipAddress: '192.168.0.8', deviceId: 'HYRON-1 PC-DC-08' }],
    userId: 'JS0017',
    userName: '小红',
    deviceModel: 'dell-S060',
    computerName: 'DA04-PC-8',
    loginUsername: 'heyh',
    osName: 'Windows10',
    memorySize: '32',
    ssdSize: '1024',
    hddSize: '—',
    project: '项目B',
    devRoom: '开发室B',
    confirmStatus: '已确认',
    remark: '备注',
    selfConfirmId: 1,
    osId: 2,
    memoryId: 32,
    ssdId: 1024,
    hddId: 0,
  },
  {
    deviceId: 'HYRON-1 PC-DC-09',
    monitors: [{ monitorName: 'HYRON-1 Minibor-09', deviceId: 'HYRON-1 PC-DC-09' }],
    deviceIps: [{ ipAddress: '192.168.0.9', deviceId: 'HYRON-1 PC-DC-09' }],
    userId: 'JS0018',
    userName: '小芳',
    deviceModel: 'dell-S070',
    computerName: 'DA04-PC-9',
    loginUsername: 'li',
    osName: 'Windows11',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目D',
    devRoom: '开发室D',
    confirmStatus: '已确认',
    remark: '备注',
    selfConfirmId: 1,
    osId: 1,
    memoryId: 16,
    ssdId: 512,
    hddId: 0,
  },
  {
    deviceId: 'HYRON-1 PC-DC-10',
    monitors: [{ monitorName: 'HYRON-1 Minibor-10', deviceId: 'HYRON-1 PC-DC-10' }],
    deviceIps: [{ ipAddress: '192.168.0.10', deviceId: 'HYRON-1 PC-DC-10' }],
    userId: 'JS0019',
    userName: '小李',
    deviceModel: 'dell-S080',
    computerName: 'DA04-PC-10',
    loginUsername: 'zhub',
    osName: 'Windows11',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目A',
    devRoom: '开发室A',
    confirmStatus: '已确认',
    remark: '备注',
    selfConfirmId: 1,
    osId: 1,
    memoryId: 16,
    ssdId: 512,
    hddId: 0,
  },
  {
    deviceId: 'HYRON-1 PC-DC-11',
    monitors: [{ monitorName: 'HYRON-1 Minibor-11', deviceId: 'HYRON-1 PC-DC-11' }],
    deviceIps: [{ ipAddress: '192.168.0.13', deviceId: 'HYRON-1 PC-DC-11' }],
    userId: 'JS0020',
    userName: '老丁',
    deviceModel: 'dell-S090',
    computerName: 'DA04-PC-11',
    loginUsername: 'zhub',
    osName: 'Windows11',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目A',
    devRoom: '开发室A',
    confirmStatus: '已确认',
    remark: '备注',
    selfConfirmId: 1,
    osId: 1,
    memoryId: 16,
    ssdId: 512,
    hddId: 0,
  },
  {
    deviceId: 'HYRON-1 PC-DC-12',
    monitors: [{ monitorName: 'HYRON-1 Minibor-12', deviceId: 'HYRON-1 PC-DC-12' }],
    deviceIps: [{ ipAddress: '192.168.0.14', deviceId: 'HYRON-1 PC-DC-12' }],
    userId: 'JS0021',
    userName: '老张',
    deviceModel: 'dell-S100',
    computerName: 'DA04-PC-12',
    loginUsername: 'zhub',
    osName: 'Windows11',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目A',
    devRoom: '开发室A',
    confirmStatus: '已确认',
    remark: '备注',
    selfConfirmId: 1,
    osId: 1,
    memoryId: 16,
    ssdId: 512,
    hddId: 0,
  },
  {
    deviceId: 'HYRON-1 PC-DC-13',
    monitors: [{ monitorName: 'HYRON-1 Minibor-13', deviceId: 'HYRON-1 PC-DC-13' }],
    deviceIps: [{ ipAddress: '192.168.0.15', deviceId: 'HYRON-1 PC-DC-13' }],
    userId: 'JS0022',
    userName: '老刘',
    deviceModel: 'dell-S110',
    computerName: 'DA04-PC-13',
    loginUsername: 'zhub',
    osName: 'Windows11',
    memorySize: '16',
    ssdSize: '512',
    hddSize: '—',
    project: '项目C',
    devRoom: '开发室B',
    confirmStatus: '已确认',
    remark: '备注',
    selfConfirmId: 1,
    osId: 1,
    memoryId: 16,
    ssdId: 512,
    hddId: 0,
  },
];

// 模拟 API 获取设备列表
export const getDeviceList = async (
  params: DeviceQueryParams
): Promise<DeviceApiResponse<DeviceListItem>> => {
  // 模拟网络延迟
  //await new Promise(resolve => setTimeout(resolve, 300));
  
  const {
    page = 1,
    pageSize = 10,
    computerName,
    project,
    devRoom,
    confirmStatus
  } = params;
  
  // 过滤数据
  let filteredData = [...mockDeviceData];
  
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
  
  // 明确返回分页格式的数据
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

// 获取筛选选项
interface FilterOptions {
  projects: string[];
  devRooms: string[];
  confirmStatuses: string[];
}

export const getFilterOptions = async (): Promise<FilterOptions> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
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

// 获取设备详情
export const getDeviceDetail = async (deviceId: string): Promise<DeviceListItem | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const device = mockDeviceData.find(item => item.deviceId === deviceId);
  
  if (!device) {
    return null;
  }
  
  return device;
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