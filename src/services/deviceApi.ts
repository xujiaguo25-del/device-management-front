// services/deviceApi.ts
import type { DeviceFullDTO, DeviceTableData, DeviceQueryParams, PageResponse, DeviceIpDTO, MonitorDTO, DictItem, UserInfo } from '../types/devices';

// 模拟API服务
export const deviceApi = {
  // 获取设备列表（分页）
  async getDevices(params: DeviceQueryParams): Promise<PageResponse<DeviceTableData>> {
    console.log('API调用: getDevices', params);
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 模拟数据
    const mockData: DeviceTableData[] = [
      {
        key: '1',
        deviceId: 'DEV001',
        deviceModel: 'ThinkPad X1 Carbon',
        computerName: 'PC-开发部-001',
        loginUsername: 'zhangsan',
        project: '电商平台',
        devRoom: '301室',
        userId: 'EMP001',
        userName: '张三',
        deptId: 'DEV',
        remark: '开发用主机',
        selfConfirmId: 1,
        selfConfirmStatus: '已确认',
        osId: 1,
        memoryId: 2,
        ssdId: 3,
        hddId: 4,
        ipCount: 2,
        monitorCount: 1,
        ipAddresses: '192.168.1.101, 192.168.1.102',
        monitorNames: 'DELL U2415',
        hardwareSummary: 'Windows 11 | 16GB内存 | 512GB SSD',
        status: '在线',
        tags: ['开发环境', '重要设备'],
        createTime: '2024-01-15T10:30:00',
        creater: 'admin',
        updateTime: '2024-01-20T14:25:00',
        updater: 'admin',
      },
      {
        key: '2',
        deviceId: 'DEV002',
        deviceModel: 'MacBook Pro',
        computerName: 'PC-设计部-001',
        loginUsername: 'lisi',
        project: 'UI设计',
        devRoom: '302室',
        userId: 'EMP002',
        userName: '李四',
        deptId: 'DESIGN',
        remark: '设计专用',
        selfConfirmId: 1,
        selfConfirmStatus: '已确认',
        osId: 2,
        memoryId: 3,
        ssdId: 4,
        hddId: 0,
        ipCount: 1,
        monitorCount: 2,
        ipAddresses: '192.168.1.201',
        monitorNames: 'LG UltraFine 4K, 便携显示器',
        hardwareSummary: 'macOS | 32GB内存 | 1TB SSD',
        status: '在线',
        tags: ['设计专用', '高性能'],
        createTime: '2024-01-16T09:15:00',
        creater: 'admin',
        updateTime: '2024-01-19T11:20:00',
        updater: 'admin',
      },
      {
        key: '3',
        deviceId: 'DEV003',
        deviceModel: 'Dell PowerEdge',
        computerName: '服务器-001',
        loginUsername: 'root',
        project: '基础设施',
        devRoom: '机房A',
        userId: 'SYS001',
        userName: '系统管理员',
        deptId: 'OPS',
        remark: '数据库服务器',
        selfConfirmId: 0,
        selfConfirmStatus: '未确认',
        osId: 3,
        memoryId: 4,
        ssdId: 0,
        hddId: 5,
        ipCount: 3,
        monitorCount: 0,
        ipAddresses: '10.0.0.101, 10.0.0.102, 10.0.0.103',
        monitorNames: '',
        hardwareSummary: 'CentOS 8 | 128GB内存 | 4TB HDD',
        status: '在线',
        tags: ['服务器', '关键设备'],
        createTime: '2024-01-10T08:00:00',
        creater: 'system',
        updateTime: '2024-01-18T16:45:00',
        updater: 'system',
      },
    ];
    
    // 简单的搜索过滤（模拟）
    let filteredData = mockData;
    if (params.deviceName) {
      filteredData = filteredData.filter(item => 
        item.computerName.includes(params.deviceName!) || 
        item.deviceId.includes(params.deviceName!)
      );
    }
    if (params.userId) {
      filteredData = filteredData.filter(item => item.userId.includes(params.userId!));
    }
    if (params.userName) {
      filteredData = filteredData.filter(item => item.userName?.includes(params.userName!));
    }
    if (params.project) {
      filteredData = filteredData.filter(item => item.project.includes(params.project!));
    }
    if (params.devRoom) {
      filteredData = filteredData.filter(item => item.devRoom.includes(params.devRoom!));
    }
    
    const total = filteredData.length;
    const page = params.page || 1;
    const size = params.size || 10;
    const startIndex = (page - 1) * size;
    const endIndex = Math.min(startIndex + size, total);
    const pageData = filteredData.slice(startIndex, endIndex);
    
    return {
      data: pageData,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  },

  // 获取设备详情
  async getDeviceDetail(deviceId: string): Promise<DeviceFullDTO> {
    console.log('API调用: getDeviceDetail', deviceId);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      deviceId,
      deviceModel: 'ThinkPad X1 Carbon',
      computerName: 'PC-开发部-001',
      loginUsername: 'zhangsan',
      project: '电商平台',
      devRoom: '301室',
      userId: 'EMP001',
      remark: '开发用主机',
      selfConfirmId: 1,
      osId: 1,
      memoryId: 2,
      ssdId: 3,
      hddId: 4,
      creater: 'admin',
      updater: 'admin',
      monitors: [
        {
          monitorId: 1,
          monitorName: 'DELL U2415',
          deviceId,
          createTime: '2024-01-15T10:30:00',
          creater: 'admin',
          updateTime: '2024-01-15T10:30:00',
          updater: 'admin',
        },
      ],
      ipAddresses: [
        {
          ipId: 1,
          ipAddress: '192.168.1.101',
          deviceId,
          createTime: '2024-01-15T10:30:00',
          creater: 'admin',
          updateTime: '2024-01-15T10:30:00',
          updater: 'admin',
        },
        {
          ipId: 2,
          ipAddress: '192.168.1.102',
          deviceId,
          createTime: '2024-01-15T10:30:00',
          creater: 'admin',
          updateTime: '2024-01-15T10:30:00',
          updater: 'admin',
        },
      ],
      name: '张三',
      deptId: 'DEV',
    };
  },

  // 新增设备
  async createDevice(deviceData: DeviceFullDTO): Promise<DeviceFullDTO> {
    console.log('API调用: createDevice', deviceData);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      ...deviceData,
      monitors: deviceData.monitors?.map((monitor, index) => ({
        ...monitor,
        monitorId: index + 1,
      })) || [],
      ipAddresses: deviceData.ipAddresses?.map((ip, index) => ({
        ...ip,
        ipId: index + 1,
      })) || [],
    };
  },

  // 更新设备
  async updateDevice(deviceId: string, deviceData: DeviceFullDTO): Promise<DeviceFullDTO> {
    console.log('API调用: updateDevice', deviceId, deviceData);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      ...deviceData,
      deviceId,
      monitors: deviceData.monitors?.map((monitor, index) => ({
        ...monitor,
        monitorId: index + 1,
      })) || [],
      ipAddresses: deviceData.ipAddresses?.map((ip, index) => ({
        ...ip,
        ipId: index + 1,
      })) || [],
    };
  },

  // 删除设备
  async deleteDevice(deviceId: string): Promise<{ success: boolean; message: string }> {
    console.log('API调用: deleteDevice', deviceId);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      message: '设备删除成功（模拟）',
    };
  },

  // 获取字典数据
  async getDictData(dictType: string): Promise<DictItem[]> {
    console.log('API调用: getDictData', dictType);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 模拟字典数据
    const dictData: Record<string, DictItem[]> = {
      OS_TYPE: [
        { dictId: 1, dictType: 'OS_TYPE', dictItemCode: 'WINDOWS_11', dictItemName: 'Windows 11', sortOrder: 1 },
        { dictId: 2, dictType: 'OS_TYPE', dictItemCode: 'WINDOWS_10', dictItemName: 'Windows 10', sortOrder: 2 },
        { dictId: 3, dictType: 'OS_TYPE', dictItemCode: 'MACOS', dictItemName: 'macOS', sortOrder: 3 },
        { dictId: 4, dictType: 'OS_TYPE', dictItemCode: 'UBUNTU', dictItemName: 'Ubuntu', sortOrder: 4 },
        { dictId: 5, dictType: 'OS_TYPE', dictItemCode: 'CENTOS', dictItemName: 'CentOS', sortOrder: 5 },
      ],
      MEMORY_SIZE: [
        { dictId: 1, dictType: 'MEMORY_SIZE', dictItemCode: '8GB', dictItemName: '8GB', sortOrder: 1 },
        { dictId: 2, dictType: 'MEMORY_SIZE', dictItemCode: '16GB', dictItemName: '16GB', sortOrder: 2 },
        { dictId: 3, dictType: 'MEMORY_SIZE', dictItemCode: '32GB', dictItemName: '32GB', sortOrder: 3 },
        { dictId: 4, dictType: 'MEMORY_SIZE', dictItemCode: '64GB', dictItemName: '64GB', sortOrder: 4 },
        { dictId: 5, dictType: 'MEMORY_SIZE', dictItemCode: '128GB', dictItemName: '128GB', sortOrder: 5 },
      ],
      SSD_SIZE: [
        { dictId: 1, dictType: 'SSD_SIZE', dictItemCode: '256GB', dictItemName: '256GB', sortOrder: 1 },
        { dictId: 2, dictType: 'SSD_SIZE', dictItemCode: '512GB', dictItemName: '512GB', sortOrder: 2 },
        { dictId: 3, dictType: 'SSD_SIZE', dictItemCode: '1TB', dictItemName: '1TB', sortOrder: 3 },
        { dictId: 4, dictType: 'SSD_SIZE', dictItemCode: '2TB', dictItemName: '2TB', sortOrder: 4 },
      ],
      HDD_SIZE: [
        { dictId: 1, dictType: 'HDD_SIZE', dictItemCode: '500GB', dictItemName: '500GB', sortOrder: 1 },
        { dictId: 2, dictType: 'HDD_SIZE', dictItemCode: '1TB', dictItemName: '1TB', sortOrder: 2 },
        { dictId: 3, dictType: 'HDD_SIZE', dictItemCode: '2TB', dictItemName: '2TB', sortOrder: 3 },
        { dictId: 4, dictType: 'HDD_SIZE', dictItemCode: '4TB', dictItemName: '4TB', sortOrder: 4 },
      ],
      CONFIRM_STATUS: [
        { dictId: 1, dictType: 'CONFIRM_STATUS', dictItemCode: 'CONFIRMED', dictItemName: '已确认', sortOrder: 1 },
        { dictId: 2, dictType: 'CONFIRM_STATUS', dictItemCode: 'UNCONFIRMED', dictItemName: '未确认', sortOrder: 2 },
      ],
    };
    
    return dictData[dictType] || [];
  },

  // 获取用户列表
  async getUsers(): Promise<UserInfo[]> {
    console.log('API调用: getUsers');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      { userId: 'EMP001', name: '张三', deptId: 'DEV', userName: 'zhangsan' },
      { userId: 'EMP002', name: '李四', deptId: 'DESIGN', userName: 'lisi' },
      { userId: 'EMP003', name: '王五', deptId: 'TEST', userName: 'wangwu' },
      { userId: 'EMP004', name: '赵六', deptId: 'OPS', userName: 'zhaoliu' },
      { userId: 'SYS001', name: '系统管理员', deptId: 'OPS', userName: 'admin' },
    ];
  },
};