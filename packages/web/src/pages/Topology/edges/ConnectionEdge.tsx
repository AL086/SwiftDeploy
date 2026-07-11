import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';

const ConnectionEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: selected ? '#748ffc' : '#495057',
        strokeWidth: selected ? 2.5 : 2,
        cursor: 'pointer',
      }}
    />
  );
};

export default ConnectionEdge;
