import React, { useMemo } from "react";
import { Button, Tooltip } from "antd";
import type { ColumnsType } from "antd/lib/table";
import { Table } from "antd";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";
import type { SecurityCheckRecord } from "./security-check.model";
import "./security-check.style.css";

type Props = { //组件的属性
  loading: boolean;   //是否加载中
  data: SecurityCheckRecord[];//数据数组
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;  //翻页时的回调函数
  onEdit: (record: SecurityCheckRecord) => void; //编辑按钮点击时的回调函数
};

function hasAnyNonCompliant(r: SecurityCheckRecord): boolean { //检查是否有不合规项
  return !( //所有项都合规，！=取反
    r.bootAuthentication &&
    r.securityPatch &&
    r.screenSaverPwd &&
    r.antivirusProtection &&
    r.installedSoftware &&
    r.usbInterface
  );
}

function StatusIcon({ ok }: { ok: boolean }) {  //状态图标，接收ok属性的参数
  return (
    <span className="security-status-cell">  
      {ok ? (  //判断ok是否为true
        <Tooltip title="合规">
          <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 18 }} />
        </Tooltip>
      ) : (
        <Tooltip title="不合规">
          <CloseCircleTwoTone twoToneColor="#ff4d4f" style={{ fontSize: 18 }} />
        </Tooltip>
      )}
    </span>
  );
}

export default function SecurityCheckTable(props: Props) {  //组件定义，默认导出SecurityCheckTable
  const { loading, data, page, pageSize, total, onPageChange, onEdit } = props;

  const columns: ColumnsType<SecurityCheckRecord> = useMemo(
    () => [
      {
        title: "编号",
        dataIndex: "samplingId",
        key: "samplingId",
        width: 140,
        ellipsis: true, //文字过长时显示省略号
      },
      {
        title: "工号",
        dataIndex: "userId",
        key: "userId",
        width: 120,
      },
      {
        title: "姓名",
        dataIndex: "name",
        key: "name",
        width: 120,
      },
      {
        title: "设备编号",
        dataIndex: "deviceId",
        key: "deviceId",
        width: 140,
        ellipsis: true,
      },
      {
        title: "开机认证",
        key: "bootAuthentication",
        width: 110,
        align: "center",
        render: (_, r) => <StatusIcon ok={r.bootAuthentication} />,
      },
      {
        title: "安全补丁",
        key: "securityPatch",
        width: 110,
        align: "center",
        render: (_, r) => <StatusIcon ok={r.securityPatch} />,
      },
      {
        title: "密码屏保",
        key: "screenSaverPwd",
        width: 110,
        align: "center",
        render: (_, r) => <StatusIcon ok={r.screenSaverPwd} />,
      },
      {
        title: "病毒防护",
        key: "antivirusProtection",
        width: 110,
        align: "center",
        render: (_, r) => <StatusIcon ok={r.antivirusProtection} />,
      },
      {
        title: "安装软件",
        key: "installedSoftware",
        width: 110,
        align: "center",
        render: (_, r) => <StatusIcon ok={r.installedSoftware} />,
      },
      {
        title: "USB接口",
        key: "usbInterface",
        width: 110,
        align: "center",
        render: (_, r) => <StatusIcon ok={r.usbInterface} />,
      },
      {
        title: "操作",
        key: "disposalMeasures",
        width: 110,
        fixed: "right",
        render: (_, r) => (
          <Button type="link" onClick={() => onEdit(r)}>
            编辑
          </Button>
        ),
      },
    ],
    [onEdit]
  );

  return (
    <Table<SecurityCheckRecord>
      className="security-ops-table"
      rowKey="samplingId"
      loading={loading}
      size="small"
      tableLayout="fixed"
      columns={columns}
      dataSource={data}
      scroll={{ x: 1200 }}  //表格横向滚动
      pagination={{    /*分页配置*/
        current: page,  
        pageSize,
        total,
        size: "small",
        onChange: (p, ps) => onPageChange(p, ps),
      }}
      rowClassName={(record) =>   //给每一行设置类名
        hasAnyNonCompliant(record) ? "security-row-warning" : ""
      }
    />
  );
}
