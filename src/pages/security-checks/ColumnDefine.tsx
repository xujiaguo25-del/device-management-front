import { Button, Tag } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { SecurityCheck } from '../../types';

//表の列の定義
export const createColumns = (
  currentPage: number,
  pageSize: number,
  onEdit: (record: SecurityCheck) => void,
): ColumnType<SecurityCheck>[] => {
  const columns: ColumnType<SecurityCheck>[] = [
  {
    title: '番号',
    key: 'index',
    width: 80,
    render: (_text, _record, index) => (currentPage - 1) * pageSize + index + 1,
  },
  {
    title: 'ユーザーID',
    dataIndex: 'userId',
    key: 'userId',
    width: 120,
  },
  {
    title: 'ユーザー名',
    dataIndex: 'name',
    key: 'name',
    width: 120,
  },
  {
    title: 'デバイス番号',
    dataIndex: 'deviceId',
    key: 'deviceId',
    width: 260,
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
                  {monitor}（モニター）
                </Tag>
              ))}
            </div>
          )}
        </div>
      );
    }, 
  },
  
  
  {
    title: '起動認証',
    dataIndex: 'bootAuthentication',
    key: 'bootAuthentication',
    width: 100,
    render: (value: boolean) => {
      if (value === null) return '-';
      return (
        <Tag color={value ? 'success' : 'error'}>
          {value ? '正常' : '異常'}
        </Tag>
      );
    },
  },
  {
    title: 'パスワード画面保護',
    dataIndex: 'screenSaverPwd',
    key: 'screenSaverPwd',
    width: 180,
    render: (value: boolean) => {
      if (value === null) return '-';
      return (
        <Tag color={value ? 'success' : 'error'}>
          {value ? '正常' : '異常'}
        </Tag>
      );
    },
  },
  {
    title: 'インストールソフトウェア',
    dataIndex: 'installedSoftware',
    key: 'installedSoftware',
    width: 220,
    render: (value: boolean) => {
      if (value === null) return '-';
      return (
        <Tag color={value ? 'success' : 'error'}>
          {value ? '正常' : '異常'}
        </Tag>
      );
    },
  },
  {
    title: 'セキュリティパッチ',
    dataIndex: 'securityPatch',
    key: 'securityPatch',
    width: 220,
    render: (value: boolean) => {
      if (value === null) return '-';
      return (
        <Tag color={value ? 'success' : 'error'}>
          {value ? '正常' : '異常'}
        </Tag>
      );
    },
  },
  {
    title: 'アンチウイルスソフトウェア',
    dataIndex: 'antivirusProtection',
    key: 'antivirusProtection',
    width: 220,
    render: (value: boolean) => {
      if (value === null) return '-';
      return (
        <Tag color={value ? 'success' : 'error'}>
          {value ? '正常' : '異常'}
        </Tag>
      );
    },
  },
  {
    title: 'USBインターフェース',
    dataIndex: 'usbInterface',
    key: 'usbInterface',
    width: 220,
    render: (value: boolean) => {
      if (value === null) return '-';
      return (
        <Tag color={value ? 'success' : 'error'}>
          {value ? '正常' : '異常'}
        </Tag>
      );
    },
  },
  {
    title: '対処措置',
    dataIndex: 'disposalMeasures',
    key: 'disposalMeasures',
    width: 200,
    ellipsis: true,
  },
  {
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
    }
];

  return columns;
};