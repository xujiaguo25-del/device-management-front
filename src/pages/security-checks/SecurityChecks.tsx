import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Button, Space, message, Row, Col } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import Layout from '../../components/common/Layout';
import type { SecurityCheck } from '../../types';
import EditModal from './EditModal';
import { createColumns } from './ColumnDefine';
import { getSecurityChecks, updateSecurityCheck, exportSecurityChecksExcel } from '../../services//security-checks/securityCheckService';
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
  const isAdmin = userInfo?.USER_TYPE_NAME?.toUpperCase() === 'ADMIN';

  // 非管理者の場合は権限不足ページを表示
  if (!isAdmin) {
    return (
      <Layout title="セキュリティチェック">
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <h2>現在閲覧権限がありません</h2>
          </div>
        </Card>
      </Layout>
    );
  }

  // データのロード
  const fetchData = async () => {
    try {
      setLoading(true);
    
      const res = await getSecurityChecks({
          page: currentPage,
          size: pageSize,
          userId: userId,
      });

      if(res.code == 200){
        setData(res.data)
        setTotal(res.total)
      }
      else{
        message.error(res.message || "取得失敗")
      }

    } catch (error: any) {
      message.error(error.message || 'データ取得失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]);

  // 検索の操作
  const handleSearch = () => {
    fetchData();
    setCurrentPage(1);
  };

  const handleClear = async () => {
    try {
      setLoading(true);
    
      const res = await getSecurityChecks({
          page: 1,
          size: pageSize
      });

      if(res.code == 200){
        setData(res.data)
        setTotal(res.total)
        setCurrentPage(1)
      }
      else{
        message.error(res.message || "取得失敗")
      }

    } catch (error: any) {
      message.error(error.message || 'データ取得失敗');
    } finally {
      setLoading(false);
    }
  };

  // エクスポートの操作
  const handleExport = async () => {
    try {
      setExporting(true);
      await exportSecurityChecksExcel();
      message.success('エクスポート成功');
    } catch (error: any) {
      console.error('エクスポート失敗:', error);
      message.error(error.message || 'エクスポート失敗');
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
        message.error(res.message || '更新失敗')
      }


    } catch (error: any) {
      message.error("データ更新失敗")
      throw error;
    }
  };

  // テーブル列の作成（権限に基づいてアクション列を表示するかどうかを決定）
  const columns = createColumns(currentPage, pageSize, handleEdit);

  return (
    <Layout title="セキュリティチェック">
      <Card>
        <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="ユーザーID"
                  value={userId || ''}
                  onChange={(e) => setUserId(e.target.value)}
                  allowClear
                  onClear={handleClear} 
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
                    検索
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleExport}
                    loading={exporting}
                  >
                    Excelエクスポート
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

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
            placement:['bottomCenter'],
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `合計 ${total} 件`,
            pageSizeOptions: ['5', '10', '20', '50', '100'],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
        <EditModal
            visible={editVisible}
            title="セキュリティチェック編集"
            record={currentRecord}
            onCancel={() => setEditVisible(false)}
            onOk={handleUpdate}
        />
      </Card>
    </Layout>
  );
};

export default SecurityChecks;