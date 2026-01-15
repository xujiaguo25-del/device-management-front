import React, { useEffect, useState } from 'react';
import { Modal, Input, Switch, Button, message, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import type { SecurityCheck } from '../../types';

const { TextArea } = Input;

interface EditModalProps {
  visible: boolean;
  title?: string;
  record: SecurityCheck | null;
  onCancel: () => void;
  onOk: (updated: SecurityCheck) => Promise<void> | void;
}

const labelStyle: React.CSSProperties = { marginBottom: 8, color: 'rgba(0,0,0,0.85)' };
const twoColRowStyle: React.CSSProperties = { display: 'flex', gap: 20, marginBottom: 16 };
const fieldBoxStyle: React.CSSProperties = { flex: 1 };

const EditModal: React.FC<EditModalProps> = ({
  visible,
  title = '编辑安全检查',
  record,
  onCancel,
  onOk,
}) => {
  const [draft, setDraft] = useState<SecurityCheck | null>(record);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(record);
  }, [record, visible]);

  const helpClick = () => {
    Modal.info({
      title: '检查内容与检查方法',
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
      okText: '知道了',
    });
  };

  const setBool = (key: keyof SecurityCheck, val: boolean) => {
    if (!draft) return;
    setDraft({ ...draft, [key]: val });
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    await onOk(draft);
    setSaving(false);
  };

  return (
    <Modal
      open={visible}
      closable={false}
      closeIcon={null}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{title}</span>
          <Tooltip title="检查内容与检查方法">
            <Button type="text" icon={<QuestionCircleOutlined />} onClick={helpClick} />
          </Tooltip>
        </div>
      }
      width={860}
      onCancel={onCancel}
      maskClosable={false}
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

            <div style={twoColRowStyle}>
              <div style={fieldBoxStyle}>
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
                <div style={labelStyle}>设备ID*</div>
                <Input value={draft.deviceId} disabled />
              </div>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>显示器名称*</div>
                <TextArea
                  value={
                    draft.monitorName
                      ? draft.monitorName
                          .split(';')
                          .map(m => `${m.trim()}（显示器）`)
                          .join('\n')
                      : ''
                  }
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* 检查项目 */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>检查项目</h3>

            <div style={twoColRowStyle}>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>开机认证</div>
                <Switch checked={draft.bootAuthentication} onChange={(v) => setBool('bootAuthentication', v)} />
                <span style={{ marginLeft: 10 }}>{draft.bootAuthentication ? '合规' : '不合规'}</span>
              </div>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>安全补丁</div>
                <Switch checked={draft.securityPatch} onChange={(v) => setBool('securityPatch', v)} />
                <span style={{ marginLeft: 10 }}>{draft.securityPatch ? '合规' : '不合规'}</span>
              </div>
            </div>

            <div style={twoColRowStyle}>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>密码屏保</div>
                <Switch
                  checked={draft.screenSaverPwd}
                  onChange={(v) => setBool('screenSaverPwd', v)}
                />
                <span style={{ marginLeft: 10 }}>
                  {draft.screenSaverPwd ? '合规' : '不合规'}
                </span>
              </div>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>病毒防护</div>
                <Switch
                  checked={draft.antivirusProtection}
                  onChange={(v) => setBool('antivirusProtection', v)}
                />
                <span style={{ marginLeft: 10 }}>{draft.antivirusProtection ? '合规' : '不合规'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>安装软件</div>
                <Switch
                  checked={draft.installedSoftware}
                  onChange={(v) => setBool('installedSoftware', v)}
                />
                <span style={{ marginLeft: 10 }}>
                  {draft.installedSoftware ? '合规' : '不合规'}
                </span>
              </div>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>USB接口</div>
                <Switch checked={draft.usbInterface} onChange={(v) => setBool('usbInterface', v)} />
                <span style={{ marginLeft: 10 }}>{draft.usbInterface ? '合规' : '不合规'}</span>
              </div>
            </div>
          </div>

          {/* 处置措施 */}
          <div>
            <h3 style={{ marginBottom: 16 }}>处置措施</h3>
            <TextArea
              rows={4}
              value={draft.disposalMeasures || ''}
              onChange={(e) =>
                setDraft({ ...draft, disposalMeasures: e.target.value })
              }
              placeholder="选填：填写处置措施或备注"
              allowClear
            />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default EditModal;
