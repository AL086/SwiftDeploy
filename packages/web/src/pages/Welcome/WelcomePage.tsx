import React from 'react';
import { useAppStore } from '../../stores/useAppStore';

interface ActionButtonProps {
  name: string;
  desc: string;
  icon: string;
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ name, desc, icon, onClick }) => (
  <div
    onClick={onClick}
    style={{
      width: 200,
      height: 120,
      backgroundColor: '#212529',
      border: '1px solid #343a40',
      borderRadius: 10,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 14,
      transition: 'all 0.1s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = '#2d2d2d';
      e.currentTarget.style.borderColor = '#748ffc';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = '#212529';
      e.currentTarget.style.borderColor = '#343a40';
    }}
  >
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#25262b',
        border: '1px solid #373a40',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#748ffc',
        fontSize: 20,
        fontWeight: 'bold',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ color: '#e9ecef', fontSize: 14, fontWeight: 'bold' }}>{name}</div>
      <div style={{ color: '#868e96', fontSize: 9, marginTop: 4, lineHeight: 1.3 }}>{desc}</div>
    </div>
  </div>
);

const FIVE_BUTTONS: ActionButtonProps[] = [
  { name: '一键装机', desc: '选择模板快速部署标准网络拓扑', icon: 'P', onClick: () => {} },
  { name: '主机管理', desc: '服务器发现、清单与状态监控', icon: 'H', onClick: () => {} },
  { name: '重装系统', desc: 'PXE/iPXE 自动化操作系统部署', icon: 'I', onClick: () => {} },
  { name: '监控告警', desc: '实时性能指标与智能告警系统', icon: 'M', onClick: () => {} },
  { name: '云平台', desc: 'OpenStack/K8s/Ceph 集群管理', icon: 'C', onClick: () => {} },
];

interface WelcomePageProps {
  onOneClickDeploy: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onOneClickDeploy }) => {
  const { connected, serverVersion } = useAppStore();

  const buttons = FIVE_BUTTONS.map((btn, i) => ({
    ...btn,
    onClick: i === 0 ? onOneClickDeploy : () => useAppStore.getState().setCurrentPage(i + 1),
  }));

  return (
    <div style={{ padding: 40 }}>
      <div style={{ color: '#e9ecef', fontSize: 22, fontWeight: 'bold', paddingBottom: 4 }}>
        欢迎使用轻舟 SwiftDeploy
      </div>
      <div style={{ color: '#868e96', fontSize: 13, paddingBottom: 12 }}>
        全栈运维平台 — 从设备规划到日常运维的一站式解决方案
      </div>
      <div
        style={{
          color: connected ? '#51cf66' : '#ff6b6b',
          fontSize: 12,
          paddingBottom: 12,
        }}
      >
        后端状态: {connected ? `已连接 (v${serverVersion})` : '未连接'}
      </div>

      <div style={{ height: 1, backgroundColor: '#343a40', margin: 0, padding: 0 }} />

      <div style={{ height: 20 }} />

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {buttons.map((btn, i) => (
          <ActionButton key={i} {...btn} />
        ))}
      </div>
    </div>
  );
};

export default WelcomePage;
