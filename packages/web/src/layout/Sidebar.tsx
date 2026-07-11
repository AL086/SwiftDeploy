import React from 'react';
import { useAppStore } from '../stores/useAppStore';

const NAV_ITEMS = ['首页', '网络拓扑', '主机管理', '系统安装', '服务部署', '监控告警', '云平台', 'AI 助手'];

interface SidebarProps {
  onLoginClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLoginClick }) => {
  const { currentPage, setCurrentPage } = useAppStore();

  return (
    <div
      style={{
        width: 180,
        backgroundColor: '#141517',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 8px 8px',
        userSelect: 'none',
      }}
    >
      {/* App title */}
      <div style={{ padding: '0 8px 12px' }}>
        <div
          style={{
            color: '#e9ecef',
            fontSize: 18,
            fontWeight: 'bold',
            letterSpacing: 6,
          }}
        >
          轻 舟
        </div>
        <div
          style={{
            color: '#748ffc',
            fontSize: 10,
            fontWeight: 'bold',
            letterSpacing: 2,
            marginTop: 2,
          }}
        >
          SwiftDeploy
        </div>
      </div>

      {/* Separator */}
      <div style={{ height: 1, backgroundColor: '#2d2d2d', margin: '4px 0' }} />

      <div style={{ height: 4 }} />

      {/* Navigation */}
      {NAV_ITEMS.map((name, i) => (
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          style={{
            height: 38,
            border: 'none',
            borderRadius: 6,
            padding: '0 16px',
            textAlign: 'left',
            fontSize: 13,
            cursor: 'pointer',
            backgroundColor: i === currentPage ? '#364fc7' : 'transparent',
            color: i === currentPage ? '#ffffff' : '#adb5bd',
            fontWeight: i === currentPage ? 'bold' : 'normal',
          }}
          onMouseEnter={(e) => {
            if (i !== currentPage) {
              e.currentTarget.style.backgroundColor = '#2d2d2d';
              e.currentTarget.style.color = '#e9ecef';
            }
          }}
          onMouseLeave={(e) => {
            if (i !== currentPage) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#adb5bd';
            }
          }}
        >
          {name}
        </button>
      ))}

      <div style={{ flex: 1 }} />

      {/* Separator */}
      <div style={{ height: 1, backgroundColor: '#2d2d2d', margin: '4px 0' }} />

      {/* User area */}
      <div style={{ padding: '6px 8px' }}>
        <div style={{ color: '#868e96', fontSize: 12, marginBottom: 6 }}>未登录</div>
        <button
          onClick={onLoginClick}
          style={{
            width: '100%',
            height: 30,
            border: 'none',
            borderRadius: 5,
            backgroundColor: '#364fc7',
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#4263eb'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#364fc7'; }}
        >
          登 录
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
