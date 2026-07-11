import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider, Background, BackgroundVariant, Controls,
  useReactFlow,
  Node, Edge, NodeTypes, EdgeTypes, MarkerType, SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Modal } from 'antd';
import DeviceNode from './nodes/DeviceNode';
import RouterNode from './nodes/RouterNode';
import LabelAnnotationNode from './nodes/LabelAnnotationNode';
import CircleShapeNode from './nodes/CircleShapeNode';
import RectShapeNode from './nodes/RectShapeNode';
import LineShapeNode from './nodes/LineShapeNode';
import ConnectionEdge from './edges/ConnectionEdge';
import DevicePalette from './DevicePalette';
import NodePropertiesPanel from './NodePropertiesPanel';
import TopologyToolbar from './TopologyToolbar';
import TemplateGrid from './TemplateGrid';
import BatchRenameDialog from './BatchRenameDialog';
import BatchIPConfigDialog from './BatchIPConfigDialog';
import BatchCreateDialog from './BatchCreateDialog';
import { useTopologyStore } from '../../stores/useTopologyStore';

const nodeTypes: NodeTypes = {
  device: DeviceNode,
  router: RouterNode,
  labelAnnotation: LabelAnnotationNode,
  circleShape: CircleShapeNode,
  rectShape: RectShapeNode,
  lineShape: LineShapeNode,
};

const edgeTypes: EdgeTypes = {
  connection: ConnectionEdge,
};

const NODE_DIMENSIONS: Record<string, { w: number; h: number }> = {
  switch: { w: 140, h: 60 }, router: { w: 160, h: 80 },
  firewall: { w: 140, h: 60 }, server: { w: 130, h: 60 },
  storage: { w: 140, h: 60 }, load_balancer: { w: 150, h: 60 },
  ac: { w: 140, h: 60 }, ap: { w: 120, h: 60 },
};

const NODE_ROW_ORDER: Record<string, number> = {
  router: 0, firewall: 1, switch: 2, ac: 3, ap: 3,
  load_balancer: 4, server: 5, storage: 5,
};

function generateAutoLayout(counts: Record<string, number>): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const gapX = 180;
  const gapY = 100;
  const startX = 60;
  const startY = 60;
  const maxPerRow = 6;
  let nodeId = 1;
  let globalRow = 0;

  const rows: Record<number, { type: string; count: number }[]> = {};
  for (const [type, count] of Object.entries(counts)) {
    if (count > 0) {
      const row = NODE_ROW_ORDER[type] ?? 99;
      if (!rows[row]) rows[row] = [];
      rows[row].push({ type, count });
    }
  }

  const sortedRows = Object.entries(rows).sort(([a], [b]) => parseInt(a) - parseInt(b));
  for (const [, devices] of sortedRows) {
    let col = 0;
    let rowInGroup = 0;
    for (const { type, count } of devices) {
      const dim = NODE_DIMENSIONS[type] || { w: 130, h: 60 };
      for (let i = 0; i < count; i++) {
        nodes.push({
          id: `node-${nodeId}`,
          type: type === 'router' ? 'router' : 'device',
          position: {
            x: startX + col * gapX,
            y: startY + (globalRow + rowInGroup) * gapY,
          },
          data: { type, label: `${labelForType(type)}-${nodeId}` },
          style: { width: dim.w, zIndex: 1 },
        });
        nodeId++;
        col++;
        if (col >= maxPerRow) {
          col = 0;
          rowInGroup++;
        }
      }
    }
    globalRow += (col > 0 ? rowInGroup + 1 : rowInGroup) + 1;
  }
  return { nodes, edges: [] };
}

function labelForType(type: string): string {
  const map: Record<string, string> = { router: 'R', firewall: 'FW', switch: 'SW', server: 'SRV', storage: 'ST', load_balancer: 'LB', ac: 'AC', ap: 'AP' };
  return map[type] || 'DV';
}

const initialViewport = { x: 0, y: 0, zoom: 1.5 };

// ── Clipboard for copy/paste ────────────────────────────────
interface ClipboardData {
  nodes: { type: string; data: any; position: { x: number; y: number }; style?: any }[];
  edges: { source: string; target: string; type?: string }[];
}

