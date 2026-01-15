import { Button, Tag, } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { SecurityCheck } from '../../types';
import ReadonlySelect from './ReadonlySelect';

/**
 * 创建表格列定义
 * @param currentPage 当前页码
 * @param pageSize 每页条数
 * @param onEdit 编辑回调函数
 */

export const createColumns = (
  currentPage: number,
  pageSize: number,
  onEdit: (record: SecurityCheck) => void,
): ColumnType<SecurityCheck>[] => [
  {
    title: '序号',
    key: 'index',
    width: 80,
    render: (_text, _record, index) => (currentPage - 1) * pageSize + index + 1,
  },
  {
    title: '工号',
    dataIndex: 'userId',
    key: 'userId',
    width: 120,
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    width: 120,
  },
  {
    title: '设备编号',
    dataIndex: 'deviceId',
    key: 'deviceId',
    width: 100,
  },
  {
    title: '显示器编号',
    dataIndex: 'monitorId',
    key: 'monitorId',
    width: 160,
    render: (_: string, record: SecurityCheck) => (
      <ReadonlySelect
        value={record.monitorId}
        options={record.monitorIds.map((id) => ({
          label: id,
          value: id,
        }))}
      />
    ),
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
