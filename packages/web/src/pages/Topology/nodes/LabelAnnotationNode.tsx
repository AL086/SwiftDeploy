import React, { memo, useState, useRef, useCallback, useEffect } from 'react';
import { NodeProps } from 'reactflow';
import { useTopologyStore } from '../../../stores/useTopologyStore';

const LabelAnnotationNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(data.text as string || '标注文本');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = useCallback(() => {
    setEditing(true);
  }, []);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleBlur = useCallback(() => {
    setEditing(false);
    // Persist edited text to store
    const finalText = text.trim() || '标注文本';
    setText(finalText);
    useTopologyStore.setState((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, text: finalText } } : n
      ),
    }));
  }, [text, id]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setText(data.text as string || '标注文本');
      setEditing(false);
    }
  }, [data.text]);

  return (
    <div
      style={{
        padding: '6px 12px',
        borderRadius: 8,
        border: `1px solid ${selected ? '#748ffc' : 'transparent'}`,
        backgroundColor: 'rgba(33, 37, 41, 0.8)',
        cursor: editing ? 'text' : 'pointer',
        minWidth: 60,
        minHeight: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onDoubleClick={handleDoubleClick}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid #748ffc',
            color: '#e9ecef',
            fontSize: 12,
            textAlign: 'center',
            outline: 'none',
            width: Math.max(60, text.length * 8),
            padding: 0,
          }}
        />
      ) : (
        <div style={{ color: '#e9ecef', fontSize: 12, lineHeight: '18px', userSelect: 'none' }}>
          {text}
        </div>
      )}
    </div>
  );
};

export default memo(LabelAnnotationNode);
