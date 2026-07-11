import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface RouterPort {
  name: string;
  enabled: boolean;
  mode: string;
  vlan_id: number;
}

const DEFAULT_PORTS: RouterPort[] = [
  { name: 'e0/0/0', enabled: true, mode: 'access', vlan_id: 1 },
  { name: 'e0/0/1', enabled: true, mode: 'access', vlan_id: 1 },
  { name: 'e0/0/2', enabled: false, mode: 'trunk', vlan_id: 1 },
  { name: 'e0/0/3', enabled: true, mode: 'access', vlan_id: 2 },
];

const RouterNode: React.FC<NodeProps> = ({ data, selected }) => {
  const [hover, setHover] = useState(false);
  const label = data.label as string;
  const ip = data.ip as string | undefined;
  const mac = data.mac as string | undefined;
  const ports: RouterPort[] = (data.ports as RouterPort[]) || DEFAULT_PORTS;
  const dhcpEnabled = data.dhcp && (data.dhcp as any).enabled;
  const color = '#748ffc';

  const summary = ports.filter(p => p.enabled).length + '/' + ports.length + ' up · VLANs: ' + [...new Set(ports.filter(p => p.enabled).map(p => p.vlan_id))].join(',');

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={`${label}\nIP: ${ip || '-'}\nMAC: ${mac || '-'}\n端口: ${ports.map(p => `${p.name}=${p.enabled ? 'up' : 'down'}`).join(', ')}\nDHCP: ${dhcpEnabled ? '启用' : '禁用'}`}
      style={{
        padding: '10px 12px',
        borderRadius: 10,
        border: `2px solid ${selected ? '#748ffc' : hover ? '#e9ecef' : color}`,
        background: `linear-gradient(135deg, ${color}18, #1a1b1e 80%)`,
        backgroundColor: '#1a1b1e',
        minWidth: 150,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: hover
          ? `0 0 20px ${color}44, 0 4px 12px rgba(0,0,0,0.3)`
          : selected
          ? '0 0 12px rgba(116,143,252,0.3)'
          : '0 2px 6px rgba(0,0,0,0.2)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${color}44, ${color}22)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            fontSize: 16,
            lineHeight: 1,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            transform: hover ? 'scale(1.15)' : 'scale(1)',
            boxShadow: hover ? `0 0 12px ${color}66` : 'none',
            flexShrink: 0,
          }}
        >
          ◇
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#e9ecef', fontSize: 12, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
          {ip && <div style={{ color: '#adb5bd', fontSize: 9, fontFamily: 'monospace' }}>{ip}</div>}
          {mac && !ip && <div style={{ color: '#495057', fontSize: 9 }}>{mac}</div>}
        </div>
        {dhcpEnabled && (
          <div
            title="DHCP 已启用"
            style={{
              backgroundColor: '#51cf6622', color: '#51cf66',
              fontSize: 8, padding: '2px 5px', borderRadius: 4,
              fontWeight: 'bold', flexShrink: 0,
            }}
          >
            DHCP
          </div>
        )}
      </div>

      {/* Summary line */}
      <div style={{ color: '#868e96', fontSize: 8, marginBottom: 5, textAlign: 'center' }}>{summary}</div>

      {/* Port indicators */}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
        {ports.map((port, i) => (
          <div
            key={i}
            title={`${port.name} · ${port.enabled ? 'up' : 'down'} · ${port.mode.toUpperCase()} · VLAN ${port.vlan_id}`}
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              backgroundColor: port.enabled ? '#51cf66' : '#fa5252',
              opacity: port.enabled ? 1 : 0.5,
              transition: 'all 0.15s',
              transform: hover ? 'scale(1.3)' : 'scale(1)',
              boxShadow: port.enabled && hover ? '0 0 6px #51cf66aa' : 'none',
            }}
          />
        ))}
      </div>

      {/* Port labels */}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 3 }}>
        {ports.map((port, i) => (
          <div
            key={i}
            style={{
              fontSize: 6,
              color: '#495057',
              width: 12,
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {port.name.split('/').pop()}
          </div>
        ))}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
};

export default memo(RouterNode);
