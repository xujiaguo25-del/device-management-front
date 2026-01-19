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
  title = 'セキュリティチェック編集',
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
      title: 'チェック内容とチェック方法',
      content: (
        <div style={{ lineHeight: 1.9 }}>
          <div>• 起動認証：ローカル/ドメイン認証が有効になっているかチェック（会社ポリシーに準拠）。</div>
          <div>• セキュリティパッチ：システムパッチが最新または適合期間内かチェック。</div>
          <div>• パスワードスクリーンセーバー：スクリーンセーバーが設定され、タイムアウト後にロックされるかチェック。</div>
          <div>• ウイルス対策：アンチウイルス/EDRがインストールされ、ポリシーが有効かチェック。</div>
          <div>• インストールソフトウェア：未承認ソフトウェアが存在するかチェック。</div>
          <div>• USBインターフェース：USBストレージが無効または制御されているかチェック。</div>
        </div>
      ),
      okText: '了解',
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
          <Tooltip title="チェック内容とチェック方法">
            <Button type="text" icon={<QuestionCircleOutlined />} onClick={helpClick} />
          </Tooltip>
        </div>
      }
      width={860}
      onCancel={onCancel}
      maskClosable={false}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          キャンセル
        </Button>,
        <Button key="ok" type="primary" loading={saving} onClick={handleSave}>
          編集確認
        </Button>,
      ]}
      destroyOnHidden
    >
      {!draft ? null : (
        <div>
          {/* 基礎情報（読み取り専用） */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>基本情報</h3>

            <div style={twoColRowStyle}>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>氏名*</div>
                <Input value={draft.name} disabled />
              </div>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>社員番号*</div>
                <Input value={draft.userId} disabled />
              </div>
            </div>

            <div style={twoColRowStyle}>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>デバイスID*</div>
                <Input value={draft.deviceId} disabled />
              </div>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>モニター名*</div>
                <TextArea
                  value={
                    draft.monitorName
                      ? draft.monitorName
                          .split(';')
                          .map(m => `${m.trim()}（モニター）`)
                          .join('\n')
                      : ''
                  }
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* 検査項目 */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>チェック項目</h3>

            <div style={twoColRowStyle}>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>起動認証</div>
                <Switch checked={draft.bootAuthentication} onChange={(v) => setBool('bootAuthentication', v)} />
                <span style={{ marginLeft: 10 }}>{draft.bootAuthentication ? '適合' : '不適合'}</span>
              </div>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>セキュリティパッチ</div>
                <Switch checked={draft.securityPatch} onChange={(v) => setBool('securityPatch', v)} />
                <span style={{ marginLeft: 10 }}>{draft.securityPatch ? '適合' : '不適合'}</span>
              </div>
            </div>

            <div style={twoColRowStyle}>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>パスワードスクリーンセーバー</div>
                <Switch
                  checked={draft.screenSaverPwd}
                  onChange={(v) => setBool('screenSaverPwd', v)}
                />
                <span style={{ marginLeft: 10 }}>
                  {draft.screenSaverPwd ? '適合' : '不適合'}
                </span>
              </div>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>ウイルス対策</div>
                <Switch
                  checked={draft.antivirusProtection}
                  onChange={(v) => setBool('antivirusProtection', v)}
                />
                <span style={{ marginLeft: 10 }}>{draft.antivirusProtection ? '適合' : '不適合'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>インストールソフトウェア</div>
                <Switch
                  checked={draft.installedSoftware}
                  onChange={(v) => setBool('installedSoftware', v)}
                />
                <span style={{ marginLeft: 10 }}>
                  {draft.installedSoftware ? '適合' : '不適合'}
                </span>
              </div>
              <div style={fieldBoxStyle}>
                <div style={labelStyle}>USBインターフェース</div>
                <Switch checked={draft.usbInterface} onChange={(v) => setBool('usbInterface', v)} />
                <span style={{ marginLeft: 10 }}>{draft.usbInterface ? '適合' : '不適合'}</span>
              </div>
            </div>
          </div>

          {/* 処置措置 */}
          <div>
            <h3 style={{ marginBottom: 16 }}>対処措置</h3>
            <TextArea
              rows={4}
              value={draft.disposalMeasures || ''}
              onChange={(e) =>
                setDraft({ ...draft, disposalMeasures: e.target.value })
              }
              placeholder="任意：対処措置または備考を入力"
              allowClear
            />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default EditModal;