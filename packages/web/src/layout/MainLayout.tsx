import React, { useEffect, useState } from 'react';
import TitleBar from './TitleBar';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import WelcomePage from '../pages/Welcome/WelcomePage';
import TopologyPage from '../pages/Topology/TopologyPage';
import PlaceholderPage from '../pages/Placeholder/PlaceholderPage';
import LoginDialog from '../pages/Login/LoginDialog';
import { useAppStore } from '../stores/useAppStore';
import { ipcService } from '../services/ipc.service';

const PLACEHOLDER_NAMES = [
  '主机管理\n\n已集成到网络拓扑工作区\n请前往「网络拓扑」使用',
  '系统安装\n\n已集成到网络拓扑工作区\n请前往「网络拓扑」使用',
  '服务部署',
  '监控告警',
  '云平台',
  'AI 助手',
];

const MainLayout: React.FC = () => {
  const currentPage = useAppStore((s) => s.currentPage);
  const setConnected = useAppStore((s) => s.setConnected);
  const [loginVisible, setLoginVisible] = useState(false);
  const [showTemplateGrid, setShowTemplateGrid] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await ipcService.checkHealth();
        const ok = res?.success && res?.data?.status === 'ok';
        setConnected(ok, ok ? res.data.version : '');
      } catch {
        setConnected(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, [setConnected]);

  const handleOneClickDeploy = () => {
    useAppStore.getState().setCurrentPage(1);
    setShowTemplateGrid(true);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 0:
        return <WelcomePage onOneClickDeploy={handleOneClickDeploy} />;
      case 1:
        return (
          <TopologyPage
            showTemplateGrid={showTemplateGrid}
            onCloseTemplateGrid={() => setShowTemplateGrid(false)}
          />
        );
      default: {
        const idx = currentPage - 2;
        const name = idx >= 0 && idx < PLACEHOLDER_NAMES.length
          ? PLACEHOLDER_NAMES[idx]
          : '功能开发中...';
        return <PlaceholderPage message={name} />;
      }
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1a1b1e',
        border: '1px solid #2d2d2d',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <TitleBar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar onLoginClick={() => setLoginVisible(true)} />
        <div style={{ width: 1, backgroundColor: '#2d2d2d' }} />
        <div style={{ flex: 1, overflow: 'auto' }}>
          {renderContent()}
        </div>
      </div>
      <StatusBar />
      <LoginDialog
        visible={loginVisible}
        onClose={() => setLoginVisible(false)}
      />
    </div>
  );
};

export default MainLayout;
