import React, { useState } from 'react';
import { Modal, InputNumber, Button } from 'antd';

interface DeviceType {
  type: string;
  name: string;
  color: string;
}

const DEVICE_TYPES: DeviceType[] = [
  { type: 'router', name: '路由器', color: '#748ffc' },
  { type: 'firewall', name: '防火墙', color: '#ff6b6b' },
  { type: 'switch', name: '交换机', color: '#20c997' },
  { type: 'ac', name: 'AC 控制器', color: '#22b8cf' },
  { type: 'ap', name: 'AP 接入点', color: '#fcc419' },
  { type: 'load_balancer', name: '负载均衡', color: '#ff922b' },
  { type: 'server', name: '服务器', color: '#51cf66' },
  { type: 'storage', name: '存储设备', color: '#845ef7' },
];

interface BatchCreateDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (counts: Record<string, number>) => void;
}

const BatchCreateDialog: React.FC<BatchCreateDialogProps> = ({ open, onCancel, onConfirm }) => {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const setCount = (type: string, value: number | null) => {
    const v = Math.max(0, Math.min(50, value || 0));
    setCounts((prev) => ({ ...prev, [type]: v }));
  };

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const hasAny = total > 0;

  return (
    <Modal
      title="批量新建设备"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={480}
      centered
      styles={{
        header: { backgroundColor: '#1a1b1e', color: '#e9ecef', borderBottom: '1px solid #2d2d2d' },
        content: { backgroundColor: '#1a1b1e', color: '#e9ecef' },
        body: { paddingTop: 16 },
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ color: '#868e96', fontSize: 11, marginBottom: 6 }}>
          选择设备类型和数量，点击一键生成自动排列到画布
        </div>
        {DEVICE_TYPES.map((dev) => (
          <div
            key={dev.type}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '6px 8px',
              borderRadius: 6,
              backgroundColor: '#25262b',
            }}
          >
            {/* Color + label */}
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 5,
                backgroundColor: dev.color + '22',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: dev.color,
                fontSize: 11,
                fontWeight: 'bold',
                flexShrink: 0,
              }}
            >
              {dev.type === 'router' ? '◇' : dev.type === 'switch' ? '⬡' : dev.type === 'server' ? '⊞' : '▤'}
            </div>
            <div style={{ flex: 1, color: '#e9ecef', fontSize: 12 }}>{dev.name}</div>
            <InputNumber
              min={0}
              max={50}
              value={counts[dev.type] || 0}
              onChange={(v) => setCount(dev.type, v)}
              size="small"
              style={{ width: 60 }}
              controls
            />
          </div>
        ))}
      </div>

      {/* Summary + Generate */}
      <div
        style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: '1px solid #2d2d2d',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ color: '#868e96', fontSize: 12 }}>
          共 <span style={{ color: '#748ffc', fontWeight: 'bold' }}>{total}</span> 台设备
        </div>
        <Button
          type="primary"
          disabled={!hasAny}
          onClick={() => onConfirm(counts)}
          style={{ minWidth: 120 }}
        >
          一键生成
        </Button>
      </div>
    </Modal>
  );
};

export default BatchCreateDialog;
