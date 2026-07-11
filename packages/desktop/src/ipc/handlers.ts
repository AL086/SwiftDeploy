import { BrowserWindow, IpcMain } from 'electron';
import { desktopConfig } from '../config';

interface HealthResponse {
  status: string;
  version: string;
  database: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const url = `${desktopConfig.serverUrl}/api${path}`;
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    return await res.json() as ApiResponse<T>;
  } catch (err) {
    return { success: false, message: String(err) };
  }
}

export function registerIpcHandlers(ipcMain: IpcMain): void {
  // Health
  ipcMain.handle('health:check', async () => {
    return fetchApi<HealthResponse>('/system/health');
  });

  // Host CRUD
  ipcMain.handle('host:list', async (_event, query?: any) => {
    const params = query ? '?' + new URLSearchParams(query).toString() : '';
    return fetchApi(`/hosts${params}`);
  });

  ipcMain.handle('host:get', async (_event, mac: string) => {
    return fetchApi(`/hosts/${mac}`);
  });

  ipcMain.handle('host:create', async (_event, data: any) => {
    return fetchApi('/hosts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  });

  ipcMain.handle('host:update', async (_event, mac: string, data: any) => {
    return fetchApi(`/hosts/${mac}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  });

  ipcMain.handle('host:delete', async (_event, mac: string) => {
    return fetchApi(`/hosts/${mac}`, { method: 'DELETE' });
  });

  // Blueprint CRUD
  ipcMain.handle('blueprint:list', async () => {
    return fetchApi('/blueprints');
  });

  ipcMain.handle('blueprint:get', async (_event, id: number) => {
    return fetchApi(`/blueprints/${id}`);
  });

  ipcMain.handle('blueprint:create', async (_event, data: any) => {
    return fetchApi('/blueprints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  });

  ipcMain.handle('blueprint:update', async (_event, id: number, data: any) => {
    return fetchApi(`/blueprints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  });

  ipcMain.handle('blueprint:delete', async (_event, id: number) => {
    return fetchApi(`/blueprints/${id}`, { method: 'DELETE' });
  });

  // Auth
  ipcMain.handle('auth:login', async (_event, username: string, password: string) => {
    return fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  });

  // Window controls
  ipcMain.on('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.minimize();
  });

  ipcMain.on('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.on('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.close();
  });
}
