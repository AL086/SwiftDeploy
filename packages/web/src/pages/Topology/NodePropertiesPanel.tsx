import React, { useState } from 'react';
import { Tabs, Input, Button, Table, Select, Progress } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import DhcpConfigDialog, { DhcpConfig, DEFAULT_DHCP } from './DhcpConfigDialog';

interface RouterPort {
  name: string;
  enabled: boolean;
  mode: string;
  vlan_id: number;
  ip?: string;
}

interface VlanEntry {
  vlan_id: number;
  name: string;
}

interface NodeData {
  id: number | null;
  type: string;
  label: string;
  mac: string;
  ip: string;
  config: string;
  ports?: RouterPort[];
  vlans?: VlanEntry[];
  dhcp?: DhcpConfig;
}

interface NodePropertiesPanelProps {
  node: NodeData | null;
  onSave: (id: number, data: Partial<NodeData>) => void;
}

const PORT_MODES = [
  { value: 'access', label: 'Access' },
  { value: 'trunk', label: 'Trunk' },
  { value: 'hybrid', label: 'Hybrid' },
];

const DEFAULT_PORTS: RouterPort[] = [
  { name: 'e0/0/0', enabled: true, mode: 'access', vlan_id: 1 },
  { name: 'e0/0/1', enabled: true, mode: 'access', vlan_id: 1 },
  { name: 'e0/0/2', enabled: false, mode: 'trunk', vlan_id: 1 },
  { name: 'e0/0/3', enabled: true, mode: 'access', vlan_id: 2 },
];

const DEFAULT_VLANS: VlanEntry[] = [
  { vlan_id: 1, name: 'Default' },
];

