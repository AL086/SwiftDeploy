import React, { useState, useEffect } from 'react';
import { Modal, Input, Switch, InputNumber } from 'antd';

export interface DhcpConfig {
  enabled: boolean;
  poolStart: string;
  poolEnd: string;
  subnetMask: string;
  gateway: string;
  dnsPrimary: string;
  dnsSecondary: string;
  leaseTime: number;
}

interface DhcpConfigDialogProps {
  open: boolean;
  config: DhcpConfig;
  onCancel: () => void;
  onConfirm: (config: DhcpConfig) => void;
}

const DEFAULT_DHCP: DhcpConfig = {
  enabled: true,
  poolStart: '192.168.1.100',
  poolEnd: '192.168.1.200',
  subnetMask: '255.255.255.0',
  gateway: '192.168.1.1',
  dnsPrimary: '114.114.114.114',
  dnsSecondary: '8.8.8.8',
  leaseTime: 86400,
};

const DhcpConfigDialog: React.FC<DhcpConfigDialogProps> = ({ open, config, onCancel, onConfirm }) => {
  const [local, setLocal] = useState<DhcpConfig>(config);

  useEffect(() => {
    if (open) setLocal(config);
  }, [open, config]);

  const update = (key: keyof DhcpConfig, value: any) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  };

  const FieldRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <div style={{ color: '#868e96', fontSize: 12, width: 90, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );

  return (
    <Modal
      title="DHCP 服务器配置"
      open={open}
      onCancel={onCancel}
      onOk={() => onConfirm(local)}
      okText="保存"
      cancelText="取消"
      okButtonProps={{ style: { backgroundColor: '#364fc7' } }}
      centered
      width={480}
    >
      <div style={{ padding: '8px 0' }}>
        <FieldRow label="启用 DHCP">
          <Switch
            checked={local.enabled}
            onChange={(v) => update('enabled', v)}
          />
        </FieldRow>

        <div style={{ height: 1, backgroundColor: '#2d2d2d', margin: '12px 0' }} />

        <FieldRow label="地址池起始">
          <Input
            value={local.poolStart}
            onChange={(e) => update('poolStart', e.target.value)}
            size="small"
            placeholder="192.168.1.100"
            disabled={!local.enabled}
          />
        </FieldRow>
        <FieldRow label="地址池结束">
          <Input
            value={local.poolEnd}
            onChange={(e) => update('poolEnd', e.target.value)}
            size="small"
            placeholder="192.168.1.200"
            disabled={!local.enabled}
          />
        </FieldRow>
        <FieldRow label="子网掩码">
          <Input
            value={local.subnetMask}
            onChange={(e) => update('subnetMask', e.target.value)}
            size="small"
            placeholder="255.255.255.0"
            disabled={!local.enabled}
          />
        </FieldRow>
        <FieldRow label="网关">
          <Input
            value={local.gateway}
            onChange={(e) => update('gateway', e.target.value)}
            size="small"
            placeholder="192.168.1.1"
            disabled={!local.enabled}
          />
        </FieldRow>
        <FieldRow label="首选 DNS">
          <Input
            value={local.dnsPrimary}
            onChange={(e) => update('dnsPrimary', e.target.value)}
            size="small"
            placeholder="114.114.114.114"
            disabled={!local.enabled}
          />
        </FieldRow>
        <FieldRow label="备用 DNS">
          <Input
            value={local.dnsSecondary}
            onChange={(e) => update('dnsSecondary', e.target.value)}
            size="small"
            placeholder="8.8.8.8"
            disabled={!local.enabled}
          />
        </FieldRow>
        <FieldRow label="租期 (秒)">
          <InputNumber
            value={local.leaseTime}
            onChange={(v) => update('leaseTime', v || 86400)}
            size="small"
            min={60}
            max={86400 * 30}
            style={{ width: '100%' }}
            disabled={!local.enabled}
          />
        </FieldRow>
      </div>
    </Modal>
  );
};

export { DEFAULT_DHCP };
export default DhcpConfigDialog;
