import React, { memo } from 'react';
import { NodeProps } from 'reactflow';

const CircleShapeNode: React.FC<NodeProps> = ({ selected, data }) => {
  const w = (data.width as number) || 60;
  const h = (data.height as number) || 60;

  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: '50%',
        border: `2px solid ${selected ? '#748ffc' : '#748ffc'}`,
        backgroundColor: 'rgba(116, 143, 252, 0.15)',
        cursor: 'pointer',
        pointerEvents: 'all',
      }}
    />
  );
};

export default memo(CircleShapeNode);
