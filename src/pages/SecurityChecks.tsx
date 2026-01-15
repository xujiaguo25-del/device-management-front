import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/common/Layout";
import { Button, Card, Form, Input } from "antd";

import SecurityCheckTable from "../components/securityChecks/SecurityCheckTable";
import SecurityCheckEditModal from "../components/securityChecks/SecurityCheckEditModal";
import type {
  SecurityCheckRecord,
  //OptionItem,
} from "../components/securityChecks/security-check.model";

const DEFAULT_PAGE_SIZE = 10;

// 生成 20 条假数据（包含合规/不合规混合）
function createMockData(): SecurityCheckRecord[] {
  const monitors = ["HYRON-00001", "HYRON-00002", "HYRON-00003", "HYRON-00004"];

  const list: SecurityCheckRecord[] = [];
  for (let i = 1; i <= 20; i++) {
    const userId = `U${String(1000 + i).slice(-4)}`; // U1001...U1020
    const okBase = i % 3 !== 0; // 每 3 条里制造一条“更容易不合规”的样本
    const record: SecurityCheckRecord = {
      samplingId: `SC-${String(i).padStart(4, "0")}`, // SC-0001...
      userId: userId,
      name: `员工${String(i).padStart(2, "0")}`,
      deviceId: `DEV-${String(2000 + i)}`,
      hostId: `HOST-${String(3000 + i)}`,
      monitorId: monitors[i % monitors.length],

      // 让状态看起来更真实：随机一些不合规项
      bootAuthentication: okBase ? true : i % 2 === 0,
      securityPatch: okBase ? true : i % 5 !== 0,
      screenSaverPwd: okBase ? true : i % 4 !== 0,
      antivirusProtection: okBase ? true : i % 6 !== 0,
      installedSoftware: okBase ? true : i % 7 !== 0,
      usbInterface: okBase ? true : i % 8 !== 0,

      disposalMeasures:
        i % 3 === 0
          ? "已卸载未经授权软件并重启系统"
          : "",
    };

    list.push(record);
  }
  return list;
}

const SecurityChecks: React.FC = () => {
  const [form] = Form.useForm();

  // 全量数据（20条假数据）
  const [allData, setAllData] = useState<SecurityCheckRecord[]>([]);

  // 查询条件（注意：点“查询”才更新）
  const [queryuserId, setQueryuserId] = useState<string>("");

  // 分页
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);

  // 弹窗
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<SecurityCheckRecord | null>(null);

  // monitor 下拉（只读展示用）
  //const monitorOptions: OptionItem[] = [
   // { label: "HYRON-00001", value: "HYRON-00001" },
    //{ label: "HYRON-00002", value: "HYRON-00002" },
   // { label: "HYRON-00003", value: "HYRON-00003" },
    //{ label: "HYRON-00004", value: "HYRON-00004" },
  //];

  // 初始化假数据
  useEffect(() => {
    setAllData(createMockData());
  }, []);

  // 根据“已生效查询条件”过滤（点查询才改 queryuserId）
  const filteredData = useMemo(() => {
    const q = queryuserId.trim();
    if (!q) return allData;
    return allData.filter((r) => r.userId.includes(q));
  }, [allData, queryuserId]);

  // 当前页数据
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  // 查询按钮：把表单值“提交”为生效条件，并回到第一页
  const onQuery = () => {
    const v = (form.getFieldValue("userId") || "").trim();
    setQueryuserId(v);
    setPage(1);
  };

  const onEdit = (record: SecurityCheckRecord) => {
    console.log("EDIT CLICKED:", record.samplingId);
    setCurrentRecord(record);
    setModalVisible(true);
  };// 编辑按钮：打开弹窗

  // 取消：关闭弹窗

  const onModalCancel = () => {
    setModalVisible(false);
    setCurrentRecord(null);
  };

  // 保存：直接更新前端数据（本地假数据）
  const onModalOk = async (updated: SecurityCheckRecord) => {
    setAllData((prev) => prev.map((it) => (it.samplingId === updated.samplingId ? updated : it)));
    setModalVisible(false);
    setCurrentRecord(null);
  };

  return (
    <Layout title="安全检查">
        <Form form={form} layout="inline" size="small" style={{ marginBottom: 8}}>
          <Form.Item name="userId" label="工号" style={{marginBottom:8 }}>
            <Input
              placeholder="请输入工号"
              allowClear
              style={{ width: 180 }}
              maxLength={32}
              size="small"
            />
          </Form.Item>
          <Form.Item style={{marginBottom:8}}>
            <Button type="primary" size="small" onClick={onQuery}>
              查询
            </Button>
          </Form.Item>
        </Form>

        <SecurityCheckTable
          loading={false}
          data={pageData}
          page={page}
          pageSize={pageSize}
          total={filteredData.length}
          onPageChange={(p) => setPage(p)}
          onEdit={onEdit}
        />
      

      <SecurityCheckEditModal
        visible={modalVisible}
        record={currentRecord}
        //monitorOptions={monitorOptions}
        onCancel={onModalCancel}
        onOk={onModalOk}
      />
    </Layout>
  );
};

export default SecurityChecks;
