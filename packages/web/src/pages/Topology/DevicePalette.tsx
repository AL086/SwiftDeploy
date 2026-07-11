import React, { useState } from 'react';

interface DeviceType {
  type: string;
  name: string;
  color: string;
  icon: string;
}

const DEVICE_CATEGORIES: { category: string; devices: DeviceType[] }[] = [
  {
    category: '网络基础设施',
    devices: [
      { type: 'router', name: '路由器', color: '#748ffc', icon: '◇' },
      { type: 'switch', name: '交换机', color: '#20c997', icon: '⬡' },
      { type: 'firewall', name: '防火墙', color: '#ff6b6b', icon: '▤' },
      { type: 'ac', name: 'AC 控制器', color: '#22b8cf', icon: '⌂' },
      { type: 'ap', name: 'AP 接入点', color: '#fcc419', icon: '◉' },
    ],
  },
  {
    category: '计算与存储',
    devices: [
      { type: 'server', name: '服务器', color: '#51cf66', icon: '⊞' },
      { type: 'storage', name: '存储设备', color: '#845ef7', icon: '▤' },
      { type: 'load_balancer', name: '负载均衡', color: '#ff922b', icon: '⇌' },
    ],
  },
];

const TEMPLATES: { name: string; desc: string; counts: Record<string, number> }[] = [
  { name: '小型办公网络', desc: '适合小型企业的标准网络', counts: { router: 1, switch: 1, ac: 1, ap: 2, server: 3 } },
  { name: '数据中心标准', desc: '标准数据中心拓扑', counts: { router: 2, firewall: 2, switch: 4, server: 20, storage: 2, load_balancer: 2 } },
  { name: '校园网络', desc: '校园/园区网络覆盖', counts: { router: 1, firewall: 1, switch: 3, ac: 3, ap: 10, server: 5 } },
];

interface DevicePaletteProps {
  counts: Record<string, number>;
  onAddDevice: (type: string, quantity: number) => void;
  onApplyTemplate: (counts: Record<string, number>) => void;
  placementType: string | null;
  batchMode: boolean;
  onPlacementSelect: (type: string | null, shiftKey: boolean) => void;
}

const DevicePalette: React.FC<DevicePaletteProps> = ({ counts, onAddDevice, onApplyTemplate, placementType, batchMode, onPlacementSelect }) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (type: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [type]: Math.max(0, Math.min(99, value)) }));
  };

  const handleAdd = (type: string) => {
    const qty = quantities[type] || 1;
    if (qty > 0) {
      onAddDevice(type, qty);
    }
  };

  const handleCardClick = (type: string, shiftKey: boolean) => {
    onPlacementSelect(type, shiftKey);
  };

  // Cancel placement mode
  const handleCancelPlacement = () => {
    onPlacementSelect(null, false);
  };

  return (
    <div
      style={{
        width: 200,
        backgroundColor: '#141517',
        display: 'flex',
        flexDirection: 'column',
        padding: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Title */}
      <div style={{ color: '#e9ecef', fontSize: 11, fontWeight: 'bold', marginBottom: 8 }}>
        设备面板
      </div>

      {/* Template selector */}
      <div style={{ color: '#868e96', fontSize: 10, marginBottom: 4 }}>拓扑模板</div>
      <select
        id="template-select"
        style={{
          width: '100%',
          backgroundColor: '#25262b',
          color: '#e9ecef',
          border: '1px solid #373a40',
          borderRadius: 4,
          padding: '4px 8px',
          fontSize: 12,
          marginBottom: 6,
          outline: 'none',
        }}
      >
        {TEMPLATES.map((t, i) => (
          <option key={i} value={i}>{t.name}</option>
        ))}
      </select>
      <button
        onClick={() => {
          const sel = document.getElementById('template-select') as HTMLSelectElement;
          const idx = parseInt(sel?.value || '0');
          onApplyTemplate(TEMPLATES[idx].counts);
        }}
        style={{
          width: '100%',
          height: 26,
          backgroundColor: '#364fc7',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: 8,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#4263eb'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#364fc7'; }}
      >
        应用模板
      </button>

      {/* Placement mode indicator */}
      {placementType && (
        <div
          style={{
            backgroundColor: batchMode ? '#fcc41922' : '#748ffc22',
            border: `1px solid ${batchMode ? '#fcc419' : '#748ffc'}`,
            borderRadius: 4,
            padding: '4px 8px',
            marginBottom: 6,
            fontSize: 10,
            color: batchMode ? '#fcc419' : '#748ffc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{batchMode ? '批量放置模式' : '放置模式'}</span>
          <span
            onClick={handleCancelPlacement}
            style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: 12, color: '#868e96' }}
          >
            ×
          </span>
        </div>
      )}

      {/* Separator */}
      <div style={{ height: 1, backgroundColor: '#2d2d2d', marginBottom: 8 }} />

      {/* Quick-add area - icon grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {DEVICE_CATEGORIES.map((cat) => (
          <div key={cat.category} style={{ marginBottom: 8 }}>
            <div
              style={{
                color: '#adb5bd',
                fontSize: 10,
                fontWeight: 'bold',
                marginBottom: 6,
                paddingTop: 4,
              }}
            >
              {cat.category}
            </div>

            {/* Icon grid: 2 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {cat.devices.map((dev) => {
                const isSelected = placementType === dev.type;
                const existingCount = counts[dev.type] || 0;

                return (
                  <div key={dev.type} style={{ position: 'relative' }}>
                    {/* Main card */}
                    <div
                      onClick={(e) => handleCardClick(dev.type, e.shiftKey)}
                      title={`点击放置${dev.name} · Shift+点击批量放置`}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '8px 4px',
                        borderRadius: 8,
                        backgroundColor: isSelected
                          ? batchMode ? '#fcc41922' : dev.color + '22'
                          : '#1a1b1e',
                        border: `2px solid ${
                          isSelected
                            ? batchMode ? '#fcc419' : dev.color
                            : 'transparent'
                        }`,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        boxShadow: isSelected
                          ? batchMode
                            ? '0 0 8px #fcc41966'
                            : `0 0 8px ${dev.color}66`
                          : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#25262b';
                          e.currentTarget.style.borderColor = '#373a40';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#1a1b1e';
                          e.currentTarget.style.borderColor = 'transparent';
                        }
                      }}
                    >
                      {/* Device icon */}
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 6,
                          background: isSelected
                            ? `linear-gradient(135deg, ${dev.color}66, ${dev.color}33)`
                            : `${dev.color}18`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: dev.color,
                          fontSize: 14,
                          marginBottom: 3,
                          transition: 'transform 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        {dev.icon}
                      </div>

                      {/* Device name */}
                      <div
                        style={{
                          color: isSelected ? (batchMode ? '#fcc419' : dev.color) : '#adb5bd',
                          fontSize: 9,
                          fontWeight: isSelected ? 'bold' : 'normal',
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%',
                        }}
                      >
                        {dev.name}
                      </div>

                      {/* Count badge */}
                      {existingCount > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 2,
                            right: 4,
                            color: '#748ffc',
                            fontSize: 9,
                            fontWeight: 'bold',
                          }}
                        >
                          {existingCount}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DevicePalette;