let internalClipboard: ClipboardData | null = null;

// ── Context Menu ────────────────────────────────────────────
interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  type: 'node' | 'canvas';
  nodeId?: string;
}

// ── Drawing preview shape type ──────────────────────────────
type DrawingMode = 'select' | 'label' | 'circle' | 'rect' | 'line' | 'connector';

interface DrawingPreview {
  type: 'circleShape' | 'rectShape' | 'lineShape';
  start: { x: number; y: number };
  current: { x: number; y: number };
}

// ── Inner flow canvas ───────────────────────────────────────
interface FlowCanvasProps {
  onNodeSelect: (node: Node | null) => void;
  onContextMenu: (e: React.MouseEvent, node: Node | null) => void;
  drawingMode: DrawingMode;
  onSetDrawingMode: (mode: DrawingMode) => void;
  placementDeviceType: string | null;
  onPlaceOnCanvas: (position: { x: number; y: number }) => void;
}

const FlowCanvasInner: React.FC<FlowCanvasProps> = ({ onNodeSelect, onContextMenu, drawingMode, onSetDrawingMode, placementDeviceType, onPlaceOnCanvas }) => {
  const { nodes, edges, onNodesChange, onEdgesChange, pushUndo } = useTopologyStore();
  const reactFlowInstance = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ── Drawing state ─────────────────────────────────────────
  const [previewNode, setPreviewNode] = useState<Node | null>(null);
  const drawingRef = useRef<{ active: boolean; type: DrawingMode; startPos: { x: number; y: number } } | null>(null);
  const previewNodeRef = useRef<Node | null>(null);

  // Keep ref in sync with state for use in callbacks
  useEffect(() => {
    previewNodeRef.current = previewNode;
  }, [previewNode]);

  // ── Connector source tracking ─────────────────────────────
  const [connSource, setConnSource] = useState<string | null>(null);
  const connSourceRef = useRef<string | null>(null);
  useEffect(() => { connSourceRef.current = connSource; }, [connSource]);

  // ── Merge preview node into display nodes ─────────────────
  const displayNodes = useMemo<Node[]>(() => {
    if (previewNode) return [...nodes, previewNode];
    return nodes;
  }, [nodes, previewNode]);

  // ── Conditional pan behavior ──────────────────────────────
  const panOnDrag = useMemo(() => {
    return drawingMode === 'select' || drawingMode === 'connector' ? [1, 2] : [2];
  }, [drawingMode]);

  const nodesConnectable = drawingMode === 'connector';

  // ── One-time fit view on mount ────────────────────────────
  useEffect(() => {
    setTimeout(() => reactFlowInstance.fitView({ padding: 0.2, duration: 0 }), 100);
  }, []);

  // ── Drawing: mouse down on pane ───────────────────────────
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button !== 0) return;
    if (drawingMode === 'select') return;

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    if (drawingMode === 'label') {
      pushUndo();
      const newId = `anno-${Date.now()}`;
      useTopologyStore.setState((state) => ({
        nodes: [...state.nodes, {
          id: newId,
          type: 'labelAnnotation',
          position,
          data: { text: '标注文本' },
          style: { zIndex: -1 },
        }],
      }));
      onSetDrawingMode('select');
      return;
    }

    if (drawingMode === 'connector') return;

    // circle / rect / line — start drawing shape
    drawingRef.current = { active: true, type: drawingMode, startPos: position };

    const shapeType = drawingMode === 'circle' ? 'circleShape'
      : drawingMode === 'rect' ? 'rectShape' : 'lineShape';

    const preview: Node = {
      id: 'drawing-preview',
      type: shapeType,
      position: { ...position },
      data: { width: 1, height: 1 },
      selected: false,
    };
    setPreviewNode(preview);
  }, [drawingMode, reactFlowInstance, pushUndo, onSetDrawingMode]);

  // ── Drawing: mouse move on pane ───────────────────────────
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!drawingRef.current?.active) return;

    const currentPos = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    const start = drawingRef.current.startPos;

    const x = Math.min(start.x, currentPos.x);
    const y = Math.min(start.y, currentPos.y);
    const w = Math.abs(currentPos.x - start.x);
    const h = Math.abs(currentPos.y - start.y);

    setPreviewNode((prev) =>
      prev
        ? {
            ...prev,
            position: { x, y },
            data: { ...prev.data, width: Math.max(w, 3), height: Math.max(h, 3) },
          }
        : null
    );
  }, [reactFlowInstance]);

  // ── Drawing: mouse up on pane ─────────────────────────────
  const handleMouseUp = useCallback(() => {
    if (!drawingRef.current?.active) return;
    drawingRef.current.active = false;

    const preview = previewNodeRef.current;
    if (preview) {
      pushUndo();
      const finalNode: Node = {
        ...preview,
        id: `shape-${Date.now()}`,
        style: { ...preview.style, zIndex: -1 },
      };
      useTopologyStore.setState((state) => ({
        nodes: [...state.nodes, finalNode],
      }));
      setPreviewNode(null);
      onSetDrawingMode('select');
    }
  }, [pushUndo, onSetDrawingMode]);

  // ── Node click: connector mode ────────────────────────────
  const handleNodeClick = useCallback((_event: any, node: Node) => {
    if (drawingMode === 'connector') {
      const sourceId = connSourceRef.current;
      if (!sourceId) {
        setConnSource(node.id);
        return;
      }
      if (sourceId !== node.id) {
        pushUndo();
        useTopologyStore.setState((state) => ({
          edges: [
            ...state.edges,
            {
              id: `edge-${Date.now()}`,
              source: sourceId,
              target: node.id,
              type: 'connection',
              markerEnd: { type: MarkerType.ArrowClosed },
            },
          ],
        }));
        setConnSource(null);
      } else {
        setConnSource(null);
      }
      return;
    }
    onNodeSelect(node);
  }, [drawingMode, pushUndo, onNodeSelect]);

  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    // Placement mode: place device at click position
    if (placementDeviceType) {
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      onPlaceOnCanvas(position);
      return;
    }

    if (drawingMode === 'connector') {
      // Clicking empty space cancels connector source
      setConnSource(null);
    }
    onNodeSelect(null);
  }, [drawingMode, onNodeSelect, placementDeviceType, onPlaceOnCanvas, reactFlowInstance]);

  // ── Context menu ──────────────────────────────────────────
  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    onContextMenu(event, node);
  }, [onContextMenu]);

  const handlePaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    onContextMenu(event, null);
  }, [onContextMenu]);

  const handleNodesDelete = useCallback(() => {
    pushUndo();
  }, [pushUndo]);

  // ── Connector cursor ──────────────────────────────────────
  const getCursor = useCallback((): string => {
    switch (drawingMode) {
      case 'label': return 'text';
      case 'circle': return 'crosshair';
      case 'rect': return 'crosshair';
      case 'line': return 'crosshair';
      case 'connector': return 'pointer';
      default: return '';
    }
  }, [drawingMode]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={nodesConnectable ? (params: any) => {
          pushUndo();
          useTopologyStore.setState((state) => ({
            edges: [...state.edges, { ...params, type: 'connection', markerEnd: { type: MarkerType.ArrowClosed } }],
          }));
        } : undefined}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneContextMenu={handlePaneContextMenu}
        onNodesDelete={handleNodesDelete}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={initialViewport}
        selectionMode={SelectionMode.Partial}
        selectionOnDrag
        panOnDrag={panOnDrag}
        panOnScroll
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode="Shift"
        nodesConnectable={nodesConnectable}
        style={{ backgroundColor: '#1a1b1e', cursor: getCursor() }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2d2d2d" />
        <Controls
          style={{
            backgroundColor: '#212529',
            border: '1px solid #2d2d2d',
            borderRadius: 6,
          }}
        />
      </ReactFlow>

      {/* Connector source indicator */}
      {connSource && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#364fc7',
            color: '#fff',
            padding: '4px 14px',
            borderRadius: 6,
            fontSize: 12,
            zIndex: 100,
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
          }}
        >
          点击另一个设备完成连线 · 点击空白处取消
        </div>
      )}

      {/* Drawing mode indicator */}
      {drawingMode !== 'select' && drawingMode !== 'connector' && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(54, 79, 199, 0.9)',
            color: '#fff',
            padding: '4px 14px',
            borderRadius: 6,
            fontSize: 12,
            zIndex: 100,
            pointerEvents: 'none',
          }}
        >
          {drawingMode === 'label' && '点击画布添加标注文字'}
          {drawingMode === 'circle' && '拖拽绘制圆形'}
          {drawingMode === 'rect' && '拖拽绘制矩形'}
          {drawingMode === 'line' && '拖拽绘制直线'}
          {' · 按 Esc 取消'}
        </div>
      )}
    </div>
  );
};

