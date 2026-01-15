// 给数据做定义
export interface SecurityCheckRecord {
  samplingId: string;
  userId: string;
  name: string;
  deviceId: string;
  hostId: string;
  monitorId: string;

  bootAuthentication: boolean;
  securityPatch: boolean;
  screenSaverPwd: boolean;
  antivirusProtection: boolean;
  installedSoftware: boolean;
  usbInterface: boolean;

  disposalMeasures?: string; // 标上问号?,是可选的
}

//下拉框
//export interface OptionItem {   
//label: string;
//value: string;
//}


// 分页结果
export interface PagedResult<T> {
  list: T[];
  total: number;
}