const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({ node, onSave }) => {
  const [label, setLabel] = useState(node?.label || '');
  const [mac, setMac] = useState(node?.mac || '');
  const [ip, setIp] = useState(node?.ip || '');
  const [config, setConfig] = useState(node?.config || '{}');
  const [dhcpOpen, setDhcpOpen] = useState(false);
  const [localPorts, setLocalPorts] = useState<RouterPort[]>(node?.ports || DEFAULT_PORTS);
  const [localVlans, setLocalVlans] = useState<VlanEntry[]>(node?.vlans || DEFAULT_VLANS);

  React.useEffect(() => {
    setLabel(node?.label || '');
    setMac(node?.mac || '');
    setIp(node?.ip || '');
    setConfig(node?.config || '{}');
    setLocalPorts(node?.ports || DEFAULT_PORTS);
    setLocalVlans(node?.vlans || DEFAULT_VLANS);
  }, [node]);

  if (!node || !node.id) {
    return (
      <div
        style={{
          width: 280,
          backgroundColor: '#1a1b1e',
          borderLeft: '1px solid #2d2d2d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#495057',
          fontSize: 13,
        }}
      >
        选择节点以查看属性
      </div>
    );
  }

  const isRouter = node.type === 'router';
  const dhcpConfig: DhcpConfig = (node as any).dhcp || DEFAULT_DHCP;

  // ── Port toggle ─────────────────────────────────────────
  const togglePort = (index: number) => {
    setLocalPorts((prev) =>
      prev.map((p, i) => (i === index ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const updatePort = (index: number, key: keyof RouterPort, value: any) => {
    setLocalPorts((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [key]: value } : p))
    );
  };

  // ── VLAN add/remove ─────────────────────────────────────
  const addVlan = () => {
    const maxId = Math.max(...localVlans.map((v) => v.vlan_id), 0);
    setLocalVlans((prev) => [...prev, { vlan_id: maxId + 1, name: `VLAN ${maxId + 1}` }]);
  };

  const removeVlan = (vlanId: number) => {
    setLocalVlans((prev) => prev.filter((v) => v.vlan_id !== vlanId));
  };

  const updateVlan = (vlanId: number, key: keyof VlanEntry, value: any) => {
    setLocalVlans((prev) =>
      prev.map((v) => (v.vlan_id === vlanId ? { ...v, [key]: value } : v))
    );
  };

  // ── DHCP ────────────────────────────────────────────────
  const handleDhcpConfirm = (dhcp: DhcpConfig) => {
    setDhcpOpen(false);
    onSave(node.id!, { dhcp });
  };

  // ── Save all ────────────────────────────────────────────
  const handleSaveAll = () => {
    const data: Partial<NodeData> = { label, mac, ip, config };
    if (isRouter) {
      data.ports = localPorts;
      data.vlans = localVlans;
    }
    onSave(node.id!, data);
  };

  const portColumns = [
    { title: '端口', dataIndex: 'name', key: 'name', width: 65 },
    {
      title: '状态', dataIndex: 'enabled', key: 'enabled', width: 50,
      render: (v: boolean, _: any, index: number) => (
        <span
          onClick={() => togglePort(index)}
          style={{
            color: v ? '#51cf66' : '#ff6b6b',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: 11,
          }}
        >
          {v ? 'up' : 'down'}
        </span>
      ),
    },
    {
      title: '模式', dataIndex: 'mode', key: 'mode', width: 75,
      render: (v: string, _: any, index: number) => (
        <Select
          value={v}
          onChange={(val) => updatePort(index, 'mode', val)}
          size="small"
          style={{ width: 70 }}
          options={PORT_MODES}
        />
      ),
    },
    {
      title: 'VLAN', dataIndex: 'vlan_id', key: 'vlan_id', width: 55,
      render: (v: number, _: any, index: number) => (
        <Select
          value={v}
          onChange={(val) => updatePort(index, 'vlan_id', val)}
          size="small"
          style={{ width: 50 }}
          options={localVlans.map((vl) => ({ value: vl.vlan_id, label: vl.vlan_id }))}
        />
      ),
    },
  ];

  const vlanColumns = [
    {
      title: 'VLAN ID', dataIndex: 'vlan_id', key: 'vlan_id', width: 70,
      render: (v: number) => <span style={{ fontSize: 11 }}>{v}</span>,
    },
    {
      title: '名称', dataIndex: 'name', key: 'name',
      render: (v: string, _: any, index: number) => (
        <Input
          value={v}
          onChange={(e) => updateVlan(localVlans[index].vlan_id, 'name', e.target.value)}
          size="small"
          style={{ fontSize: 11 }}
        />
      ),
    },
    {
      title: '', key: 'action', width: 30,
      render: (_: any, record: VlanEntry) => (
        <span
          onClick={() => removeVlan(record.vlan_id)}
          style={{ color: '#ff6b6b', cursor: 'pointer', fontSize: 13 }}
        >
          ×
        </span>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'properties',
      label: '设备属性',
      children: (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <div style={{ color: '#868e96', fontSize: 10, marginBottom: 4 }}>设备类型</div>
            <div style={{
              color: '#adb5bd', fontSize: 12, backgroundColor: '#25262b',
              padding: '6px 8px', borderRadius: 4,
            }}>
              {node.type}
            </div>
          </div>
          <div>
            <div style={{ color: '#868e96', fontSize: 10, marginBottom: 4 }}>设备名称</div>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="输入设备名称"
              size="small"
            />
          </div>
          <div>
            <div style={{ color: '#868e96', fontSize: 10, marginBottom: 4 }}>MAC 地址</div>
            <Input
              value={mac}
              onChange={(e) => setMac(e.target.value)}
              placeholder="如: AA:BB:CC:DD:EE:FF"
              size="small"
            />
          </div>
          <div>
            <div style={{ color: '#868e96', fontSize: 10, marginBottom: 4 }}>IP 地址</div>
            <Input
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="如: 192.168.1.100"
              size="small"
            />
          </div>
          <div>
            <div style={{ color: '#868e96', fontSize: 10, marginBottom: 4 }}>配置 (JSON)</div>
            <Input.TextArea
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              placeholder="{}"
              rows={3}
              style={{ fontSize: 11 }}
            />
          </div>
          <Button
            type="primary"
            size="small"
            onClick={handleSaveAll}
            style={{ marginTop: 8 }}
          >
            保存修改
          </Button>
        </div>
      ),
    },
    {
      key: 'host',
      label: '主机管理',
      children: (
        <div style={{ padding: 8 }}>
          <div style={{ color: '#868e96', fontSize: 10, marginBottom: 8 }}>关联主机信息</div>
          {mac ? (
            <Table
              dataSource={[]}
              columns={[
                { title: '主机名', dataIndex: 'hostname', key: 'hostname' },
                { title: 'IP', dataIndex: 'ip', key: 'ip' },
              ]}
              pagination={false}
              size="small"
              style={{ fontSize: 11 }}
            />
          ) : (
            <div style={{ color: '#495057', fontSize: 12, textAlign: 'center', padding: 20 }}>
              未关联主机<br />请先设置 MAC 地址
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'install',
      label: '系统安装',
      children: (
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <div style={{ color: '#868e96', fontSize: 10, marginBottom: 4 }}>安装状态</div>
            <div style={{ color: '#868e96', fontSize: 12, backgroundColor: '#25262b', padding: '6px 8px', borderRadius: 4 }}>
              未开始
            </div>
          </div>
          <div>
            <div style={{ color: '#868e96', fontSize: 10, marginBottom: 4 }}>进度</div>
            <Progress percent={0} size="small" strokeColor="#364fc7" />
          </div>
          <div>
            <div style={{ color: '#868e96', fontSize: 10, marginBottom: 4 }}>安装方式</div>
            <Select
              defaultValue="pxe"
              size="small"
              style={{ width: '100%' }}
              options={[
                { value: 'pxe', label: 'PXE' },
                { value: 'ipxe', label: 'iPXE' },
                { value: 'uefi_http', label: 'UEFI HTTP' },
                { value: 'usb', label: 'USB' },
                { value: 'iso', label: 'ISO' },
              ]}
            />
          </div>
          <div>
            <div style={{ color: '#868e96', fontSize: 10, marginBottom: 4 }}>系统镜像</div>
            <Select
              defaultValue="ubuntu"
              size="small"
              style={{ width: '100%' }}
              options={[
                { value: 'ubuntu', label: 'Ubuntu 24.04 LTS' },
                { value: 'rocky', label: 'Rocky Linux 9' },
                { value: 'debian', label: 'Debian 12' },
                { value: 'rhel', label: 'RHEL 9' },
                { value: 'windows', label: 'Windows Server 2022' },
              ]}
            />
          </div>
          <div>
            <div style={{ color: '#868e96', fontSize: 10, marginBottom: 4 }}>安装日志</div>
            <div
              style={{
                backgroundColor: '#141517', color: '#868e96',
                border: '1px solid #2d2d2d', borderRadius: 4,
                padding: 4, fontSize: 10, fontFamily: 'monospace',
                height: 80, overflow: 'auto',
              }}
            >
              等待安装触发...
            </div>
          </div>
          <Button danger size="small">
            触发安装
          </Button>
        </div>
      ),
    },
  ];

  if (isRouter) {
    tabItems.push({
      key: 'device-mgmt',
      label: '设备管理',
      children: (
        <div style={{ padding: 8 }}>
          {/* DHCP section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ color: '#adb5bd', fontSize: 10, fontWeight: 'bold' }}>DHCP 服务器</div>
            <Button
              size="small"
              icon={<SettingOutlined />}
              onClick={() => setDhcpOpen(true)}
              style={{ fontSize: 10, height: 22 }}
            >
              配置
            </Button>
          </div>
          <div
            style={{
              backgroundColor: '#25262b',
              borderRadius: 4,
              padding: '6px 8px',
              marginBottom: 12,
              fontSize: 11,
              color: dhcpConfig.enabled ? '#51cf66' : '#868e96',
            }}
          >
            {dhcpConfig.enabled
              ? `DHCP: ${dhcpConfig.poolStart} - ${dhcpConfig.poolEnd}`
              : 'DHCP 已禁用'}
          </div>

          {/* Port Configuration */}
          <div style={{ color: '#adb5bd', fontSize: 10, fontWeight: 'bold', marginBottom: 6 }}>端口配置 (点击状态切换)</div>
          <Table
            dataSource={localPorts}
            columns={portColumns}
            pagination={false}
            size="small"
            rowKey="name"
          />

          {/* VLAN Configuration */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 6 }}>
            <div style={{ color: '#adb5bd', fontSize: 10, fontWeight: 'bold' }}>VLAN 配置</div>
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={addVlan}
              style={{ fontSize: 10, height: 22 }}
            />
          </div>
          <Table
            dataSource={localVlans}
            columns={vlanColumns}
            pagination={false}
            size="small"
            rowKey="vlan_id"
          />

          {/* Save button for router data */}
          <Button
            type="primary"
            size="small"
            onClick={handleSaveAll}
            style={{ marginTop: 12, width: '100%' }}
          >
            保存设备配置
          </Button>

          {/* DHCP Dialog */}
          <DhcpConfigDialog
            open={dhcpOpen}
            config={dhcpConfig}
            onCancel={() => setDhcpOpen(false)}
            onConfirm={handleDhcpConfirm}
          />
        </div>
      ),
    });
  }

  return (
    <div
      style={{
        width: 280,
        backgroundColor: '#1a1b1e',
        borderLeft: '1px solid #2d2d2d',
        overflow: 'auto',
      }}
    >
      <Tabs
        items={tabItems}
        size="small"
        style={{ height: '100%' }}
      />
    </div>
  );
};

export default NodePropertiesPanel;
