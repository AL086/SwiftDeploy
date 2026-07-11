import React, { memo } from 'react';
import { NodeProps } from 'reactflow';

const LineShapeNode: React.FC<NodeProps> = ({ selected, data }) => {
  const w = (data.width as number) || 80;
  const h = (data.height as number) || 2;

  return (
    <div style={{ width: w, height: h, cursor: 'pointer', pointerEvents: 'all' }}>
      <svg width={w} height={h} style={{ overflow: 'visible', display: 'block' }}>
        <line
          x1={0}
          y1={h > 4 ? 0 : h / 2}
          x2={w}
          y2={h > 4 ? h : h / 2}
          stroke={selected ? '#748ffc' : '#ff922b'}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default memo(LineShapeNode);
