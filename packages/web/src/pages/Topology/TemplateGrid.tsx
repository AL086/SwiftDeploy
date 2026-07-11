import React, { useState, useRef, useCallback } from 'react';

interface TemplateCard {
  id: string;
  name: string;
  description: string;
  devices: string[];
  total: number;
}

const SYSTEM_TEMPLATES: TemplateCard[] = [
  {
    id: 'small-office',
    name: '小型办公网络',
    description: '适用于小型企业的标准网络拓扑',
    devices: ['路由器 ×1', '交换机 ×2', '服务器 ×1', 'AP ×2'],
    total: 6,
  },
  {
    id: 'datacenter',
    name: '数据中心',
    description: '高可用数据中心标准架构',
    devices: ['核心交换机 ×2', '汇聚交换机 ×4', '服务器 ×8', '防火墙 ×2', '负载均衡 ×2', '存储 ×2'],
    total: 20,
  },
  {
    id: 'campus',
    name: '校园网络',
    description: '校园网三层层级架构',
    devices: ['核心路由器 ×2', '汇聚交换机 ×4', '接入交换机 ×8', 'AC ×2', 'AP ×16'],
    total: 32,
  },
];

const CUSTOM_TEMPLATES: TemplateCard[] = [
  {
    id: 'custom-1',
    name: '自定义模板 A',
    description: '用户自定义的拓扑模板',
    devices: ['路由器 ×1', '交换机 ×1', '服务器 ×2'],
    total: 4,
  },
];

interface TemplateGridProps {
  onSelect: (counts: Record<string, number>) => void;
  onClose: () => void;
}

type TabKey = 'library' | 'hosts' | 'custom';

const TEMPLATE_EXAMPLES = [
  { name: '路由器 ×1', type: 'router', count: 1 },
  { name: '交换机 ×2', type: 'switch', count: 2 },
  { name: '防火墙 ×1', type: 'firewall', count: 1 },
];

