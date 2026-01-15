import React, { useEffect, useState } from "react";//从模块中解构组件
import { Modal, Input, Switch, Button, Select, message, Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import type { SecurityCheckRecord } from "./security-check.model";

const { TextArea } = Input; // 从对象中解构属性

type Props = {
  visible: boolean;// 开关
  title?: string;
  record: SecurityCheckRecord | null; // 当前编辑的记录
 // monitorOptions: OptionItem[];
  onCancel: () => void; //关闭按钮

  // 由页面负责：调用接口成功后刷新表格/更新行数据
  onOk: (updated: SecurityCheckRecord) => Promise<void> | void;//完成按钮
};

const labelStyle: React.CSSProperties = { marginBottom: 8, color: "rgba(0,0,0,0.85)" };
const twoColRowStyle: React.CSSProperties = { display: "flex", gap: 20, marginBottom: 16 };// 把两个输入框并列
const fieldBoxStyle: React.CSSProperties = { flex: 1 };//输入框宽度占比

export default function SecurityCheckEditModal({ //从函数参数中解构属性，export default表示这个文件的主体
  visible,
  title = "编辑安全检查",
  record,
  //monitorOptions,
  onCancel,
  onOk,
}: Props) {
  const [draft, setDraft] = useState<SecurityCheckRecord | null>(record);//编辑时的临时副本
  const [saving, setSaving] = useState(false);//创建保存状态

  useEffect(() => {
    setDraft(record);
  }, [record, visible]);//当record或visible变化时，更新draft

  const helpClick = () => {
    Modal.info({  
      title: "检查内容与检查方法",
      content: (
        <div style={{ lineHeight: 1.9 }}>
          <div>• 开机认证：检查是否开启本地/域认证（符合公司策略）。</div>
          <div>• 安全补丁：检查系统补丁是否为最新或在合规周期内。</div>
          <div>• 密码屏保：检查是否设置屏保并在超时后锁屏。</div>
          <div>• 病毒防护：检查杀毒/EDR 是否安装且策略生效。</div>
          <div>• 安装软件：检查是否存在未授权软件。</div>
          <div>• USB接口：检查 USB 存储是否禁用或受控。</div>
        </div>
      ),
      okText: "知道了",
    });
  };

  const setBool = (key: keyof SecurityCheckRecord, val: boolean) => {
    if (!draft) return;
    setDraft({ ...draft, [key]: val });
  };//更新布尔值字段

  const handleSave = async () => {
    if (!draft) return;
    try {
      setSaving(true);
      await onOk(draft); // 页面层负责接口调用 & 更新表格
      message.success("保存成功！");
    } catch (e: any) {
      message.error(e?.message || "保存失败，请稍后重试");
      // A策略：失败弹窗不关闭
      return;
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={visible}
      closable={false} //不显示右上角的关闭按钮
      closeIcon={null} 
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{title}</span>
          <Tooltip title="检查内容与检查方法">  
            <Button type="text" icon={<QuestionCircleOutlined />} onClick={helpClick} />  {/*显示一个带有问号图标的按钮，点击时调用helpClick函数显示帮助信息*/}
          </Tooltip>
        </div>
      }
      width={860}
      onCancel={onCancel}
      maskClosable={false}  //点击背景不能关闭弹窗
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="ok" type="primary" loading={saving} onClick={handleSave}>
          确认编辑
        </Button>,
      ]}
      destroyOnHidden
      
    >
      {!draft ? null : (
        <div>
          {/* 基础信息（只读） */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>基础信息</h3>

            <div style={twoColRowStyle}>   {/* 两列布局 */}
              <div style={fieldBoxStyle}>  {/* 每个输入框占一半宽度 */}
                <div style={labelStyle}>姓名*</div>
                <Input value={draft.name} disabled />
              </div>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>工号*</div>
                <Input value={draft.userId} disabled />
              </div>
            </div>

            <div style={twoColRowStyle}>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>主机编号*</div>
                <Input value={draft.hostId} disabled />
              </div>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>显示器编号*</div>
                <Select
                 value={draft.monitorId}
                  disabled
                  style={{ width: "100%" }}
                 // options={monitorOptions}
                />
              </div>
            </div>
          </div>

          {/* 检查项目（两列紧凑） */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>检查项目</h3>

            <div style={twoColRowStyle}>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>开机认证</div>
                <Switch checked={draft.bootAuthentication} onChange={(v) => setBool("bootAuthentication", v)} />
                <span style={{ marginLeft: 10 }}>{draft.bootAuthentication ? "合规" : "不合规"}</span>
              </div>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>安全补丁</div>
                <Switch checked={draft.securityPatch} onChange={(v) => setBool("securityPatch", v)} />
                <span style={{ marginLeft: 10 }}>{draft.securityPatch ? "合规" : "不合规"}</span>
              </div>
            </div>

            <div style={twoColRowStyle}>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>密码屏保</div>
                <Switch
                  checked={draft.screenSaverPwd}
                  onChange={(v) => setBool("screenSaverPwd", v)}
                />
                <span style={{ marginLeft: 10 }}>
                  {draft.screenSaverPwd ? "合规" : "不合规"}
                </span>
              </div>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>病毒防护</div>
                <Switch
                  checked={draft.antivirusProtection}
                  onChange={(v) => setBool("antivirusProtection", v)}
                />
                <span style={{ marginLeft: 10 }}>{draft.antivirusProtection ? "合规" : "不合规"}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 20 }}>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>安装软件</div>
                <Switch
                  checked={draft.installedSoftware}
                  onChange={(v) => setBool("installedSoftware", v)}
                />
                <span style={{ marginLeft: 10 }}>
                  {draft.installedSoftware ? "合规" : "不合规"}
                </span>
              </div>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>USB接口</div>
                <Switch checked={draft.usbInterface} onChange={(v) => setBool("usbInterface", v)} />
                <span style={{ marginLeft: 10 }}>{draft.usbInterface ? "合规" : "不合规"}</span>
              </div>
            </div>
          </div>

          {/* 处置措施 */}
          <div>
            <h3 style={{ marginBottom: 16 }}>处置措施</h3>
            <TextArea
              rows={4}
              value={draft.disposalMeasures || ""}  
              onChange={(e) =>
                setDraft({ ...draft, disposalMeasures: e.target.value })  //更新处置措施字段
              }
              placeholder="选填：填写处置措施或备注"
              allowClear //显示清除按钮
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
