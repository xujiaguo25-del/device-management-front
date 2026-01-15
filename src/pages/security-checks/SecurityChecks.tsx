import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Button, Space, message, Row, Col } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import Layout from '../../components/common/Layout';
import type { SecurityCheck } from '../../types';
import EditModal from './EditModal';
import { createColumns } from './ColumnDefine';
import { testData } from './TestData';
import { getSecurityChecks, updateSecurityCheck, exportSecurityChecksExcel } from '../../services/securityCheckService';
import { useAuthStore } from '../../stores/authStore';

const SecurityChecks: React.FC = () => {
  const { userInfo } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SecurityCheck[]>(testData);
  const [total, setTotal] = useState(testData.length);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [userId, setUserId] = useState('');
  const [editVisible, setEditVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<SecurityCheck | null>(null);
  const [exporting, setExporting] = useState(false);
  
  // 判断是否为管理员
  const isAdmin = userInfo?.USER_TYPE_NAME.toUpperCase() === 'ADMIN';

  // 加载数据
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 如果不是管理员，使用当前用户的 USER_ID
      const searchUserId = isAdmin ? userId : (userInfo?.USER_ID ?? '');

      const res = await getSecurityChecks({
          page: currentPage,
          size: pageSize,
          userId: searchUserId,
      });

      if(res.code == 200){
        setData(res.data)
        setTotal(res.total)
      }
      else{
        message.error(res.message || "获取失败")
      }

    } catch (error: any) {
      message.error(error.message || '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, isAdmin]);

  // 处理搜索
  const handleSearch = () => {
    fetchData();
    setCurrentPage(1);
  };

  // 处理导出
  const handleExport = async () => {
    try {
      setExporting(true);
      
      // 如果不是管理员，强制使用当前用户的 USER_ID
      const exportUserId = isAdmin ? userId : userInfo?.USER_ID || '';
      
      await exportSecurityChecksExcel(exportUserId ? { userId: exportUserId } : undefined);
      
      message.success('导出成功');
    } catch (error: any) {
      console.error('导出失败:', error);
      message.error(error.message || '导出失败');
    } finally {
      setExporting(false);
    }
  };

  // 处理编辑
  const handleEdit = (record: SecurityCheck) => {
    setCurrentRecord(record);
    setEditVisible(true);
  };

  // 处理更新
  const handleUpdate = async (updated: SecurityCheck) => {
    try {
      const res =  await updateSecurityCheck(updated.samplingId, updated);
      if(res.code == 200){
        message.success('更新成功')
        setEditVisible(false)
        fetchData();
      }
      else{
        message.error(res.message || '更新失败')
      }


    } catch (error: any) {
      message.error("更新数据失败")
      throw error;
    }
  };

  // 创建表格列（根据权限决定是否显示操作列）
  const columns = createColumns(currentPage, pageSize, handleEdit, isAdmin);

  return (
    <Layout title="安全检查记录">
      <Card>
        {/* 管理员显示搜索栏 */}
        {isAdmin && (
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
              <Col xs={24} sm={24} md={16} lg={18}>
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
                    icon={<DownloadOutlined />}
                    onClick={handleExport}
                    loading={exporting}
                  >
                    导出Excel
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        {/* 非管理员提示信息 */}
        {!isAdmin && (
          <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f0f5ff' }}>
            <div style={{ color: '#1890ff' }}>
              当前仅可显示您的安全检查记录（用户ID: {userInfo?.USER_ID}）
            </div>
          </Card>
        )}

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

        {/* 编辑栏 - 仅管理员可用 */}
        {isAdmin && (
          <EditModal
            visible={editVisible}
            title="编辑安全检查"
            record={currentRecord}
            onCancel={() => setEditVisible(false)}
            onOk={handleUpdate}
          />
        )}
      </Card>
    </Layout>
  );
};

export default SecurityChecks;
