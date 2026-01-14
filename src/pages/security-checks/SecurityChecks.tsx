import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Button, Space, message, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Layout from '../../components/common/Layout';
import type { SecurityCheck } from '../../types';
import EditModal from './EditModal';
import { createColumns } from './ColumnDefine';
import { testData } from './TestData';
import { SecurityChecksGet } from '../../services/api/SecurityCheckService';

const SecurityChecks: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SecurityCheck[]>(testData);
  const [total, setTotal] = useState(testData.length);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [userId, setUserId] = useState('');
  const [editVisible, setEditVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<SecurityCheck | null>(null);

  // 加载数据
  const fetchData = async () => {
    try {
      setLoading(true);
      // 使用测试数据
      const getResponse=await SecurityChecksGet(currentPage,pageSize,userId);
      if(getResponse.code==200){
        setData(getResponse.data);
        setTotal(getResponse.total);
      }
      else {
        message.error(getResponse.message);
      }

      
    } catch (error: any) {
      console.error(error);
      message.error(error.message || '获取数据失败');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]);

  // 处理搜索
  const handleSearch = () => {
    fetchData();
    setCurrentPage(1);
  };

  // 处理编辑
  const handleEdit = (record: SecurityCheck) => {
    setCurrentRecord(record);
    setEditVisible(true);
  };

  // 处理更新
  const handleUpdate = async (updated: SecurityCheck) => {
    try {
      // 更新本地数据
      setData(prevData => 
        prevData.map(item => 
          item.samplingId === updated.samplingId 
            ? { ...item, ...updated } 
            : item
        )
      );
      
      message.success('更新成功');
      setEditVisible(false);

    } catch (error: any) {
      console.error('更新失败:', error);
      throw error;
    }
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
        />
      </Card>
    </Layout>
  );
};

export default SecurityChecks;
