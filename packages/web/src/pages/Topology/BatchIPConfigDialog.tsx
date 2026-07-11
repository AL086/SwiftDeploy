import React, { useState } from 'react';
import { Modal, Radio, Input, Button, Table } from 'antd';

interface DeviceItem {
  nodeId: number;
  label: string;
  ip: string;
  mac: string;
}

interface BatchIPConfigDialogProps {
  open: boolean;
  devices: DeviceItem[];
  onCancel: () => void;
  onConfirm: (config: IpConfigResult) => void;
}

export interface IpConfigResult {
  mode: 'dhcp' | 'static';
  dns: string[];
  gateway: string;
  subnet: string;
  deviceIps: Record<number, string>;
}

const BatchIPConfigDialog: React.FC<BatchIPConfigDialogProps> = ({
  open, devices, onCancel, onConfirm,
}) => {
  const [mode, setMode] = useState<'dhcp' | 'static'>('dhcp');
  const [dns1, setDns1] = useState('114.114.114.114');
  const [dns2, setDns2] = useState('8.8.8.8');
  const [dns3, setDns3] = useState('');
  const [dns4, setDns4] = useState('');
  const [gateway, setGateway] = useState('192.168.1.1');
  const [subnet, setSubnet] = useState('255.255.255.0');
  const [deviceIps, setDeviceIps] = useState<Record<number, string>>({});

  const handleIpChange = (nodeId: number, ip: string) => {
    setDeviceIps((prev) => ({ ...prev, [nodeId]: ip }));
  };

  const handleConfirm = () => {
    const dnsList = [dns1, dns2, dns3, dns4].filter((d) => d.trim());
    const result: IpConfigResult = {
      mode,
      dns: dnsList,
      gateway: gateway.trim(),
      subnet: subnet.trim(),
      deviceIps: mode === 'dhcp' ? {} : deviceIps,
    };
    onConfirm(result);
  };

  const columns = [
    { title: '设备', dataIndex: 'label', key: 'label', width: 80 },
    {
      title: 'IP 地址',
      key: 'ip',
      width: 140,
      render: (_: any, record: DeviceItem) => (
        mode === 'dhcp' ? (
          <span style={{ color: '#495057', fontStyle: 'italic', fontSize: 12 }}>
            待分配
          </span>
        ) : (
          <Input
            size="small"
            defaultValue={record.ip || ''}
            onChange={(e) => handleIpChange(record.nodeId, e.target.value)}
            style={{ width: 120, fontSize: 11 }}
          />
        )
      ),
    },
    { title: 'MAC', dataIndex: 'mac', key: 'mac', width: 120 },
  ];

  return (
    <Modal
      title="批量 IP 配置"
      open={open}
      onCancel={onCancel}
      width={540}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="confirm" type="primary" onClick={handleConfirm}>
          应用配置
        </Button>,
      ]}
      centered
      destroyOnClose
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Mode toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#868e96', fontSize: 12 }}>IP 模式:</span>
          <Radio.Group
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            size="small"
          >
            <Radio value="dhcp">DHCP</Radio>
            <Radio value="static">静态</Radio>
          </Radio.Group>
        </div>

        {/* DNS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ color: '#868e96', fontSize: 12, width: 40 }}>DNS:</span>
          <Input size="small" value={dns1} onChange={(e) => setDns1(e.target.value)} style={{ width: 100 }} />
          <Input size="small" value={dns2} onChange={(e) => setDns2(e.target.value)} style={{ width: 100 }} />
          <Input size="small" value={dns3} onChange={(e) => setDns3(e.target.value)} style={{ width: 100 }} />
          <Input size="small" value={dns4} onChange={(e) => setDns4(e.target.value)} style={{ width: 100 }} />
        </div>

        {/* Gateway + Subnet */}
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#868e96', fontSize: 12 }}>网关:</span>
            <Input size="small" value={gateway} onChange={(e) => setGateway(e.target.value)} style={{ width: 120 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#868e96', fontSize: 12 }}>子网掩码:</span>
            <Input size="small" value={subnet} onChange={(e) => setSubnet(e.target.value)} style={{ width: 120 }} />
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 1, backgroundColor: '#2d2d2d' }} />

        {/* Device table */}
        <div>
          <div style={{ color: '#adb5bd', fontSize: 11, fontWeight: 'bold', marginBottom: 6 }}>
            设备配置
          </div>
          <Table
            dataSource={devices}
            columns={columns}
            pagination={false}
            size="small"
            rowKey="nodeId"
          />
        </div>
      </div>
    </Modal>
  );
};

export default BatchIPConfigDialog;
