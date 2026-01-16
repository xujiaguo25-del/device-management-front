import { Button, Tag } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { SecurityCheck } from '../../types';

//表の列の定義
export const createColumns = (
  currentPage: number,
  pageSize: number,
  onEdit: (record: SecurityCheck) => void,
  isAdmin: boolean = true
): ColumnType<SecurityCheck>[] => {
  const baseColumns: ColumnType<SecurityCheck>[] = [
  {
    title: '序号',
    key: 'index',
    width: 80,
    render: (_text, _record, index) => (currentPage - 1) * pageSize + index + 1,
  },
  {
    title: '用户ID',
    dataIndex: 'userId',
    key: 'userId',
    width: 120,
  },
  {
    title: '用户名',
    dataIndex: 'name',
    key: 'name',
    width: 120,
  },
  {
  title: '设备编号',
  dataIndex: 'deviceId',
  key: 'deviceId',
  width: 180,
  render: (deviceId: string, record: SecurityCheck) => {
    const monitors = record.monitorName
      ? record.monitorName.split(';').map(m => m.trim()).filter(Boolean)
      : [];

    return (
      <div>
        <div>{deviceId}</div>

        {monitors.length > 0 && (
          <div style={{ marginTop: 4 }}>
            {monitors.map((monitor, index) => (
              <Tag
                key={index}
                color="blue"
                style={{ marginBottom: 2 }}
              >
                {monitor}（显示器）
              </Tag>
            ))}
          </div>
        )}
      </div>
    );
  },
},
  
  {
    title: '开机认证',
    dataIndex: 'bootAuthentication',
    key: 'bootAuthentication',
    width: 100,
    render: (value: boolean) => {
      if (value === null) return '-';
      return (
        <Tag color={value ? 'success' : 'error'}>
          {value ? '正常' : '异常'}
        </Tag>
      );
    },
  },
  {
    title: '屏保密码',
    dataIndex: 'screenSaverPwd',
    key: 'screenSaverPwd',
    width: 100,
    render: (value: boolean) => {
      if (value === null) return '-';
      return (
        <Tag color={value ? 'success' : 'error'}>
          {value ? '正常' : '异常'}
        </Tag>
      );
    },
  },
  {
    title: '安装软件',
    dataIndex: 'installedSoftware',
    key: 'installedSoftware',
    width: 100,
    render: (value: boolean) => {
      if (value === null) return '-';
      return (
        <Tag color={value ? 'success' : 'error'}>
          {value ? '正常' : '异常'}
        </Tag>
      );
    },
  },
  {
    title: '安全补丁',
    dataIndex: 'securityPatch',
    key: 'securityPatch',
    width: 100,
    render: (value: boolean) => {
      if (value === null) return '-';
      return (
        <Tag color={value ? 'success' : 'error'}>
          {value ? '正常' : '异常'}
        </Tag>
      );
    },
  },
  {
    title: '杀毒软件',
    dataIndex: 'antivirusProtection',
    key: 'antivirusProtection',
    width: 100,
    render: (value: boolean) => {
      if (value === null) return '-';
      return (
        <Tag color={value ? 'success' : 'error'}>
          {value ? '正常' : '异常'}
        </Tag>
      );
    },
  },
  {
    title: 'USB接口',
    dataIndex: 'usbInterface',
    key: 'usbInterface',
    width: 100,
    render: (value: boolean) => {
      if (value === null) return '-';
      return (
        <Tag color={value ? 'success' : 'error'}>
          {value ? '正常' : '异常'}
        </Tag>
      );
    },
  },
  {
    title: '处置措施',
    dataIndex: 'disposalMeasures',
    key: 'disposalMeasures',
    width: 200,
    ellipsis: true,
  },
];

  // 管理者のみがアクション列を表示
  if (isAdmin) {
    baseColumns.push({
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_text, record) => (
        <Button
          type="link"
          onClick={() => onEdit(record)}
        >
          更新
        </Button>
      ),
    });
  }

  return baseColumns;
};
