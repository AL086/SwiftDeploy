import React, { useState, useMemo } from 'react';
import { Modal, Input, Select, InputNumber, Table, Button } from 'antd';

interface DeviceItem {
  nodeId: number;
  label: string;
}

interface BatchRenameDialogProps {
  open: boolean;
  devices: DeviceItem[];
  onCancel: () => void;
  onConfirm: (renames: Record<number, string>) => void;
}

const SUFFIX_OPTIONS = [
  { value: 'number', label: '数字 (1,2,3)' },
  { value: 'lower', label: '字母 a-z' },
  { value: 'upper', label: '字母 A-Z' },
  { value: 'padded', label: '01 格式' },
];

function makeSuffix(index: number, mode: string): string {
  switch (mode) {
    case 'number': return String(index);
    case 'lower': return String.fromCharCode(97 + (index - 1) % 26);
    case 'upper': return String.fromCharCode(65 + (index - 1) % 26);
    case 'padded': return String(index).padStart(2, '0');
    default: return String(index);
  }
}

const BatchRenameDialog: React.FC<BatchRenameDialogProps> = ({
  open, devices, onCancel, onConfirm,
}) => {
  const [prefix, setPrefix] = useState('PC');
  const [suffixMode, setSuffixMode] = useState('number');
  const [startNum, setStartNum] = useState(1);

  const renames = useMemo(() => {
    const result: Record<number, string> = {};
    devices.forEach((d, i) => {
      result[d.nodeId] = prefix + makeSuffix(startNum + i, suffixMode);
    });
    return result;
  }, [prefix, suffixMode, startNum, devices]);

  const columns = [
    { title: '原名', dataIndex: 'label', key: 'label', width: '50%' },
    {
      title: '新名',
      dataIndex: 'nodeId',
      key: 'newName',
      render: (_: any, record: DeviceItem) => (
        <span style={{ color: '#51cf66' }}>{renames[record.nodeId]}</span>
      ),
    },
  ];

  return (
    <Modal
      title="批量重命名"
      open={open}
      onCancel={onCancel}
      width={480}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="confirm" type="primary" onClick={() => onConfirm(renames)}>
          应用重命名
        </Button>,
      ]}
      centered
      destroyOnClose
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Prefix */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#adb5bd', fontSize: 12, width: 40 }}>前缀:</span>
          <Input
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            style={{ width: 120 }}
            size="small"
          />
        </div>

        {/* Suffix type + start */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#adb5bd', fontSize: 12, width: 40 }}>后缀:</span>
          <Select
            value={suffixMode}
            onChange={setSuffixMode}
            options={SUFFIX_OPTIONS}
            size="small"
            style={{ width: 150 }}
          />
          <span style={{ color: '#adb5bd', fontSize: 12, marginLeft: 12 }}>起始:</span>
          <InputNumber
            value={startNum}
            onChange={(v) => setStartNum(v || 1)}
            min={1}
            max={999}
            size="small"
            style={{ width: 60 }}
          />
        </div>

        {/* Preview table */}
        <div>
          <div style={{ color: '#868e96', fontSize: 11, marginBottom: 6 }}>预览:</div>
          <Table
            dataSource={devices}
            columns={columns}
            pagination={false}
            size="small"
            rowKey="nodeId"
            style={{ fontSize: 11 }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default BatchRenameDialog;