// ── Main TopologyPage ───────────────────────────────────────
interface TopologyPageProps {
  showTemplateGrid: boolean;
  onCloseTemplateGrid: () => void;
}

const TopologyPage: React.FC<TopologyPageProps> = ({ showTemplateGrid, onCloseTemplateGrid }) => {
  const [blueprintName, setBlueprintName] = useState('未命名蓝图');
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('select');
  const [showTemplate, setShowTemplate] = useState(showTemplateGrid || false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, type: 'canvas' });
  const [batchRenameOpen, setBatchRenameOpen] = useState(false);
  const [batchIpOpen, setBatchIpOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [placementDeviceType, setPlacementDeviceType] = useState<string | null>(null);
  const [batchModeActive, setBatchModeActive] = useState(false);
  const [batchCreateOpen, setBatchCreateOpen] = useState(false);
  const placementRef = useRef<string | null>(null);
  const batchRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { placementRef.current = placementDeviceType; }, [placementDeviceType]);
  useEffect(() => { batchRef.current = batchModeActive; }, [batchModeActive]);

  const { nodes, edges, pushUndo, clearCanvas, setNodes, setEdges } = useTopologyStore();
  const nextNodeId = useRef(nodes.length + 1);

  // ── Context menu handler ──────────────────────────────────
  const handleContextMenu = useCallback((event: React.MouseEvent, node: Node | null) => {
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      type: node ? 'node' : 'canvas',
      nodeId: node?.id,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  // ── Clipboard ─────────────────────────────────────────────
  const handleCopy = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;
    const selectedIds = new Set(selectedNodes.map((n) => n.id));
    internalClipboard = {
      nodes: selectedNodes.map((n) => ({
        type: n.type || 'device',
        data: { ...n.data },
        position: { x: n.position.x, y: n.position.y },
        style: n.style,
      })),
      edges: edges
        .filter((e) => selectedIds.has(e.source) && selectedIds.has(e.target))
        .map((e) => ({ source: e.source, target: e.target, type: e.type })),
    };
    closeContextMenu();
  }, [nodes, edges, closeContextMenu]);

  const handlePaste = useCallback(() => {
    if (!internalClipboard || internalClipboard.nodes.length === 0) return;
    pushUndo();
    const offset = 30;
    const nodeIdMap = new Map<string, string>();
    const newNodes: Node[] = internalClipboard.nodes.map((n) => {
      const newId = `node-${nextNodeId.current++}`;
      const oldId = `node-${nextNodeId.current - 1}`;
      nodeIdMap.set(oldId, newId);
      return {
        id: newId,
        type: n.type,
        position: { x: n.position.x + offset, y: n.position.y + offset },
        data: { ...n.data },
        style: n.style,
        selected: true,
      };
    });
    const newEdges: Edge[] = internalClipboard.edges
      .map((e) => {
        const newSource = nodeIdMap.get(e.source);
        const newTarget = nodeIdMap.get(e.target);
        if (!newSource || !newTarget) return null;
        return {
          id: `edge-${nextNodeId.current++}`,
          source: newSource,
          target: newTarget,
          type: e.type || 'connection',
          markerEnd: { type: MarkerType.ArrowClosed },
        };
      })
      .filter(Boolean) as Edge[];

    useTopologyStore.setState((state) => ({
      nodes: [...state.nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
      edges: [...state.edges, ...newEdges],
    }));
    closeContextMenu();
  }, [pushUndo, closeContextMenu]);

  // ── Click outside to close context menu ───────────────────
  useEffect(() => {
    if (!contextMenu.visible) return;
    const handler = () => closeContextMenu();
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [contextMenu.visible, closeContextMenu]);

  // ── Keyboard shortcuts ────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape: cancel drawing mode
      if (e.key === 'Escape') {
        setDrawingMode('select');
        setPlacementDeviceType(null);
        setBatchModeActive(false);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) useTopologyStore.getState().redo();
        else useTopologyStore.getState().undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        useTopologyStore.getState().redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        useTopologyStore.setState((state) => ({
          nodes: state.nodes.map((n) => ({ ...n, selected: true })),
        }));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        handleCopy();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        handlePaste();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCopy, handlePaste]);

  // Sync showTemplate with prop
  useEffect(() => {
    if (showTemplateGrid) setShowTemplate(true);
  }, [showTemplateGrid]);

  // ── Handlers ──────────────────────────────────────────────
  const handleTemplateSelected = useCallback((counts: Record<string, number>) => {
    const layout = generateAutoLayout(counts);
    pushUndo();
    setNodes(layout.nodes);
    setEdges(layout.edges);
    setShowTemplate(false);
    onCloseTemplateGrid();
  }, [pushUndo, setNodes, setEdges, onCloseTemplateGrid]);

  const handleAddDevice = useCallback((type: string, quantity: number) => {
    const layout = generateAutoLayout({ [type]: quantity });
    pushUndo();
    // Offset new nodes to avoid overlapping existing ones
    const currentMaxY = nodes.reduce((max, n) => Math.max(max, n.position.y), 0);
    const newNodes = layout.nodes.map((n, i) => ({
      ...n,
      position: {
        x: n.position.x + (i * 30),
        y: n.position.y + (currentMaxY > 0 ? currentMaxY + 120 : 0),
      },
    }));
    useTopologyStore.setState((state) => ({
      nodes: [...state.nodes, ...newNodes],
    }));
  }, [pushUndo, nodes]);

  const handleClearCanvas = useCallback(() => {
    if (nodes.length === 0 && edges.length === 0) return;
    if (nodes.length > 0) {
      setDeleteConfirmOpen(true);
    }
  }, [nodes.length, edges.length]);

  const confirmClearCanvas = useCallback(() => {
    pushUndo();
    clearCanvas();
    setDeleteConfirmOpen(false);
  }, [pushUndo, clearCanvas]);

  const handleToggleTemplate = useCallback(() => setShowTemplate((prev) => !prev), []);

  // ── Node save: persist edits to store ─────────────────────
  const handleNodeSave = useCallback((id: number, data: Partial<any>) => {
    pushUndo();
    useTopologyStore.setState((state) => ({
      nodes: state.nodes.map((n) => {
        const nid = parseInt(n.id.replace(/^(node-|anno-|shape-)/, ''));
        if (nid === id) {
          return { ...n, data: { ...n.data, ...data } };
        }
        return n;
      }),
    }));
  }, [pushUndo]);

  // ── Drawing mode setter wrapper ───────────────────────────
  const handleSetDrawingMode = useCallback((mode: string) => {
    setDrawingMode(mode as DrawingMode);
  }, []);

  // ── Batch operations ──────────────────────────────────────
  const selectedDevices = useMemo(() => {
    return nodes
      .filter((n) => n.selected)
      .map((n) => ({
        nodeId: parseInt(n.id.replace('node-', '')),
        label: n.data.label as string,
        ip: (n.data.ip as string) || '',
        mac: (n.data.mac as string) || '',
      }));
  }, [nodes]);

  const handleBatchRename = useCallback(() => {
    closeContextMenu();
    if (selectedDevices.length > 0) setBatchRenameOpen(true);
  }, [selectedDevices, closeContextMenu]);

  const handleBatchRenameConfirm = useCallback((renames: Record<number, string>) => {
    pushUndo();
    useTopologyStore.setState((state) => ({
      nodes: state.nodes.map((n) => {
        const nid = parseInt(n.id.replace('node-', ''));
        if (renames[nid]) {
          return { ...n, data: { ...n.data, label: renames[nid] } };
        }
        return n;
      }),
    }));
    setBatchRenameOpen(false);
  }, [pushUndo]);

  const handleBatchIp = useCallback(() => {
    closeContextMenu();
    if (selectedDevices.length > 0) setBatchIpOpen(true);
  }, [selectedDevices, closeContextMenu]);

  const handleBatchIpConfirm = useCallback((_config: any) => {
    setBatchIpOpen(false);
  }, []);

  // ── Placement mode handlers ──────────────────────────────
  const handlePlacementSelect = useCallback((type: string | null, shiftKey: boolean) => {
    if (!type) {
      setPlacementDeviceType(null);
      setBatchModeActive(false);
      return;
    }
    // Use functional update to avoid stale closure
    setPlacementDeviceType((prev) => {
      if (prev === type) {
        // Toggle off
        setBatchModeActive(false);
        return null;
      }
      setBatchModeActive(shiftKey);
      return type;
    });
  }, []);

  const handlePlaceOnCanvas = useCallback((position: { x: number; y: number }) => {
    const currentType = placementRef.current;
    if (!currentType) return;
    pushUndo();
    const dim = NODE_DIMENSIONS[currentType] || { w: 130, h: 60 };
    const nid = nextNodeId.current++;
    const newNode: Node = {
      id: `node-${nid}`,
      type: currentType === 'router' ? 'router' : 'device',
      position: {
        x: position.x - dim.w / 2,
        y: position.y - 30,
      },
      data: {
        type: currentType,
        label: `${labelForType(currentType)}-${nid}`,
      },
      style: { width: dim.w, zIndex: 1 },
      selected: true,
    };
    useTopologyStore.setState((state) => ({
      nodes: [...state.nodes.map((n) => ({ ...n, selected: false })), newNode],
    }));
    // If not batch mode, exit placement mode after placing one
    if (!batchRef.current) {
      setPlacementDeviceType(null);
    }
  }, [pushUndo]);

  // ── Delete selected ───────────────────────────────────────
  const handleDeleteSelected = useCallback(() => {
    closeContextMenu();
    const selectedCount = nodes.filter((n) => n.selected).length;
    if (selectedCount > 0) {
      pushUndo();
      const selectedIds = new Set(nodes.filter(n => n.selected).map(n => n.id));
      useTopologyStore.setState((state) => ({
        nodes: state.nodes.filter((n) => !n.selected),
        edges: state.edges.filter((e) => !selectedIds.has(e.source) && !selectedIds.has(e.target)),
      }));
    }
  }, [nodes, closeContextMenu, pushUndo]);

  // ── Device counts ─────────────────────────────────────────
  const deviceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    nodes.forEach((n) => {
      const t = n.data.type as string;
      if (t) counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [nodes]);

  // ── Panel node data ───────────────────────────────────────
  const panelNode = selectedNode
    ? {
        id: parseInt((selectedNode.id.match(/\d+/) || ['0'])[0]),
        type: selectedNode.data.type as string || selectedNode.type || '',
        label: selectedNode.data.label as string || '',
        mac: (selectedNode.data.mac as string) || '',
        ip: (selectedNode.data.ip as string) || '',
        config: (selectedNode.data.config as string) || '{}',
        ports: selectedNode.data.ports as any,
        vlans: selectedNode.data.vlans as any,
        dhcp: selectedNode.data.dhcp as any,
      }
    : null;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <TopologyToolbar
        blueprintName={blueprintName}
        onNameChange={setBlueprintName}
        onToggleTemplate={handleToggleTemplate}
        onClearCanvas={handleClearCanvas}
        drawingMode={drawingMode}
        onSetDrawingMode={handleSetDrawingMode}
      />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <DevicePalette
          counts={deviceCounts}
          onAddDevice={handleAddDevice}
          onApplyTemplate={handleTemplateSelected}
          placementType={placementDeviceType}
          batchMode={batchModeActive}
          onPlacementSelect={handlePlacementSelect}
        />
        <div style={{ width: 1, backgroundColor: '#2d2d2d' }} />
        <ReactFlowProvider>
          <FlowCanvasInner
            onNodeSelect={setSelectedNode}
            onContextMenu={handleContextMenu}
            drawingMode={drawingMode}
            onSetDrawingMode={setDrawingMode}
            placementDeviceType={placementDeviceType}
            onPlaceOnCanvas={handlePlaceOnCanvas}
          />
        </ReactFlowProvider>
        <NodePropertiesPanel node={panelNode} onSave={handleNodeSave} />
      </div>

      {/* Template Grid */}
      {(showTemplate || showTemplateGrid) && (
        <TemplateGrid onSelect={handleTemplateSelected} onClose={() => { setShowTemplate(false); onCloseTemplateGrid(); }} />
      )}

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: '#212529',
            border: '1px solid #373a40',
            borderRadius: 8,
            padding: '4px',
            zIndex: 2000,
            minWidth: 150,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'node' ? (
            <>
              <ContextMenuItem label="复制 (Ctrl+C)" onClick={handleCopy} />
              <ContextMenuItem label="粘贴 (Ctrl+V)" onClick={handlePaste} />
              <div style={{ height: 1, backgroundColor: '#2d2d2d', margin: '4px 0' }} />
              <ContextMenuItem label="批量重命名..." onClick={handleBatchRename} />
              <ContextMenuItem label="批量 IP 配置..." onClick={handleBatchIp} />
              <div style={{ height: 1, backgroundColor: '#2d2d2d', margin: '4px 0' }} />
              <ContextMenuItem label="删除 (Delete)" onClick={handleDeleteSelected} danger />
            </>
          ) : (
            <>
              <ContextMenuItem label="批量新建..." onClick={() => { closeContextMenu(); setBatchCreateOpen(true); }} />
              <div style={{ height: 1, backgroundColor: '#2d2d2d', margin: '4px 0' }} />
              <ContextMenuItem label="粘贴 (Ctrl+V)" onClick={handlePaste} />
              <div style={{ height: 1, backgroundColor: '#2d2d2d', margin: '4px 0' }} />
              <ContextMenuItem label="一键清空" onClick={() => { closeContextMenu(); handleClearCanvas(); }} danger />
            </>
          )}
        </div>
      )}

      {/* Batch Rename Dialog */}
      <BatchRenameDialog
        open={batchRenameOpen}
        devices={selectedDevices}
        onCancel={() => setBatchRenameOpen(false)}
        onConfirm={handleBatchRenameConfirm}
      />

      {/* Batch IP Config Dialog */}
      <BatchIPConfigDialog
        open={batchIpOpen}
        devices={selectedDevices}
        onCancel={() => setBatchIpOpen(false)}
        onConfirm={handleBatchIpConfirm}
      />

      {/* Batch Create Dialog */}
      <BatchCreateDialog
        open={batchCreateOpen}
        onCancel={() => setBatchCreateOpen(false)}
        onConfirm={(counts) => {
          setBatchCreateOpen(false);
          handleTemplateSelected(counts);
        }}
      />

      {/* Delete Confirmation */}
      <Modal
        title="确认删除"
        open={deleteConfirmOpen}
        onCancel={() => setDeleteConfirmOpen(false)}
        onOk={confirmClearCanvas}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        centered
      >
        <p style={{ color: '#868e96' }}>
          确定要删除所有选中的设备{contextMenu.type === 'canvas' ? '（清空画布）' : ''}吗？此操作可以撤销。
        </p>
      </Modal>
    </div>
  );
};

// ── Context menu item component ─────────────────────────────
const ContextMenuItem: React.FC<{
  label: string;
  onClick: () => void;
  danger?: boolean;
}> = ({ label, onClick, danger }) => (
  <div
    onClick={onClick}
    style={{
      padding: '6px 12px',
      borderRadius: 4,
      cursor: 'pointer',
      color: danger ? '#ff6b6b' : '#e9ecef',
      fontSize: 13,
    }}
    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = danger ? '#4a1515' : '#2d2d2d'; }}
    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
  >
    {label}
  </div>
);

export default TopologyPage;
