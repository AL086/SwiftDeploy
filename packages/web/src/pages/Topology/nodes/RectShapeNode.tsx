import React, { memo } from 'react';
import { NodeProps } from 'reactflow';

const RectShapeNode: React.FC<NodeProps> = ({ selected, data }) => {
  const w = (data.width as number) || 80;
  const h = (data.height as number) || 60;

  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 8,
        border: `2px solid ${selected ? '#748ffc' : '#51cf66'}`,
        backgroundColor: 'rgba(81, 207, 102, 0.15)',
        cursor: 'pointer',
        pointerEvents: 'all',
      }}
    />
  );
};

export default memo(RectShapeNode);
