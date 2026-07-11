import React from 'react';

interface TopologyToolbarProps {
  blueprintName: string;
  onNameChange: (name: string) => void;
  onToggleTemplate: () => void;
  onClearCanvas: () => void;
  drawingMode: string;
  onSetDrawingMode: (mode: string) => void;
}

const DRAWING_TOOLS = [
  { mode: 'select', label: 'S', title: '选择' },
  { mode: 'label', label: 'T', title: '标签' },
  { mode: 'circle', label: '○', title: '圆形' },
  { mode: 'rect', label: '□', title: '矩形' },
  { mode: 'line', label: '／', title: '直线' },
  { mode: 'connector', label: '⇌', title: '连线' },
];

const TopologyToolbar: React.FC<TopologyToolbarProps> = ({
  blueprintName, onNameChange, onToggleTemplate, onClearCanvas,
  drawingMode, onSetDrawingMode,
}) => {
  return (
    <div
      style={{
        height: 48,
        backgroundColor: '#212529',
        borderBottom: '1px solid #2d2d2d',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 8,
      }}
    >
      {/* Blueprint name */}
      <input
        type="text"
        value={blueprintName}
        onChange={(e) => onNameChange(e.target.value)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#e9ecef',
          fontSize: 15,
          fontWeight: 'bold',
          outline: 'none',
          width: 140,
        }}
      />

      <div style={{ width: 1, height: 24, backgroundColor: '#2d2d2d' }} />

      {/* Template button */}
      <button
        onClick={onToggleTemplate}
        style={{
          padding: '4px 12px',
          border: '1px solid #2d2d2d',
          borderRadius: 4,
          background: '#25262b',
          color: '#868e96',
          fontSize: 12,
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2d2d2d'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#25262b'; }}
      >
        模板
      </button>

      <div style={{ width: 1, height: 24, backgroundColor: '#2d2d2d' }} />

      {/* Drawing tools */}
      {DRAWING_TOOLS.map((tool) => (
        <button
          key={tool.mode}
          onClick={() => onSetDrawingMode(tool.mode)}
          title={tool.title}
          style={{
            width: 26,
            height: 26,
            border: '1px solid #2d2d2d',
            borderRadius: 4,
            background: drawingMode === tool.mode ? '#364fc7' : '#25262b',
            color: drawingMode === tool.mode ? '#fff' : '#868e96',
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            if (drawingMode !== tool.mode) {
              e.currentTarget.style.backgroundColor = '#2d2d2d';
            }
          }}
          onMouseLeave={(e) => {
            if (drawingMode !== tool.mode) {
              e.currentTarget.style.backgroundColor = '#25262b';
            }
          }}
        >
          {tool.label}
        </button>
      ))}

      <div style={{ flex: 1 }} />

      {/* Clear canvas */}
      <button
        onClick={onClearCanvas}
        style={{
          padding: '4px 12px',
          border: '1px solid #4a1515',
          borderRadius: 4,
          background: '#4a1515',
          color: '#ff6b6b',
          fontSize: 12,
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#6b2020'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4a1515'; }}
      >
        一键清空
      </button>
    </div>
  );
};

export default TopologyToolbar;
