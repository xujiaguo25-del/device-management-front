import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Card,
  Row,
  Col,
  Form,
  Input,
  Select,
  Modal,
  message,
  Tag,
  Tooltip,
  Popconfirm,
  Statistic,
  Badge,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  FilterOutlined,
  DesktopOutlined,
  MonitorOutlined,
  CloudOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import Layout from '../components/common/Layout';
import DeviceFormModal from '../components/DeviceFormModal';
import DeviceDetailModal from '../components/DeviceDetailModal';
import { deviceApi } from '../services/deviceApi';
import type { DeviceTableData, DeviceQueryParams, DeviceFullDTO } from '../types/devices';
import dayjs from 'dayjs';

const { Option } = Select;

const DeviceManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DeviceTableData[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchForm] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<DeviceFullDTO | null>(null);
  const [dictData, setDictData] = useState<Record<string, any[]>>({});
  const [users, setUsers] = useState<any[]>([]);

  // 加载字典数据
  const loadDictData = async () => {
    try {
      const dictTypes = ['OS_TYPE', 'MEMORY_SIZE', 'SSD_SIZE', 'HDD_SIZE', 'CONFIRM_STATUS'];
      const dicts: Record<string, any[]> = {};
      
      for (const type of dictTypes) {
        const data = await deviceApi.getDictData(type);
        dicts[type] = data;
      }
      
      setDictData(dicts);
    } catch (error) {
      console.error('加载字典数据失败:', error);
    }
  };

  // 加载用户数据
  const loadUsers = async () => {
    try {
      const data = await deviceApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  };

  // 加载设备列表
  const loadDevices = async (params?: DeviceQueryParams) => {
    setLoading(true);
    try {
      const queryParams: DeviceQueryParams = {
        page: params?.page || pagination.current,
        size: params?.size || pagination.pageSize,
        deviceName: params?.deviceName,
        userId: params?.userId,
        userName: params?.userName,
        project: params?.project,
        devRoom: params?.devRoom,
      };

      const response = await deviceApi.getDevices(queryParams);
      
      setData(response.data);
      setPagination({
        ...pagination,
        current: response.page,
        pageSize: response.size,
        total: response.total,
      });
    } catch (error) {
      message.error('加载设备列表失败');
      console.error('加载设备列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadDevices();
    loadDictData();
    loadUsers();
  }, []);

  // 表格列定义
  const columns: TableProps<DeviceTableData>['columns'] = [
    {
      title: '设备编号',
      dataIndex: 'deviceId',
      key: 'deviceId',
      width: 120,
      fixed: 'left',
      render: (text) => (
        <Badge dot={!text.includes('DEV')} color="red">
          <span style={{ fontWeight: 'bold' }}>{text}</span>
        </Badge>
      ),
    },
    {
      title: '电脑名称',
      dataIndex: 'computerName',
      key: 'computerName',
      width: 180,
    },
    {
      title: '使用人',
      dataIndex: 'userName',
      key: 'userName',
      width: 100,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.userId}</div>
        </div>
      ),
    },
    {
      title: '部门',
      dataIndex: 'deptId',
      key: 'deptId',
      width: 100,
    },
    {
      title: '主机型号',
      dataIndex: 'deviceModel',
      key: 'deviceModel',
      width: 150,
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddresses',
      key: 'ipAddresses',
      width: 180,
      render: (text, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <CloudOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            {record.ipCount} 个IP
          </div>
          <Tooltip title={text}>
            <div style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {text || '-'}
            </div>
          </Tooltip>
        </div>
      ),
    },
    {
      title: '显示器',
      dataIndex: 'monitorNames',
      key: 'monitorNames',
      width: 150,
      render: (text, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <MonitorOutlined style={{ marginRight: 4, color: '#52c41a' }} />
            {record.monitorCount} 台
          </div>
          <div style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {text || '-'}
          </div>
        </div>
      ),
    },
    {
      title: '项目',
      dataIndex: 'project',
      key: 'project',
      width: 120,
    },
    {
      title: '开发室',
      dataIndex: 'devRoom',
      key: 'devRoom',
      width: 100,
    },
    {
      title: '硬件配置',
      dataIndex: 'hardwareSummary',
      key: 'hardwareSummary',
      width: 200,
      render: (text) => (
        <Tooltip title={text}>
          <div style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {text || '-'}
          </div>
        </Tooltip>
      ),
    },
    {
      title: '本人确认',
      dataIndex: 'selfConfirmStatus',
      key: 'selfConfirmStatus',
      width: 100,
      render: (status) => (
        <Tag color={status === '已确认' ? 'green' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      width: 80,
      render: (status: string) => {
        const color = status === '在线' ? 'green' : status === '离线' ? 'red' : 'default';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: '标签',
      key: 'tags',
      dataIndex: 'tags',
      width: 120,
      render: (tags: string[]) => (
        <Space size={[0, 8]} wrap>
          {tags?.map((tag) => (
            <Tag key={tag} color="blue">
              {tag}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 160,
      render: (text) => text ? dayjs(text).format('MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record.deviceId)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record.deviceId)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除此设备吗？"
              onConfirm={() => handleDelete(record.deviceId)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 处理查看详情
  const handleViewDetail = async (deviceId: string) => {
    try {
      const detail = await deviceApi.getDeviceDetail(deviceId);
      setCurrentDevice(detail);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('获取设备详情失败');
    }
  };

  // 处理编辑
  const handleEdit = async (deviceId: string) => {
    try {
      const detail = await deviceApi.getDeviceDetail(deviceId);
      setCurrentDevice(detail);
      setIsEditing(true);
      setModalVisible(true);
    } catch (error) {
      message.error('获取设备信息失败');
    }
  };

  // 处理删除
  const handleDelete = async (deviceId: string) => {
    try {
      const result = await deviceApi.deleteDevice(deviceId);
      if (result.success) {
        message.success('删除成功');
        loadDevices();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的设备');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 台设备吗？`,
      onOk: async () => {
        try {
          const deletePromises = selectedRowKeys.map((key) =>
            deviceApi.deleteDevice(key as string)
          );
          await Promise.all(deletePromises);
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          loadDevices();
        } catch (error) {
          message.error('批量删除失败');
        }
      },
    });
  };

  // 处理导出
  const handleExport = () => {
    message.success('导出功能待实现');
  };

  // 处理表格变化
  const handleTableChange = (newPagination: any) => {
    setPagination({
      ...pagination,
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
    });
    loadDevices({
      page: newPagination.current,
      size: newPagination.pageSize,
      ...searchForm.getFieldsValue(),
    });
  };

  // 处理搜索
  const handleSearch = (values: any) => {
    loadDevices({
      page: 1,
      size: pagination.pageSize,
      ...values,
    });
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    loadDevices({ page: 1, size: pagination.pageSize });
  };

  // 处理新增/编辑提交
  const handleFormSubmit = async (values: DeviceFullDTO) => {
    try {
      if (isEditing && currentDevice) {
        await deviceApi.updateDevice(currentDevice.deviceId, values);
        message.success('更新成功');
      } else {
        await deviceApi.createDevice(values);
        message.success('新增成功');
      }
      setModalVisible(false);
      setCurrentDevice(null);
      setIsEditing(false);
      loadDevices();
    } catch (error) {
      message.error(isEditing ? '更新失败' : '创建失败');
    }
  };

  // 模拟统计信息
  const totalDevices = pagination.total;
  const onlineDevices = data.filter(d => d.status === '在线').length;
  const unconfirmedDevices = data.filter(d => d.selfConfirmId === 0).length;
  const serverDevices = data.filter(d => d.deviceModel?.includes('服务器')).length;

  // 表格行选择
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <Layout title="设备管理">
      <div style={{ padding: 24 }}>
        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="设备总数"
                value={totalDevices}
                prefix={<DesktopOutlined style={{ marginRight: 8 }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="在线设备"
                value={onlineDevices}
                prefix={<div style={{ color: '#52c41a', marginRight: 8 }}>●</div>}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待确认设备"
                value={unconfirmedDevices}
                prefix={<div style={{ color: '#faad14', marginRight: 8 }}>●</div>}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="服务器设备"
                value={serverDevices}
                prefix={<div style={{ color: '#722ed1', marginRight: 8 }}>●</div>}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 搜索栏 */}
        <Card style={{ marginBottom: 24 }}>
          <Form
            form={searchForm}
            layout="inline"
            onFinish={handleSearch}
            style={{ gap: 16 }}
          >
            <Form.Item name="deviceName" label="设备名称">
              <Input 
                placeholder="请输入设备名称或编号" 
                style={{ width: 180 }}
                prefix={<DesktopOutlined />}
              />
            </Form.Item>
            <Form.Item name="userId" label="使用人工号">
              <Input 
                placeholder="请输入工号" 
                style={{ width: 150 }}
                prefix={<UserOutlined />}
              />
            </Form.Item>
            <Form.Item name="userName" label="使用人姓名">
              <Input 
                placeholder="请输入姓名" 
                style={{ width: 150 }}
                prefix={<UserOutlined />}
              />
            </Form.Item>
            <Form.Item name="project" label="项目">
              <Input 
                placeholder="请输入项目" 
                style={{ width: 150 }}
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                  搜索
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
                <Button icon={<FilterOutlined />}>
                  更多筛选
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* 操作栏 */}
        <Card style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setCurrentDevice(null);
                    setIsEditing(false);
                    setModalVisible(true);
                  }}
                >
                  新增设备
                </Button>
                {selectedRowKeys.length > 0 && (
                  <Popconfirm
                    title={`确定要删除选中的 ${selectedRowKeys.length} 台设备吗？`}
                    onConfirm={handleBatchDelete}
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      批量删除
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<ExportOutlined />}
                  onClick={handleExport}
                >
                  导出Excel
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => loadDevices()}
                >
                  刷新
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 设备表格 */}
        <Card>
          <Table
            columns={columns}
            dataSource={data}
            rowSelection={rowSelection}
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={handleTableChange}
            scroll={{ x: 1500 }}
            rowKey="deviceId"
            size="middle"
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无设备数据"
                />
              ),
            }}
          />
        </Card>

        {/* 设备表单模态框 */}
        <DeviceFormModal
          visible={modalVisible}
          isEditing={isEditing}
          device={currentDevice}
          dictData={dictData}
          users={users}
          onCancel={() => {
            setModalVisible(false);
            setCurrentDevice(null);
            setIsEditing(false);
          }}
          onSubmit={handleFormSubmit}
        />

        {/* 设备详情模态框 */}
        <DeviceDetailModal
          visible={detailModalVisible}
          device={currentDevice}
          dictData={dictData}
          onCancel={() => {
            setDetailModalVisible(false);
            setCurrentDevice(null);
          }}
        />
      </div>
    </Layout>
  );
};

export default DeviceManagement;