const TemplateGrid: React.FC<TemplateGridProps> = ({ onSelect, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('library');
  const [customList, setCustomList] = useState<TemplateCard[]>(CUSTOM_TEMPLATES);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const labelForType: Record<string, string> = {
    router: '路由器', switch: '交换机', firewall: '防火墙',
    server: '服务器', storage: '存储', load_balancer: '负载均衡',
    ac: 'AC 控制器', ap: 'AP 接入点',
  };

  // ── Template click → onSelect ────────────────────────────
  const handleTemplateClick = useCallback((template: TemplateCard) => {
    const counts: Record<string, number> = {};
    const typeMap: Record<string, string> = {
      '路由器': 'router', '交换机': 'switch', '核心交换机': 'switch',
      '汇聚交换机': 'switch', '接入交换机': 'switch', '服务器': 'server',
      '防火墙': 'firewall', '负载均衡': 'load_balancer', '存储': 'storage',
      'AC': 'ac', 'AP': 'ap',
    };
    template.devices.forEach((d) => {
      const match = d.match(/^(.+) ×(\d+)$/);
      if (match) {
        const mapped = typeMap[match[1]] || 'server';
        counts[mapped] = (counts[mapped] || 0) + parseInt(match[2]);
      }
    });
    onSelect(counts);
  }, [onSelect]);

  // ── Import JSON ──────────────────────────────────────────
  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.name && data.devices) {
          const newCard: TemplateCard = {
            id: `import-${Date.now()}`,
            name: data.name,
            description: data.description || '导入的模板',
            devices: data.devices,
            total: data.total || 0,
          };
          setCustomList((prev) => [...prev, newCard]);
          setActiveTab('custom');
        } else if (data.counts) {
          onSelect(data.counts);
        }
      } catch {
        // Invalid JSON
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [onSelect]);

  // ── Export JSON ──────────────────────────────────────────
  const handleExport = useCallback(() => {
    const data = {
      name: 'SwiftDeploy 拓扑模板',
      version: '0.1.0',
      templates: SYSTEM_TEMPLATES,
      custom: customList,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'swiftdeploy-templates.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [customList]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'library', label: '模板库' },
    { key: 'hosts', label: '仅主机' },
    { key: 'custom', label: '自定义模板' },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(26, 27, 30, 0.97)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        padding: 32,
      }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ color: '#e9ecef', fontSize: 22, fontWeight: 'bold' }}>选择部署模板</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleImport}
            style={{
              padding: '6px 16px',
              border: '1px solid #2d2d2d',
              borderRadius: 6,
              background: '#212529',
              color: '#868e96',
              fontSize: 12,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2d2d2d'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#212529'; }}
          >
            导入 JSON
          </button>
          <button
            onClick={handleExport}
            style={{
              padding: '6px 16px',
              border: '1px solid #2d2d2d',
              borderRadius: 6,
              background: '#212529',
              color: '#868e96',
              fontSize: 12,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2d2d2d'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#212529'; }}
          >
            导出 JSON
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              border: 'none',
              borderRadius: 6,
              background: 'transparent',
              color: '#868e96',
              fontSize: 18,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid #2d2d2d' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #364fc7' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === tab.key ? '#e9ecef' : '#868e96',
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Library tab ─────────────────────────────────── */}
      {activeTab === 'library' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
            overflow: 'auto',
          }}
        >
          {SYSTEM_TEMPLATES.map((t) => (
            <div
              key={t.id}
              onClick={() => handleTemplateClick(t)}
              style={{
                backgroundColor: '#212529',
                border: '1px solid #343a40',
                borderRadius: 10,
                padding: 16,
                cursor: 'pointer',
                position: 'relative',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#748ffc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#343a40'; }}
            >
              <div style={{ color: '#e9ecef', fontSize: 14, fontWeight: 'bold', marginBottom: 6 }}>
                {t.name}
              </div>
              <div style={{ color: '#868e96', fontSize: 11, marginBottom: 10 }}>
                {t.description}
              </div>
              <div style={{ color: '#adb5bd', fontSize: 10, lineHeight: 1.6 }}>
                {t.devices.map((d, i) => (
                  <div key={i}>{d}</div>
                ))}
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  backgroundColor: '#364fc7',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 'bold',
                  borderRadius: 10,
                  padding: '2px 8px',
                }}
              >
                {t.total} 台
              </div>
            </div>
          ))}

          {/* Custom template card */}
          <div
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = (e: any) => {
                const file = e.target?.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                  try {
                    const data = JSON.parse(evt.target?.result as string);
                    if (data.counts) {
                      onSelect(data.counts);
                    } else if (data.devices) {
                      handleTemplateClick({
                        id: `inline-${Date.now()}`,
                        name: data.name || '导入模板',
                        description: data.description || '',
                        devices: data.devices,
                        total: data.total || 0,
                      });
                    }
                  } catch {/* ignore */}
                };
                reader.readAsText(file);
              };
              input.click();
            }}
            style={{
              backgroundColor: '#212529',
              border: '2px dashed #343a40',
              borderRadius: 10,
              padding: 16,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 140,
              color: '#495057',
              fontSize: 13,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#748ffc'; e.currentTarget.style.color = '#748ffc'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#343a40'; e.currentTarget.style.color = '#495057'; }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>+</div>
            <div>导入自定义模板</div>
          </div>
        </div>
      )}

      {/* ── Hosts tab ────────────────────────────────────── */}
      {activeTab === 'hosts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' }}>
          <div style={{ color: '#e9ecef', fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
            已发现主机
          </div>
          <div
            style={{
              backgroundColor: '#212529',
              border: '1px dashed #343a40',
              borderRadius: 8,
              padding: 24,
              textAlign: 'center',
            }}
          >
            <div style={{ color: '#868e96', fontSize: 13, marginBottom: 12 }}>
              暂未发现主机
            </div>
            <div style={{ color: '#495057', fontSize: 11, lineHeight: 1.6 }}>
              主机自动发现功能将在后端连接后启用<br />
              您也可以前往「网络拓扑」手动添加设备
            </div>
          </div>

          {/* Quick-add host devices */}
          <div style={{ color: '#e9ecef', fontSize: 14, fontWeight: 'bold', marginTop: 8, marginBottom: 4 }}>
            快速添加
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TEMPLATE_EXAMPLES.map((ex, i) => (
              <div
                key={i}
                onClick={() => onSelect({ [ex.type]: ex.count })}
                style={{
                  backgroundColor: '#25262b',
                  border: '1px solid #343a40',
                  borderRadius: 8,
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: '#adb5bd',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#748ffc'; e.currentTarget.style.backgroundColor = '#2d2d2d'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#343a40'; e.currentTarget.style.backgroundColor = '#25262b'; }}
              >
                {ex.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Custom tab ───────────────────────────────────── */}
      {activeTab === 'custom' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
            overflow: 'auto',
          }}
        >
          {customList.map((t) => (
            <div
              key={t.id}
              onClick={() => handleTemplateClick(t)}
              style={{
                backgroundColor: '#212529',
                border: '1px solid #343a40',
                borderRadius: 10,
                padding: 16,
                cursor: 'pointer',
                position: 'relative',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#748ffc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#343a40'; }}
            >
              <div style={{ color: '#e9ecef', fontSize: 14, fontWeight: 'bold', marginBottom: 6 }}>
                {t.name}
              </div>
              <div style={{ color: '#868e96', fontSize: 11, marginBottom: 10 }}>
                {t.description}
              </div>
              <div style={{ color: '#adb5bd', fontSize: 10, lineHeight: 1.6 }}>
                {t.devices.map((d, i) => (
                  <div key={i}>{d}</div>
                ))}
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  backgroundColor: '#845ef7',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 'bold',
                  borderRadius: 10,
                  padding: '2px 8px',
                }}
              >
                {t.total} 台
              </div>
            </div>
          ))}

          {/* Create custom template */}
          <div
            onClick={handleImport}
            style={{
              backgroundColor: '#212529',
              border: '2px dashed #343a40',
              borderRadius: 10,
              padding: 16,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 140,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#845ef7'; e.currentTarget.style.color = '#845ef7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#343a40'; e.currentTarget.style.color = '#495057'; }}
          >
            <div style={{ fontSize: 28, marginBottom: 8, color: '#495057' }}>+</div>
            <div style={{ color: '#495057', fontSize: 13 }}>导入 JSON 模板</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateGrid;
