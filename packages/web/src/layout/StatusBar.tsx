import React from 'react';
import { useAppStore } from '../stores/useAppStore';

const StatusBar: React.FC = () => {
  const { connected, serverVersion } = useAppStore();

  return (
    <div
      style={{
        height: 24,
        backgroundColor: '#141517',
        borderTop: '1px solid #2d2d2d',
        display: 'flex',
        alignItems: 'center',
        padding: '2px 12px',
        fontSize: 12,
        color: connected ? '#51cf66' : '#ff6b6b',
      }}
    >
      {connected
        ? `后端状态: 已连接 (v${serverVersion})`
        : '后端状态: 未连接'}
    </div>
  );
};

export default StatusBar;
