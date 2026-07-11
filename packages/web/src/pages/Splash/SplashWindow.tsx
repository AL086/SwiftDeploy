import React, { useEffect } from 'react';

interface SplashWindowProps {
  onFinish: () => void;
}

const SplashWindow: React.FC<SplashWindowProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1b1e',
        color: '#e9ecef',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          backgroundColor: '#364fc7',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          fontWeight: 'bold',
          marginBottom: 24,
        }}
      >
        S
      </div>
      <div style={{ fontSize: 24, fontWeight: 'bold', letterSpacing: 4, marginBottom: 8 }}>
        轻 舟
      </div>
      <div style={{ color: '#748ffc', fontSize: 14, fontWeight: 'bold', letterSpacing: 3 }}>
        SwiftDeploy
      </div>
      <div style={{ color: '#495057', fontSize: 12, marginTop: 4 }}>v0.1.0</div>
    </div>
  );
};

export default SplashWindow;
