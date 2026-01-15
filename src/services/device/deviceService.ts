// services/device/deviceService.ts
import type { 
  DeviceListItem, 
  DeviceQueryParams, 
  DeviceApiResponse,
  Monitor,
  DeviceIp 
} from '../../types/device';

// API基础URL
const API_BASE_URL = 'http://localhost:8080/api';

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
  const confirmStatus = apiData.selfConfirm?.dictItemName || apiData.selfConfirmDict?.dictItemName;
  const osName = apiData.os?.dictItemName || apiData.osDict?.dictItemName;
  const memorySize = apiData.memory?.dictItemName || apiData.memoryDict?.dictItemName;
  const ssdSize = apiData.ssd?.dictItemName || apiData.ssdDict?.dictItemName;
  const hddSize = apiData.hdd?.dictItemName || apiData.hddDict?.dictItemName;
  
  // 处理用户信息
  const userName = apiData.name || apiData.userName || apiData.userInfo?.userName;
  const userId = apiData.userId || apiData.userInfo?.userId;
  const deptId = apiData.deptId || apiData.userInfo?.deptId;
  
  // 处理硬件摘要（如果存在）
  const hardwareSummary = apiData.hardwareSummary;
  
  return {
    deviceId: apiData.deviceId || '',
    deviceModel: formatValue(apiData.deviceModel),
    computerName: formatValue(apiData.computerName),
    loginUsername: formatValue(apiData.loginUsername),
    project: formatValue(apiData.project),
    devRoom: formatValue(apiData.devRoom),
    userId: formatValue(userId),
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
    userName: formatValue(userName),
    deptId: deptId || null,
    
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
    
    // 添加筛选参数 - 支持多种筛选条件
    if (params.userId) {
      queryParams.append('userId', params.userId);
    }
    
    // 添加项目筛选参数
    if (params.project) {
      queryParams.append('project', params.project);
    }
    
    // 添加开发室筛选参数
    if (params.devRoom) {
      queryParams.append('devRoom', params.devRoom);
    }
    
    // 注意：根据DeviceService.java，后端使用的是deviceName参数
    if (params.computerName) {
      queryParams.append('deviceName', params.computerName);
    }
    
    // 构建URL
    const url = `${API_BASE_URL}/devices?${queryParams.toString()}`;
    console.log('请求URL:', url);
    
    // 调用API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
    });
    
    console.log('响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      // 根据后端异常处理，这里可能是400或500错误
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.message || JSON.stringify(errorData);
      } catch (e) {
        errorDetail = response.statusText;
      }
      
      // 处理特定状态码
      if (response.status === 404) {
        throw new Error(`找不到设备: ${errorDetail}`);
      } else if (response.status === 400) {
        throw new Error(`请求参数错误: ${errorDetail}`);
      } else {
        throw new Error(`API请求失败: ${response.status} - ${errorDetail}`);
      }
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
        page: (result.data.number || 0) + 1,
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

// 获取设备详情API
export const getDeviceDetail = async (deviceId: string): Promise<DeviceListItem | null> => {
  try {
    if (!deviceId?.trim()) {
      throw new Error('设备ID不能为空');
    }
    
    console.log('开始获取设备详情，deviceId:', deviceId);
    
    // 构建URL - 对设备ID进行URL编码，因为可能包含空格
    const encodedDeviceId = encodeURIComponent(deviceId.trim());
    const url = `${API_BASE_URL}/devices/${encodedDeviceId}`;
    console.log('请求URL:', url);
    
    // 调用API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
    });
    
    console.log('响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      // 处理特定状态码
      if (response.status === 404) {
        throw new Error(`设备 ${deviceId} 不存在`);
      } else if (response.status === 400) {
        throw new Error('设备ID参数错误');
      } else {
        throw new Error(`获取设备详情失败: ${response.status}`);
      }
    }
    
    const result = await response.json();
    console.log('设备详情响应数据:', result);
    
    // 检查API返回的code
    if (result.code !== 200) {
      throw new Error(`API错误: ${result.message || '未知错误'}`);
    }
    
    if (!result.data) {
      throw new Error('设备数据为空');
    }
    
    // 转换数据格式
    return transformDeviceData(result.data);
    
  } catch (error) {
    console.error('获取设备详情失败:', error);
    const errorMessage = error instanceof Error ? error.message : '获取设备详情失败';
    
    // 抛出错误，让调用者处理
    throw new Error(errorMessage);
  }
};

// 删除设备API
export const deleteDevice = async (deviceId: string): Promise<boolean> => {
  try {
    if (!deviceId?.trim()) {
      throw new Error('设备ID不能为空');
    }
    
    console.log('开始删除设备，deviceId:', deviceId);
    
    // 构建URL - 对设备ID进行URL编码
    const encodedDeviceId = encodeURIComponent(deviceId.trim());
    const url = `${API_BASE_URL}/devices/${encodedDeviceId}`;
    console.log('请求URL:', url);
    
    // 调用API - 使用DELETE方法
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
    });
    
    console.log('删除响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      // 处理特定状态码
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.message || JSON.stringify(errorData);
      } catch (e) {
        errorDetail = response.statusText;
      }
      
      if (response.status === 404) {
        throw new Error(`设备 ${deviceId} 不存在`);
      } else if (response.status === 400) {
        throw new Error(`请求参数错误: ${errorDetail}`);
      } else if (response.status === 500) {
        throw new Error(`服务器错误: ${errorDetail}`);
      } else {
        throw new Error(`删除设备失败: ${response.status} - ${errorDetail}`);
      }
    }
    
    const result = await response.json();
    console.log('删除响应数据:', result);
    
    // 检查API返回的code
    if (result.code === 200) {
      console.log(`设备 ${deviceId} 删除成功`);
      return true;
    } else {
      console.error('删除设备失败，API返回错误:', result.message);
      throw new Error(`删除失败: ${result.message || '未知错误'}`);
    }
    
  } catch (error) {
    console.error('删除设备失败:', error);
    const errorMessage = error instanceof Error ? error.message : '删除设备失败';
    
    // 抛出错误，让调用者处理
    throw new Error(errorMessage);
  }
};

// 不再需要getFilterOptions函数，因为我们现在从设备列表中动态提取选项