import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const NODE_COLORS: Record<string, string> = {
  switch: '#20c997',
  router: '#748ffc',
  firewall: '#ff6b6b',
  server: '#51cf66',
  storage: '#845ef7',
  load_balancer: '#ff922b',
  ac: '#22b8cf',
  ap: '#fcc419',
};

const NODE_LABELS: Record<string, string> = {
  switch: 'SW',
  router: 'RT',
  firewall: 'FW',
  server: 'SRV',
  storage: 'ST',
  load_balancer: 'LB',
  ac: 'AC',
  ap: 'AP',
};

const NODE_ICONS: Record<string, string> = {
  switch: '⬡',
  router: '◇',
  firewall: '▤',
  server: '⊞',
  storage: '▤',
  load_balancer: '⇌',
  ac: '⌂',
  ap: '◉',
};

const DeviceNode: React.FC<NodeProps> = ({ data, selected }) => {
  const [hover, setHover] = useState(false);
  const nodeType = (data.type as string) || 'server';
  const color = NODE_COLORS[nodeType] || '#51cf66';
  const label = data.label as string;
  const ip = data.ip as string | undefined;
  const mac = data.mac as string | undefined;
  const status = data.status as string | undefined;
  const shortLabel = NODE_LABELS[nodeType] || 'DV';
  const icon = NODE_ICONS[nodeType] || '⊞';

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={`${label}\n类型: ${nodeType}\nIP: ${ip || '-'}\nMAC: ${mac || '-'}\n状态: ${status || 'unknown'}`}
      style={{
        padding: '10px 12px',
        borderRadius: 10,
        border: `2px solid ${selected ? '#748ffc' : hover ? '#e9ecef' : color}`,
        background: selected
          ? `linear-gradient(135deg, ${color}22, #212529 80%)`
          : `linear-gradient(135deg, ${color}15, #1a1b1e 80%)`,
        backgroundColor: '#1a1b1e',
        minWidth: 130,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: hover
          ? `0 0 20px ${color}44, 0 4px 12px rgba(0,0,0,0.3)`
          : selected
          ? `0 0 12px rgba(116,143,252,0.3)`
          : '0 2px 6px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Device icon with gradient background */}
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
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: '#e9ecef', fontSize: 12, fontWeight: 'bold',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {label}
          </div>
          <div style={{ color: '#868e96', fontSize: 9, marginTop: 1 }}>
            {shortLabel}
          </div>
          {ip && <div style={{ color: '#adb5bd', fontSize: 9, marginTop: 1, fontFamily: 'monospace' }}>{ip}</div>}
        </div>
        {/* Status indicator with glow */}
        {status && (
          <div
            title={status}
            style={{
              width: 10, height: 10, borderRadius: 5, flexShrink: 0,
              backgroundColor: status === 'online' ? '#51cf66'
                : status === 'offline' ? '#fa5252'
                : status === 'provisioning' ? '#fcc419'
                : '#868e96',
              boxShadow: status === 'online' ? '0 0 6px #51cf66aa'
                : status === 'offline' ? '0 0 6px #fa5252aa'
                : 'none',
              transition: 'box-shadow 0.2s',
            }}
          />
        )}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
};

export default memo(DeviceNode);
