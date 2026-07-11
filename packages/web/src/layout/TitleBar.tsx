import React from 'react';
import { ipcService } from '../services/ipc.service';

const TitleBar: React.FC = () => {
  const titleBarStyle: any = {
    height: 40,
    backgroundColor: '#141517',
    borderBottom: '1px solid #2d2d2d',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px 0 12px',
    WebkitAppRegion: 'drag',
    userSelect: 'none',
  };

  const controlsStyle: any = {
    display: 'flex',
    gap: 0,
    WebkitAppRegion: 'no-drag',
  };

  return (
    <div style={titleBarStyle}>
      {/* App icon */}
      <div
        style={{
          width: 24,
          height: 24,
          backgroundColor: '#364fc7',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: 11,
        }}
      >
        S
      </div>

      <span
        style={{
          marginLeft: 8,
          color: '#e9ecef',
          fontSize: 10,
          fontWeight: 'bold',
        }}
      >
        轻舟 SwiftDeploy
      </span>

      <div style={{ flex: 1 }} />

      {/* Window controls */}
      <div style={controlsStyle}>
        {['─', '□', '✕'].map((text, i) => (
          <button
            key={i}
            onClick={i === 0 ? ipcService.minimize : i === 1 ? ipcService.maximize : ipcService.close}
            style={{
              width: 36,
              height: 28,
              border: 'none',
              background: 'transparent',
              color: '#868e96',
              fontSize: 13,
              borderRadius: 4,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2d2d2d';
              e.currentTarget.style.color = '#e9ecef';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#868e96';
            }}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TitleBar;
