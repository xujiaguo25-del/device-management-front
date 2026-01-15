import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Button, Space, message, Row, Col } from 'antd';
import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import Layout from '../../components/common/Layout';
import type {SecurityCheck} from '../../types';
import EditModal from './EditModal';
import { createColumns } from './ColumnDefine';
import { testData } from './TestData';
import { securityCheckApi } from '../../services/api/securityCheckApi';

const SecurityChecks: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SecurityCheck[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [userId, setUserId] = useState('');
  const [editVisible, setEditVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState< SecurityCheck | null>(null);
  const [searchTrigger, setSearchTrigger] = useState(0); // 用于触发搜索
  const [currentRecord, setCurrentRecord] = useState<SecurityCheck | null>(null);

  const monitorOptions = useMemo(() => {
    const unique = Array.from(new Set(testData.map((x) => x.monitorId)));
    return unique.map((id) => ({ label: id, value: id }));
  }, []);

  // 加载数据
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 调用真实后端API
      const params = {
        page: currentPage,
        pageSize: pageSize,
        userId: userId || undefined,
      };
      
      const response = await securityCheckApi.getSecurityChecks(params);
      
      if (response && response.success) {
        setData(response.data.list || response.data);
        setTotal(response.data.total || response.data.length || 0);
      } else {
        throw new Error(response?.message || '获取数据失败');
      }

    } catch (error: any) {
      console.error('获取数据失败:', error);
      message.error(error.message || '获取数据失败，使用测试数据');
      
      // 失败时使用测试数据
      let filteredData = [...testData];
      if (userId) {
        filteredData = filteredData.filter(item => 
          item.userId.toLowerCase().includes(userId.toLowerCase())
        );
      }
      
      // 模拟分页
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      setData(paginatedData);
      setTotal(filteredData.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, searchTrigger]);

  // 处理搜索
  const handleSearch = () => {
    setCurrentPage(1);
    setSearchTrigger(prev => prev + 1);
  };

  // 重置搜索
  const handleReset = () => {
    setUserId('');
    setCurrentPage(1);
    setSearchTrigger(prev => prev + 1);
  };

  // 处理编辑
  const handleEdit = (record: SecurityCheck) => {
    setCurrentRecord(record);
    setEditVisible(true);
  };

  // 处理更新
  const handleUpdate = async (updated: SecurityCheck) => {
    try {
      setLoading(true);
      
      // 调用后端API更新数据
      const response = await securityCheckApi.updateSecurityCheck(
        updated.samplingId,
        {
          // 只传递需要更新的字段
          bootAuthentication: updated.bootAuthentication,
          securityPatch: updated.securityPatch,
          screenSaverPwd: updated.screenSaverPwd,
          antivirusProtection: updated.antivirusProtection,
          installedSoftware: updated.installedSoftware,
          usbInterface: updated.usbInterface,
          disposalMeasures: updated.disposalMeasures,
        }
      );
      
      if (response && response.success) {
        // 使用后端返回的数据更新本地状态
        const updatedData = response.data || updated;
        setData(prevData => 
          prevData.map(item => 
            item.samplingId === updated.samplingId 
              ? { ...item, ...updatedData }
              : item
          )
        );
        
        message.success('更新成功');
        setEditVisible(false);
        
        // 可选：重新获取数据以确保数据一致性
        // fetchData();
      } else {
        throw new Error(response?.message || '更新失败');
      }

    } catch (error: any) {
      console.error('更新失败:', error);
      message.error(error.message || '更新失败，请重试');
      throw error; // 抛出错误让EditModal处理
    } finally {
      setLoading(false);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    fetchData();
  };

  // 创建表格列
  const columns = createColumns(currentPage, pageSize, handleEdit);

  return (
    <Layout title="安全检查记录">
      <Card>
        {/*搜索栏*/}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder="用户ID"
                value={userId || ''}
                onChange={(e) => setUserId(e.target.value)}
                allowClear
                onPressEnter={handleSearch}
              />
            </Col>
            <Col xs={24} sm={24} md={8} lg={12}>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  loading={loading}
                >
                  查询
                </Button>
                <Button
                  icon={<SyncOutlined />}
                  onClick={handleRefresh}
                  loading={loading}
                >
                  刷新
                </Button>
                <Button onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/*表格栏*/}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="samplingId"
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            pageSizeOptions: ['5', '10', '20', '50', '100'],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />

        {/* 编辑栏 */}
        <EditModal
          visible={editVisible}
          title="编辑安全检查"
          record={currentRecord}
          onCancel={() => setEditVisible(false)}
          onOk={handleUpdate}
          monitorOptions={monitorOptions}
        />
      </Card>
    </Layout>
  );
};

export default SecurityChecks;
