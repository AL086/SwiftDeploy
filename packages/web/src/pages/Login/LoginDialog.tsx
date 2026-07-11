import React, { useState } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/useAuthStore';
import { ipcService } from '../../services/ipc.service';

interface LoginDialogProps {
  visible: boolean;
  onClose: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ visible, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await ipcService.login(username, password);
      if (res?.success && res?.data) {
        login(username, res.data.access_token, res.data.user);
        message.success('登录成功');
        onClose();
      } else {
        message.error(res?.message || '登录失败');
      }
    } catch {
      message.error('登录失败: 无法连接到服务器');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="登录"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={380}
      centered
      destroyOnClose
    >
      <div style={{ padding: '16px 0' }}>
        <Input
          prefix={<UserOutlined />}
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          size="large"
          style={{ marginBottom: 12 }}
          onPressEnter={handleLogin}
        />
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          size="large"
          style={{ marginBottom: 20 }}
          onPressEnter={handleLogin}
        />
        <Button
          type="primary"
          block
          size="large"
          loading={loading}
          onClick={handleLogin}
        >
          登 录
        </Button>
      </div>
    </Modal>
  );
};

export default LoginDialog;
