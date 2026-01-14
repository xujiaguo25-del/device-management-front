// services/device/deviceService.ts
import type { 
  DeviceListItem, 
  DeviceQueryParams, 
  DeviceApiResponse,
  Monitor,
  DeviceIp 
} from '../../types/device';

// API基础URL - 根据实际后端地址修改
const API_BASE_URL = 'http://localhost:8080'; // 完整后端地址

// 辅助函数：将所有空值转换为"-"，确保返回 string 类型
const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  return String(value);
};

// 转换API返回的数据为前端需要的格式
const transformDeviceData = (apiData: any): DeviceListItem => {
  // 处理嵌套字典值
  const confirmStatus = apiData.selfConfirm?.dictItemName;
  const osName = apiData.os?.dictItemName;
  const memorySize = apiData.memory?.dictItemName;
  const ssdSize = apiData.ssd?.dictItemName;
  const hddSize = apiData.hdd?.dictItemName;
  
  return {
    deviceId: apiData.deviceId || '',
    deviceModel: formatValue(apiData.deviceModel),
    computerName: formatValue(apiData.computerName),
    loginUsername: formatValue(apiData.loginUsername),
    project: formatValue(apiData.project),
    devRoom: formatValue(apiData.devRoom),
    userId: formatValue(apiData.userId),
    remark: formatValue(apiData.remark),
    selfConfirmId: apiData.selfConfirmId || null,
    osId: apiData.osId || null,
    memoryId: apiData.memoryId || null,
    ssdId: apiData.ssdId || null,
    hddId: apiData.hddId || null,
    createTime: formatValue(apiData.createTime),
    creater: formatValue(apiData.creater),
    updateTime: formatValue(apiData.updateTime),
    updater: formatValue(apiData.updater),
    userName: formatValue(apiData.name), // 用户姓名
    deptId: apiData.deptId || null,
    
    // 字典值转换 - 使用 formatValue 确保返回 string 类型
    confirmStatus: formatValue(confirmStatus),
    osName: formatValue(osName),
    memorySize: formatValue(memorySize),
    ssdSize: formatValue(ssdSize),
    hddSize: formatValue(hddSize),
    
    // 数组字段转换
    monitors: (apiData.monitors || []).map((monitor: any) => ({
      monitorId: monitor.monitorId || 0,
      monitorName: formatValue(monitor.monitorName),
      deviceId: apiData.deviceId,
      createTime: formatValue(monitor.createTime),
      creater: formatValue(monitor.creater),
      updateTime: formatValue(monitor.updateTime),
      updater: formatValue(monitor.updater)
    })),
    
    deviceIps: (apiData.deviceIps || []).map((ip: any) => ({
      ipId: ip.ipId || 0,
      ipAddress: formatValue(ip.ipAddress),
      deviceId: apiData.deviceId,
      createTime: formatValue(ip.createTime),
      creater: formatValue(ip.creater),
      updateTime: formatValue(ip.updateTime),
      updater: formatValue(ip.updater)
    }))
  };
};

// 获取设备列表API
export const getDeviceList = async (
  params: DeviceQueryParams
): Promise<DeviceApiResponse<DeviceListItem>> => {
  try {
    console.log('开始获取设备列表，参数:', params);
    
    // 构建查询参数
    const queryParams = new URLSearchParams();
    
    // 添加分页参数
    queryParams.append('page', String(params.page || 1));
    queryParams.append('size', String(params.pageSize || 10));
    
    // 添加筛选参数
    if (params.computerName) {
      // 根据DeviceService.java，后端使用deviceName参数
      queryParams.append('deviceName', params.computerName);
    }
    
    if (params.userId) {
      queryParams.append('userId', params.userId);
    }
    
    // 构建URL - 添加/api前缀
    const url = `${API_BASE_URL}/api/devices?${queryParams.toString()}`;
    console.log('请求URL:', url);
    
    // 调用API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors', // 允许跨域请求
    });
    
    console.log('响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      // 尝试获取错误详情
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.message || JSON.stringify(errorData);
      } catch (e) {
        errorDetail = response.statusText;
      }
      throw new Error(`API请求失败: ${response.status} - ${errorDetail}`);
    }
    
    const result = await response.json();
    console.log('API响应数据:', result);
    
    // 检查API返回的code
    if (result.code !== 200) {
      throw new Error(`API错误: ${result.message || '未知错误'}`);
    }
    
    // 确保data.content存在
    if (!result.data || !result.data.content) {
      console.warn('API返回的数据结构异常:', result);
      return {
        code: 200,
        message: 'success',
        data: {
          list: [],
          total: 0,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      };
    }
    
    // 转换数据格式
    const transformedList = result.data.content.map(transformDeviceData);
    
    return {
      code: 200,
      message: 'success',
      data: {
        list: transformedList,
        total: result.data.totalElements || 0,
        page: (result.data.number || 0) + 1, // 后端从0开始，前端从1开始
        pageSize: result.data.size || 10
      }
    };
  } catch (error) {
    console.error('获取设备列表失败:', error);
    
    // 处理异常，返回错误信息
    const errorMessage = error instanceof Error ? error.message : '网络请求失败';
    
    return {
      code: 500,
      message: errorMessage,
      data: {
        list: [],
        total: 0,
        page: params.page || 1,
        pageSize: params.pageSize || 10
      }
    };
  }
};

// 获取筛选选项
interface FilterOptions {
  projects: string[];
  devRooms: string[];
  confirmStatuses: string[];
}

export const getFilterOptions = async (): Promise<FilterOptions> => {
  try {
    // 先获取一批数据来提取筛选选项
    console.log('开始获取筛选选项');
    const response = await getDeviceList({
      page: 1,
      pageSize: 100 // 获取足够多的数据来提取选项
    });
    
    console.log('获取筛选选项的响应:', response);
    
    if (response.code !== 200 || !response.data || !('list' in response.data)) {
      throw new Error('获取筛选选项失败');
    }
    
    const deviceList = response.data.list;
    
    // 从数据中提取唯一的选项，过滤掉"-"值
    const projects = Array.from(
      new Set(deviceList
        .map(item => item.project)
        .filter(project => project && project !== '-')
      )
    ) as string[];
    
    const devRooms = Array.from(
      new Set(deviceList
        .map(item => item.devRoom)
        .filter(room => room && room !== '-')
      )
    ) as string[];
    
    const confirmStatuses = Array.from(
      new Set(deviceList
        .map(item => item.confirmStatus)
        .filter(status => status && status !== '-')
      )
    ) as string[];
    
    console.log('提取的筛选选项:', { projects, devRooms, confirmStatuses });
    
    return {
      projects,
      devRooms,
      confirmStatuses
    };
  } catch (error) {
    console.error('获取筛选选项失败:', error);
    
    // 返回默认选项
    return {
      projects: [],
      devRooms: [],
      confirmStatuses: []
    };
  }
};

// 获取设备详情（暂时返回空）
export const getDeviceDetail = async (deviceId: string): Promise<DeviceListItem | null> => {
  console.warn('获取设备详情功能暂未实现，deviceId:', deviceId);
  return null;
};

// 删除设备（暂时返回false）
export const deleteDevice = async (deviceId: string): Promise<boolean> => {
  console.warn('删除设备功能暂未实现，deviceId:', deviceId);
  return false;
};