import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Button, Space, message, Row, Col } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import Layout from '../../components/common/Layout';
import type { SecurityCheck } from '../../types';
import EditModal from './EditModal';
import { createColumns } from './ColumnDefine';
import { getSecurityChecks, updateSecurityCheck, exportSecurityChecksExcel } from '../../services/securityCheckService';
import { useAuthStore } from '../../stores/authStore';

const SecurityChecks: React.FC = () => {
  const { userInfo } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SecurityCheck[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [userId, setUserId] = useState('');
  const [editVisible, setEditVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<SecurityCheck | null>(null);
  const [exporting, setExporting] = useState(false);
  
  // 管理者かどうかを判断する
  const isAdmin = userInfo?.USER_TYPE_NAME.toUpperCase() === 'ADMIN';

  // データのロード
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 管理者でない場合は、現在のユーザーのUSER _ IDを使用します
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

  // 検索の操作
  const handleSearch = () => {
    fetchData();
    setCurrentPage(1);
  };

  // エクスポートの操作
  const handleExport = async () => {
    try {
      setExporting(true);
      await exportSecurityChecksExcel();
      message.success('导出成功');
    } catch (error: any) {
      console.error('导出失败:', error);
      message.error(error.message || '导出失败');
    } finally {
      setExporting(false);
    }
  };

  // 編集の操作
  const handleEdit = (record: SecurityCheck) => {
    setCurrentRecord(record);
    setEditVisible(true);
  };

  // 更新の処理
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

  // テーブル列の作成（権限に基づいてアクション列を表示するかどうかを決定）
  const columns = createColumns(currentPage, pageSize, handleEdit, isAdmin);

  return (
    <Layout title="セキュリティチェック">
      <Card>
        {/* 管理者による検索バーの表示 */}
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

        {/* 管理者以外のプロンプト情報 */}
        {!isAdmin && (
          <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f0f5ff' }}>
            <div style={{ color: '#1890ff' }}>
              当前仅可显示您的安全检查记录（用户ID: {userInfo?.USER_ID}）
            </div>
          </Card>
        )}

        {/*表バー*/}
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

        {/* 編集バー-管理者のみ使用可能*/}
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
